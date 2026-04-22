import { useMemo, useState } from "react";
import { Link } from "react-router-dom";
import VentasReportsPanel from "../../components/ventas/VentasReportsPanel";
import { useProductoCatalogos } from "../../hooks/productos/useProductoCatalogos";
import { useVentasReports } from "../../hooks/ventas/useVentasReports";

function VentasReportesPage() {
  const reports = useVentasReports();
  const [dailyFilters, setDailyFilters] = useState(reports.initialFilters.daily);
  const [monthlyFilters, setMonthlyFilters] = useState(reports.initialFilters.monthly);
  const { modulos } = useProductoCatalogos("", true);
  const reportModules = useMemo(
    () =>
      modulos.filter((modulo) => {
        const normalizedName = String(modulo?.nombre ?? "")
          .normalize("NFD")
          .replace(/[\u0300-\u036f]/g, "")
          .trim()
          .toLowerCase();

        return normalizedName !== "bitacora";
      }),
    [modulos],
  );

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
    <section className="products-page ventas-page ventas-reportes-page container-fluid px-0">
      <div className="products-page__panel ventas-page__panel">
        <div className="products-page__header">
          <div className="row g-3 align-items-stretch w-100">
            <div className="col-12 col-xl-7">
              <div className="products-page__header-copy h-100">
                <div className="d-flex align-items-center gap-2 flex-wrap mb-2">
                  <span className="badge products-page__badge">Ventas</span>
                  <span className="badge products-page__badge products-page__badge--soft">
                    Reportes
                  </span>
                </div>
                <h2>Reportes de ventas</h2>
                <p className="muted-text">
                  Genera cierres diarios, estados mensuales y consulta el historial de reportes guardados.
                </p>
              </div>
            </div>

            <div className="col-12 col-xl-5">
              <div className="products-page__header-actions h-100 d-flex flex-column flex-sm-row gap-2 justify-content-xl-end align-items-stretch align-items-sm-center">
                <Link to="/ventas" className="btn products-page__inventory-btn">
                  Historial ventas
                </Link>
              </div>
            </div>
          </div>
        </div>
      </div>

      <VentasReportsPanel
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

export default VentasReportesPage;
