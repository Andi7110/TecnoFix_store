import { Link } from "react-router-dom";
import DashboardDaySummary from "../components/dashboard/DashboardDaySummary";
import DashboardMetricCards from "../components/dashboard/DashboardMetricCards";
import DashboardModulesTable from "../components/dashboard/DashboardModulesTable";
import { useDashboardSummary } from "../hooks/dashboard/useDashboardSummary";

function Dashboard() {
  const { summary, loading, error } = useDashboardSummary();

  return (
    <section>
      <div className="surface-card dashboard-hero">
        <p className="section-kicker">Panel principal</p>
        <h2>Operacion diaria de TecnoFix</h2>
        <p className="muted-text">
          El dashboard consume un solo endpoint agregado para mantener el frontend liviano.
        </p>
      </div>

      {error ? <div className="alert alert-danger">{error}</div> : null}

      {loading ? (
        <div className="surface-card">
          <p className="empty-state">Cargando resumen del dashboard...</p>
        </div>
      ) : (
        <>
          <DashboardMetricCards today={summary.today} />

          <div className="dashboard-bottom-grid">
            <DashboardModulesTable rows={summary.ventas_por_modulo} />
            <DashboardDaySummary
              resumen={summary.resumen_dia}
              generatedAt={summary.generated_at}
            />
          </div>
        </>
      )}

      <div className="dashboard-grid mt-4">
        <article className="surface-card dashboard-card">
          <p className="section-kicker">Inventario</p>
          <h3>Productos</h3>
          <p className="muted-text">
            Administra catalogo, precios, stock minimo y estado operativo.
          </p>
          <Link to="/productos" className="btn btn-primary">
            Ir a productos
          </Link>
        </article>

        <article className="surface-card dashboard-card">
          <p className="section-kicker">Taller</p>
          <h3>Reparaciones</h3>
          <p className="muted-text">
            Controla ingreso de equipos, diagnosticos, saldo y trazabilidad de estados.
          </p>
          <Link to="/reparaciones" className="btn btn-outline-dark">
            Ir a reparaciones
          </Link>
        </article>

        <article className="surface-card dashboard-card">
          <p className="section-kicker">Finanzas</p>
          <h3>Caja</h3>
          <p className="muted-text">
            Consulta entradas y salidas, filtra por categoria y revisa balance.
          </p>
          <Link to="/caja" className="btn btn-outline-dark">
            Ir a caja
          </Link>
        </article>
      </div>
    </section>
  );
}

export default Dashboard;
