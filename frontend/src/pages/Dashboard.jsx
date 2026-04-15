import { Link } from "react-router-dom";
import { useMemo } from "react";
import DashboardMetricCards from "../components/dashboard/DashboardMetricCards";
import DashboardModulesTable from "../components/dashboard/DashboardModulesTable";
import { useDashboardSummary } from "../hooks/dashboard/useDashboardSummary";
import { Money, Package, ShoppingCart, Wrench } from "../icons/phosphor";

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
    <Link to={to} className={`dashboard-quick-action dashboard-quick-action--${tone}`}>
      <span className="dashboard-quick-action__symbol" aria-hidden="true">{icon}</span>
      <span className="dashboard-quick-action__label">{title}</span>
    </Link>
  );
}

function AlertCard({ alert }) {
  return (
    <article className={`dashboard-alert-card dashboard-alert-card--${alert.tone} dashboard-alert-card--${alert.id}`}>
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
    <article className="dashboard-insight-card">
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
    <article className={`dashboard-comparison-card ${positive ? "is-up" : negative ? "is-down" : "is-flat"}`}>
      <span className="muted-text">{title}</span>
      <strong>{formattedCurrent}</strong>
      <p>Ayer: {formattedPrevious}</p>
      <small>
        {positive ? "Subio" : negative ? "Bajo" : "Sin cambio"} {formattedDelta}
      </small>
    </article>
  );
}

function Dashboard() {
  const { summary, loading, error } = useDashboardSummary();
  const alerts = useMemo(() => buildAlerts(summary), [summary]);
  const insights = useMemo(() => buildInsights(summary), [summary]);

  return (
    <section className="dashboard-page">
      <div className="products-page__header dashboard-command-center">
        <div>
          <p className="section-kicker">Dashboard</p>
          <h2>Operacion diaria de TecnoFix</h2>
          <p className="muted-text">
            Supervisa ventas, caja, inventario y taller desde una sola vista operativa.
          </p>
        </div>

        <div className="products-page__header-actions dashboard-command-center__meta">
          <div>
            <span className="muted-text">Actualizado</span>
            <strong>{summary.generated_at ? new Date(summary.generated_at).toLocaleString() : "-"}</strong>
          </div>
        </div>
      </div>

      {error ? <div className="alert alert-danger">{error}</div> : null}

      {loading ? (
        <div className="surface-card">
          <p className="empty-state">Cargando resumen del dashboard...</p>
        </div>
      ) : (
        <>
          <div className="dashboard-actions-shell">
            <div className="dashboard-actions-grid">
              <QuickAction
                title="Nueva venta"
                description="Abre el flujo de caja y registra una venta nueva."
                to="/ventas"
                tone="primary"
                icon={<ShoppingCart size={22} weight="bold" />}
              />
              <QuickAction
                title="Nueva reparacion"
                description="Ingresa un equipo, su diagnostico y condiciones iniciales."
                to="/reparaciones/nueva"
                icon={<Wrench size={22} weight="bold" />}
              />
              <QuickAction
                title="Registrar caja"
                description="Agrega entradas o salidas y controla el balance operativo."
                to="/caja/nuevo"
                icon={<Money size={22} weight="bold" />}
              />
              <QuickAction
                title="Nuevo producto"
                description="Incorpora articulos al catalogo y define sus precios."
                to="/productos/nuevo"
                icon={<Package size={22} weight="bold" />}
              />
            </div>
          </div>

          <DashboardMetricCards today={summary.today} />

          <div className="dashboard-alerts-grid">
            {alerts.map((alert) => (
              <AlertCard key={alert.id} alert={alert} />
            ))}
          </div>

          <div className="dashboard-insights-grid">
            {insights.map((insight) => (
              <InsightCard key={insight.id} insight={insight} />
            ))}
          </div>

          <div className="dashboard-comparison-grid">
            <ComparisonCard title="Ventas vs ayer" comparison={summary.comparativo_vs_ayer.ventas} />
            <ComparisonCard title="Entradas vs ayer" comparison={summary.comparativo_vs_ayer.entradas} />
            <ComparisonCard title="Salidas vs ayer" comparison={summary.comparativo_vs_ayer.salidas} />
            <ComparisonCard
              title="Reparaciones vs ayer"
              comparison={summary.comparativo_vs_ayer.reparaciones_pendientes}
              format="count"
            />
          </div>

          <div className="dashboard-bottom-grid">
            <DashboardModulesTable rows={summary.ventas_por_modulo} />
          </div>
        </>
      )}
    </section>
  );
}

export default Dashboard;
