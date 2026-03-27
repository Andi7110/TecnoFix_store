import { useState } from "react";
import VentasReportsPanel from "../../components/ventas/VentasReportsPanel";
import { useProductoCatalogos } from "../../hooks/productos/useProductoCatalogos";
import { useVentasReports } from "../../hooks/ventas/useVentasReports";

function VentasReportesPage() {
  const reports = useVentasReports();
  const [dailyFilters, setDailyFilters] = useState(reports.initialFilters.daily);
  const [monthlyFilters, setMonthlyFilters] = useState(reports.initialFilters.monthly);
  const { modulos } = useProductoCatalogos("", true);

  function updateDailyFilter(name, value) {
    setDailyFilters((current) => ({
      ...current,
      [name]: value,
    }));
  }

  function updateMonthlyFilter(name, value) {
    setMonthlyFilters((current) => ({
      ...current,
      [name]: value,
    }));
  }

  return (
    <section>
      <div className="products-page__header">
        <div>
          <p className="section-kicker">Ventas</p>
          <h2>Reportes de ventas</h2>
          <p className="muted-text">
            Genera cierres diarios, estados mensuales y consulta el historial de reportes guardados.
          </p>
        </div>
      </div>

      <VentasReportsPanel
        modulos={modulos}
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

export default VentasReportesPage;
