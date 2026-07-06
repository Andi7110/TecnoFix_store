import { Link } from "react-router-dom";
import { useMemo, useState } from "react";
import DashboardMetricCards from "../components/dashboard/DashboardMetricCards";
import DashboardModulesTable from "../components/dashboard/DashboardModulesTable";
import CrearMovimientoCajaModal from "../components/caja/CrearMovimientoCajaModal";
import CrearProductoModal from "../components/productos/CrearProductoModal";
import CrearReparacionModal from "../components/reparaciones/CrearReparacionModal";
import CrearVentaModal from "../components/ventas/CrearVentaModal";
import { useAuth } from "../hooks/auth/useAuth";
import { useDashboardSummary } from "../hooks/dashboard/useDashboardSummary";
import { CashRegister, CalendarBlank, DeviceMobileCamera, Package, Pulse, ShoppingCartSimple } from "../icons/phosphor";
import { canAccessModule } from "../utils/accessControl";
import { notifySuccess } from "../utils/toasts";

// Alerta que se muestra cuando el resumen del dia no reporta problemas.
const DEFAULT_ALERT = {
  id: "healthy",
  title: "Operacion estable",
  body: "No se detectaron alertas criticas con la informacion consolidada de hoy.",
  tone: "success",
  ctaLabel: "Abrir dashboard",
  to: "/",
  module: "dashboard",
};

// Convierte los datos del resumen en alertas visibles para el usuario.
function buildAlerts(summary, user) {
  // Extrae los valores usados por las reglas para evitar repetir rutas largas.
  const {
    today: {
      productos_stock_bajo: stockBajo,
      reparaciones_pendientes: reparacionesPendientes,
      total_entradas: totalEntradas,
      total_salidas: totalSalidas,
    },
    resumen_dia: {
      modulos_con_ventas: modulosConVentas,
    },
  } = summary;

  // Cada regla define cuándo aparece una alerta y qué informacion muestra.
  const alertRules = [
    {
      active: Number(stockBajo) > 0,
      alert: {
        id: "stock",
        title: "Stock critico detectado",
        body: `${stockBajo} productos necesitan reposicion o revision inmediata.`,
        tone: "warning",
        ctaLabel: "Ver productos",
        to: "/productos/inventario",
        module: "inventario",
      },
    },
    {
      active: Number(reparacionesPendientes) > 0,
      alert: {
        id: "repairs",
        title: "Reparaciones pendientes en cola",
        body: `${reparacionesPendientes} equipos siguen pendientes de gestion o entrega.`,
        tone: "accent",
        ctaLabel: "Ver reparaciones",
        to: "/reparaciones",
        module: "reparaciones",
      },
    },
    {
      active: Number(modulosConVentas) === 0,
      alert: {
        id: "sales",
        title: "Sin ventas registradas hoy",
        body: "Conviene revisar si el flujo de ventas del dia ya fue iniciado correctamente.",
        tone: "neutral",
        ctaLabel: "Ir a ventas",
        to: "/ventas",
        module: "ventas",
      },
    },
    {
      active: Number(totalSalidas) > Number(totalEntradas),
      alert: {
        id: "cash",
        title: "Salidas mayores que entradas",
        body: "Las salidas de caja del dia superan las entradas registradas hasta el momento.",
        tone: "warning",
        ctaLabel: "Revisar caja",
        to: "/caja",
        module: "caja",
      },
    },
  ];

  const alerts = alertRules
    .filter(({ active, alert }) => active && canAccessModule(user, alert.module))
    .map(({ alert }) => alert);

  // Si ninguna regla se activa, el dashboard muestra una alerta positiva.
  return alerts.length > 0 ? alerts : [DEFAULT_ALERT];
}

// Boton de acceso rapido a flujos principales del sistema.
function QuickAction({ title, description, to, tone = "default", icon, onClick }) {
  const className = `dashboard-quick-action dashboard-quick-action--${tone} card border-0 shadow-sm h-100`;
  const content = (
    <>
      <span className="dashboard-quick-action__symbol" aria-hidden="true">{icon}</span>
      <span className="dashboard-quick-action__copy">
        <span className="dashboard-quick-action__label">{title}</span>
        <span className="dashboard-quick-action__description">{description}</span>
      </span>
    </>
  );

  if (onClick) {
    return (
      <button type="button" className={className} onClick={onClick}>
        {content}
      </button>
    );
  }

  return (
    <Link to={to} className={className}>
      {content}
    </Link>
  );
}

// Card reutilizable para cada alerta operativa del dashboard.
function AlertCard({ alert }) {
  return (
    <article className={`dashboard-alert-card dashboard-alert-card--${alert.tone} dashboard-alert-card--${alert.id} h-100`}>
      <span className="dashboard-alert-card__marker" aria-hidden="true" />
      <div>
        <strong>{alert.title}</strong>
        <p>{alert.body}</p>
      </div>
      <Link to={alert.to} className="btn btn-sm btn-outline-dark">
        {alert.ctaLabel}
      </Link>
    </article>
  );
}

// Estructura temporal que se muestra mientras carga el resumen del dashboard.
function DashboardLoadingSkeleton() {
  return (
    <div className="dashboard-loading" aria-hidden="true">
      {/* Placeholder de acciones rapidas. */}
      <div className="dashboard-actions-shell">
        <div className="dashboard-actions-grid">
          {Array.from({ length: 4 }).map((_, index) => (
            <div key={`action-${index}`} className="dashboard-loading-card dashboard-loading-card--action">
              <span className="dashboard-loading-line dashboard-loading-line--icon" />
              <span className="dashboard-loading-line dashboard-loading-line--label" />
            </div>
          ))}
        </div>
      </div>

      {/* Placeholder de cards de metricas. */}
      <div className="dashboard-metrics-grid">
        {Array.from({ length: 5 }).map((_, index) => (
          <article key={`metric-${index}`} className="surface-card dashboard-metric-card dashboard-loading-card">
            <div>
              <span className="dashboard-loading-line dashboard-loading-line--small" />
              <span className="dashboard-loading-line dashboard-loading-line--value" />
            </div>
            <span className="dashboard-loading-line dashboard-loading-line--medium" />
          </article>
        ))}
      </div>

      {/* Placeholder de alertas operativas. */}
      <div className="dashboard-alerts-grid">
        {Array.from({ length: 2 }).map((_, index) => (
          <article key={`alert-${index}`} className="dashboard-alert-card dashboard-loading-card">
            <div>
              <span className="dashboard-loading-line dashboard-loading-line--medium" />
              <span className="dashboard-loading-line dashboard-loading-line--wide" />
            </div>
            <span className="dashboard-loading-line dashboard-loading-line--button" />
          </article>
        ))}
      </div>

      {/* Placeholder de tabla de ventas por modulo. */}
      <div className="dashboard-bottom-grid">
        <div className="surface-card dashboard-section-card dashboard-loading-table">
          <div className="section-heading">
            <div>
              <span className="dashboard-loading-line dashboard-loading-line--small" />
              <span className="dashboard-loading-line dashboard-loading-line--medium" />
            </div>
          </div>
          <div className="table-responsive mt-3">
            <table className="table align-middle repairs-table">
              <thead>
                <tr>
                  <th>Modulo</th>
                  <th>Ventas</th>
                  <th className="text-end">Total vendido</th>
                </tr>
              </thead>
              <tbody>
                {Array.from({ length: 4 }).map((_, index) => (
                  <tr key={`row-${index}`}>
                    <td><span className="dashboard-loading-line dashboard-loading-line--medium" /></td>
                    <td><span className="dashboard-loading-line dashboard-loading-line--small" /></td>
                    <td className="text-end"><span className="dashboard-loading-line dashboard-loading-line--medium dashboard-loading-line--inline-end" /></td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
}

function Dashboard() {
  const [isCreateSaleModalOpen, setIsCreateSaleModalOpen] = useState(false);
  const [isCreateRepairModalOpen, setIsCreateRepairModalOpen] = useState(false);
  const [isCreateCashModalOpen, setIsCreateCashModalOpen] = useState(false);
  const [isCreateProductModalOpen, setIsCreateProductModalOpen] = useState(false);
  const { user } = useAuth();
  // Hook encargado de traer el resumen consolidado desde la API.
  const { summary, loading, error, reload } = useDashboardSummary();

  // useMemo evita recalcular alertas si el resumen no cambio.
  const alerts = useMemo(() => buildAlerts(summary, user), [summary, user]);
  const generatedAt = summary.generated_at ? new Date(summary.generated_at).toLocaleString() : "-";

  function handleVentaCreated(venta) {
    reload();
    notifySuccess(
      venta?.numero_venta
        ? `Venta ${venta.numero_venta} registrada exitosamente.`
        : "Venta registrada exitosamente.",
    );
  }

  function handleReparacionCreated(reparacion) {
    reload();
    notifySuccess(
      reparacion?.codigo_reparacion
        ? `Reparacion ${reparacion.codigo_reparacion} registrada exitosamente.`
        : "Reparacion registrada exitosamente.",
    );
  }

  function handleMovimientoCajaCreated() {
    reload();
    notifySuccess("Movimiento de caja registrado exitosamente.");
  }

  function handleProductoCreated() {
    reload();
    notifySuccess("Producto registrado correctamente.");
  }

  return (
    <section className="products-page dashboard-page">
      {/* Encabezado principal y estado operativo del dashboard. */}
      <div className="products-page__header dashboard-page__header">
        <div>
          <p className="section-kicker">Inicio</p>
          <h2>Panel operativo</h2>
          <p className="muted-text">
            Supervisa ventas, caja, inventario y taller desde una sola vista operativa.
          </p>
        </div>

        <div className="dashboard-command-center__inline-status">
          <div className="dashboard-command-center__inline-item">
            <span className="dashboard-command-center__icon" aria-hidden="true">
              <Pulse size={18} weight="bold" />
            </span>
            <div>
              <span className="muted-text">Estado</span>
              <strong>En linea</strong>
            </div>
          </div>

          <div className="dashboard-command-center__inline-item">
            <span className="dashboard-command-center__icon" aria-hidden="true">
              <CalendarBlank size={18} weight="bold" />
            </span>
            <div>
              <span className="muted-text">Actualizado</span>
              <strong>{generatedAt}</strong>
            </div>
          </div>
        </div>
      </div>

      {error ? <div className="alert alert-danger">{error}</div> : null}

      {/* Mientras carga la API, se muestra el skeleton. */}
      {loading ? (
        <DashboardLoadingSkeleton />
      ) : (
        <>
          {/* Accesos directos a las acciones mas usadas. */}
          <div className="dashboard-actions-shell">
            <div className="row g-3">
              {canAccessModule(user, "ventas") ? (
                <div className="col-12 col-sm-6 col-xl-3">
                  <QuickAction
                    title="Ventas"
                    description="Registrar nueva venta de productos"
                    tone="primary"
                    icon={<ShoppingCartSimple size={24} weight="duotone" />}
                    onClick={() => setIsCreateSaleModalOpen(true)}
                  />
                </div>
              ) : null}
              {canAccessModule(user, "reparaciones") ? (
                <div className="col-12 col-sm-6 col-xl-3">
                  <QuickAction
                    title="Reparacion"
                    description="Registrar nuevo dispositivo movil"
                    tone="repair"
                    icon={<DeviceMobileCamera size={24} weight="duotone" />}
                    onClick={() => setIsCreateRepairModalOpen(true)}
                  />
                </div>
              ) : null}
              {canAccessModule(user, "caja") ? (
                <div className="col-12 col-sm-6 col-xl-3">
                  <QuickAction
                    title="Movimientos de caja"
                    description="Registrar entradas y salidas de caja"
                    onClick={() => setIsCreateCashModalOpen(true)}
                    tone="cash"
                    icon={<CashRegister size={24} weight="duotone" />}
                  />
                </div>
              ) : null}
              {canAccessModule(user, "inventario") ? (
                <div className="col-12 col-sm-6 col-xl-3">
                  <QuickAction
                    title="Productos"
                    description="Registrar nuevo producto"
                    onClick={() => setIsCreateProductModalOpen(true)}
                    tone="product"
                    icon={<Package size={24} weight="duotone" />}
                  />
                </div>
              ) : null}
            </div>
          </div>

          {/* Metricas principales del dia. */}
          <div className="dashboard-subheading d-flex align-items-center">
            <h3>Resumen del dia</h3>
          </div>

          <DashboardMetricCards today={summary.today} />

          {/* Alertas calculadas desde buildAlerts. */}
          <div className="row g-3 mb-3">
            {alerts.map((alert) => (
              <div key={alert.id} className="col-12 col-lg-6">
                <AlertCard alert={alert} />
              </div>
            ))}
          </div>

          {/* Tabla con ventas agrupadas por modulo. */}
          <div className="row g-3">
            <div className="col-12">
              <DashboardModulesTable rows={summary.ventas_por_modulo} />
            </div>
          </div>
        </>
      )}

      {isCreateSaleModalOpen ? (
        <CrearVentaModal
          onClose={() => setIsCreateSaleModalOpen(false)}
          onCreated={handleVentaCreated}
        />
      ) : null}

      {isCreateRepairModalOpen ? (
        <CrearReparacionModal
          onClose={() => setIsCreateRepairModalOpen(false)}
          onCreated={handleReparacionCreated}
        />
      ) : null}

      {isCreateCashModalOpen ? (
        <CrearMovimientoCajaModal
          onClose={() => setIsCreateCashModalOpen(false)}
          onCreated={handleMovimientoCajaCreated}
        />
      ) : null}

      {isCreateProductModalOpen ? (
        <CrearProductoModal
          onClose={() => setIsCreateProductModalOpen(false)}
          onCreated={handleProductoCreated}
        />
      ) : null}

    </section>
  );
}

export default Dashboard;
