import { useMemo, useState } from "react";
import { Link } from "react-router-dom";
import ReparacionesReportsPanel from "../../components/reparaciones/ReparacionesReportsPanel";
import { useProductoCatalogos } from "../../hooks/productos/useProductoCatalogos";
import { useReparacionesReports } from "../../hooks/reparaciones/useReparacionesReports";

function ReparacionesReportesPage() {
  const reports = useReparacionesReports();
  const [dailyFilters, setDailyFilters] = useState(reports.initialFilters.daily);
  const [monthlyFilters, setMonthlyFilters] = useState(reports.initialFilters.monthly);
  const { modulos } = useProductoCatalogos("", true);
  const reportModules = useMemo(
    () => modulos.filter((modulo) => String(modulo?.nombre ?? "").toLowerCase() !== "bitacora"),
    [modulos],
  );

  function updateDailyFilter(name, value) {
    setDailyFilters((current) => ({ ...current, [name]: value }));
  }

  function updateMonthlyFilter(name, value) {
    setMonthlyFilters((current) => ({ ...current, [name]: value }));
  }

  return (
    <section className="products-page repairs-page repairs-reportes-page products-page--minimal">
      <div className="products-page__header products-page__header--minimal">
        <div>
          <p className="section-kicker">Taller</p>
          <h2>Reportes de reparaciones</h2>
          <p className="muted-text">
            Analiza ingresos, entregas, saldos pendientes y productividad del taller.
          </p>
        </div>

        <div className="products-page__header-actions repairs-page__header-actions">
          <Link to="/reparaciones" className="btn products-page__inventory-btn">
            Gestion reparaciones
          </Link>
        </div>
      </div>

      <ReparacionesReportsPanel
        modulos={reportModules}
        dailyValues={dailyFilters}
        onDailyChange={updateDailyFilter}
        onDailySubmit={() => reports.generateDailyReport(dailyFilters)}
        onDailySave={() => reports.saveDailyReport(dailyFilters)}
        dailyReport={reports.dailyReport}
        dailyLoading={reports.dailyLoading}
        dailyError={reports.dailyError}
        dailySaving={reports.dailySaving}
        monthlyValues={monthlyFilters}
        onMonthlyChange={updateMonthlyFilter}
        onMonthlySubmit={() => reports.generateMonthlyReport(monthlyFilters)}
        onMonthlySave={() => reports.saveMonthlyReport(monthlyFilters)}
        monthlyReport={reports.monthlyReport}
        monthlyLoading={reports.monthlyLoading}
        monthlyError={reports.monthlyError}
        monthlySaving={reports.monthlySaving}
        history={reports.history}
        historyLoading={reports.historyLoading}
        historyError={reports.historyError}
      />
    </section>
  );
}

export default ReparacionesReportesPage;
