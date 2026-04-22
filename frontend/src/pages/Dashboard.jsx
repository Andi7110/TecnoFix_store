import { Link } from "react-router-dom";
import { useMemo } from "react";
import DashboardMetricCards from "../components/dashboard/DashboardMetricCards";
import DashboardModulesTable from "../components/dashboard/DashboardModulesTable";
import { useDashboardSummary } from "../hooks/dashboard/useDashboardSummary";
import { Barcode, CalendarBlank, Pulse, Receipt, Screwdriver, Vault } from "../icons/phosphor";

function formatMoney(value) {
  return new Intl.NumberFormat("es-SV", {
    style: "currency",
    currency: "USD",
  }).format(Number(value ?? 0));
}

function buildAlerts(summary) {
  const alerts = [];

  if (Number(summary.today.productos_stock_bajo) > 0) {
    alerts.push({
      id: "stock",
      title: "Stock critico detectado",
      body: `${summary.today.productos_stock_bajo} productos necesitan reposicion o revision inmediata.`,
      tone: "warning",
      ctaLabel: "Ver productos",
      to: "/productos/inventario",
    });
  }

  if (Number(summary.today.reparaciones_pendientes) > 0) {
    alerts.push({
      id: "repairs",
      title: "Reparaciones pendientes en cola",
      body: `${summary.today.reparaciones_pendientes} equipos siguen pendientes de gestion o entrega.`,
      tone: "accent",
      ctaLabel: "Ver reparaciones",
      to: "/reparaciones",
    });
  }

  if (Number(summary.resumen_dia.modulos_con_ventas) === 0) {
    alerts.push({
      id: "sales",
      title: "Sin ventas registradas hoy",
      body: "Conviene revisar si el flujo de ventas del dia ya fue iniciado correctamente.",
      tone: "neutral",
      ctaLabel: "Ir a ventas",
      to: "/ventas",
    });
  }

  if (Number(summary.today.total_salidas) > Number(summary.today.total_entradas)) {
    alerts.push({
      id: "cash",
      title: "Salidas mayores que entradas",
      body: "Las salidas de caja del dia superan las entradas registradas hasta el momento.",
      tone: "warning",
      ctaLabel: "Revisar caja",
      to: "/caja",
    });
  }

  if (alerts.length === 0) {
    alerts.push({
      id: "healthy",
      title: "Operacion estable",
      body: "No se detectaron alertas criticas con la informacion consolidada de hoy.",
      tone: "success",
      ctaLabel: "Abrir dashboard",
      to: "/",
    });
  }

  return alerts;
}

function buildInsights(summary) {
  const topModulo = summary.ventas_por_modulo?.[0];

  return [
    {
      id: "ventas",
      title: "Ventas del dia",
      value: formatMoney(summary.today.total_vendido),
      body: topModulo
        ? `${topModulo.modulo_nombre} lidera con ${formatMoney(topModulo.total_vendido)}.`
        : "Aun no hay modulo lider registrado hoy.",
    },
    {
      id: "caja",
      title: "Balance de caja",
      value: formatMoney(summary.resumen_dia.balance_caja),
      body: `${formatMoney(summary.today.total_entradas)} en entradas y ${formatMoney(summary.today.total_salidas)} en salidas.`,
    },
    {
      id: "operacion",
      title: "Capacidad operativa",
      value: `${summary.resumen_dia.modulos_con_ventas} modulos activos`,
      body: `${summary.today.reparaciones_pendientes} reparaciones pendientes y ${summary.today.productos_stock_bajo} alertas de stock.`,
    },
  ];
}

function QuickAction({ title, description, to, tone = "default", icon }) {
  return (
    <Link to={to} className={`dashboard-quick-action dashboard-quick-action--${tone} h-100`}>
      <span className="dashboard-quick-action__symbol" aria-hidden="true">{icon}</span>
      <span className="dashboard-quick-action__copy">
        <span className="dashboard-quick-action__label">{title}</span>
        <span className="dashboard-quick-action__description">{description}</span>
      </span>
    </Link>
  );
}

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

function InsightCard({ insight }) {
  return (
    <article className="dashboard-insight-card h-100">
      <span className="muted-text">{insight.title}</span>
      <strong>{insight.value}</strong>
      <p>{insight.body}</p>
    </article>
  );
}

function ComparisonCard({ title, comparison, format = "money" }) {
  const delta = Number(comparison?.delta ?? 0);
  const positive = delta > 0;
  const negative = delta < 0;

  const formattedCurrent = format === "money"
    ? formatMoney(comparison?.actual)
    : String(comparison?.actual ?? 0);
  const formattedPrevious = format === "money"
    ? formatMoney(comparison?.anterior)
    : String(comparison?.anterior ?? 0);
  const formattedDelta = format === "money"
    ? formatMoney(Math.abs(delta))
    : String(Math.abs(delta));

  return (
    <article className={`dashboard-comparison-card h-100 ${positive ? "is-up" : negative ? "is-down" : "is-flat"}`}>
      <span className="muted-text">{title}</span>
      <strong>{formattedCurrent}</strong>
      <p>Ayer: {formattedPrevious}</p>
      <small>
        {positive ? "Subio" : negative ? "Bajo" : "Sin cambio"} {formattedDelta}
      </small>
    </article>
  );
}

function DashboardLoadingSkeleton() {
  return (
    <div className="dashboard-loading" aria-hidden="true">
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

      <div className="dashboard-insights-grid">
        {Array.from({ length: 3 }).map((_, index) => (
          <article key={`insight-${index}`} className="dashboard-insight-card dashboard-loading-card">
            <span className="dashboard-loading-line dashboard-loading-line--small" />
            <span className="dashboard-loading-line dashboard-loading-line--value" />
            <span className="dashboard-loading-line dashboard-loading-line--wide" />
          </article>
        ))}
      </div>

      <div className="dashboard-comparison-grid">
        {Array.from({ length: 4 }).map((_, index) => (
          <article key={`comparison-${index}`} className="dashboard-comparison-card dashboard-loading-card">
            <span className="dashboard-loading-line dashboard-loading-line--small" />
            <span className="dashboard-loading-line dashboard-loading-line--value" />
            <span className="dashboard-loading-line dashboard-loading-line--medium" />
            <span className="dashboard-loading-line dashboard-loading-line--small" />
          </article>
        ))}
      </div>

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
  const { summary, loading, error } = useDashboardSummary();
  const alerts = useMemo(() => buildAlerts(summary), [summary]);
  const insights = useMemo(() => buildInsights(summary), [summary]);
  const generatedAt = summary.generated_at ? new Date(summary.generated_at).toLocaleString() : "-";

  return (
    <section className="products-page dashboard-page container-fluid px-0">
      <div className="products-page__panel dashboard-command-center">
        <div className="products-page__header">
        <div className="row g-3 align-items-stretch w-100">
          <div className="col-12 col-xl-7">
              <div className="products-page__header-copy h-100">
                <div className="d-flex align-items-center gap-2 flex-wrap mb-2">
                    <span className="badge products-page__badge">Panel operativo</span>
                    <span className="badge products-page__badge products-page__badge--soft">
                      TecnoFix
                    </span>
                  </div>

                    <h2>Inicio TecnoFix</h2>
                    <p className="muted-text">
                      Supervisa ventas, caja, inventario y taller desde una sola vista operativa.
                    </p>
                  </div>
                </div>

          <div className="col-12 col-xl-5">
              <div className="products-page__header-actions dashboard-command-center__inline-status h-100 d-flex flex-column flex-sm-row gap-2 justify-content-xl-end align-items-stretch align-items-sm-center">
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
        </div>
        </div>
      </div>

      {error ? <div className="alert alert-danger">{error}</div> : null}

      {loading ? (
        <DashboardLoadingSkeleton />
      ) : (
        <>
          <div className="dashboard-actions-shell">
            <div className="row g-3">
              <div className="col-12 col-sm-6 col-xl-3">
                <QuickAction
                  title="Nueva venta"
                  description="Abre el flujo de caja y registra una venta nueva."
                  to="/ventas"
                  tone="primary"
                  icon={<Receipt size={22} weight="bold" />}
                />
              </div>
              <div className="col-12 col-sm-6 col-xl-3">
                <QuickAction
                  title="Nueva reparacion"
                  description="Ingresa un equipo, su diagnostico y condiciones iniciales."
                  to="/reparaciones/nueva"
                  icon={<Screwdriver size={22} weight="bold" />}
                />
              </div>
              <div className="col-12 col-sm-6 col-xl-3">
                <QuickAction
                  title="Registrar caja"
                  description="Agrega entradas o salidas y controla el balance operativo."
                  to="/caja/nuevo"
                  icon={<Vault size={22} weight="bold" />}
                />
              </div>
              <div className="col-12 col-sm-6 col-xl-3">
                <QuickAction
                  title="Nuevo producto"
                  description="Incorpora articulos al catalogo y define sus precios."
                  to="/productos/nuevo"
                  icon={<Barcode size={22} weight="bold" />}
                />
              </div>
            </div>
          </div>

          <div className="dashboard-subheading d-flex align-items-center">
            <h3>Detalles de la tienda</h3>
          </div>

          <DashboardMetricCards today={summary.today} />

          <div className="row g-3 mb-3">
            {alerts.map((alert) => (
              <div key={alert.id} className="col-12 col-lg-6">
                <AlertCard alert={alert} />
              </div>
            ))}
          </div>

          <div className="row g-3 mb-3">
            {insights.map((insight) => (
              <div key={insight.id} className="col-12 col-md-6 col-xl-4">
                <InsightCard insight={insight} />
              </div>
            ))}
          </div>

          <div className="row g-3 mb-3">
            <div className="col-12 col-sm-6 col-xl-3">
              <ComparisonCard title="Ventas vs ayer" comparison={summary.comparativo_vs_ayer.ventas} />
            </div>
            <div className="col-12 col-sm-6 col-xl-3">
              <ComparisonCard title="Entradas vs ayer" comparison={summary.comparativo_vs_ayer.entradas} />
            </div>
            <div className="col-12 col-sm-6 col-xl-3">
              <ComparisonCard title="Salidas vs ayer" comparison={summary.comparativo_vs_ayer.salidas} />
            </div>
            <div className="col-12 col-sm-6 col-xl-3">
              <ComparisonCard
                title="Reparaciones vs ayer"
                comparison={summary.comparativo_vs_ayer.reparaciones_pendientes}
                format="count"
              />
            </div>
          </div>

          <div className="row g-3">
            <div className="col-12">
              <DashboardModulesTable rows={summary.ventas_por_modulo} />
            </div>
          </div>
        </>
      )}
    </section>
  );
}

export default Dashboard;
