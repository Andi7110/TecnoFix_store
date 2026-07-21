import { useMemo, useState } from "react";
import { Archive, CalendarBlank, CheckCircle, TrendDown, TrendUp, Wallet } from "../../icons/phosphor";
import { useCajaReports } from "../../hooks/caja/useCajaReports";

const MONTHS = [
  "Enero", "Febrero", "Marzo", "Abril", "Mayo", "Junio",
  "Julio", "Agosto", "Septiembre", "Octubre", "Noviembre", "Diciembre",
];

const CATEGORY_LABELS = {
  venta: "Ventas",
  gasto: "Gastos variables",
  costo_fijo: "Costos fijos",
  reparacion: "Reparaciones",
  retiro: "Retiros",
  ingreso_manual: "Otros ingresos",
  ajuste_caja: "Ajustes de caja",
  compra_productos: "Compra de productos",
  cuenta_por_cobrar: "Cobros pendientes",
};

function money(value) {
  return new Intl.NumberFormat("es-SV", { style: "currency", currency: "USD" }).format(Number(value ?? 0));
}

function dateTime(value) {
  if (!value) return "-";
  return new Intl.DateTimeFormat("es-SV", { dateStyle: "medium", timeStyle: "short" }).format(new Date(value));
}

function MetricCard({ icon, label, value, help, tone = "neutral" }) {
  return (
    <article className={`cash-report-metric cash-report-metric--${tone}`}>
      <span className="cash-report-metric__icon">{icon}</span>
      <div>
        <span>{label}</span>
        <strong>{value}</strong>
        <small>{help}</small>
      </div>
    </article>
  );
}

function ReportContent({ report }) {
  const summary = report?.resumen ?? {};
  const maxDaily = useMemo(
    () => Math.max(...(report?.evolucion_diaria ?? []).flatMap((day) => [Number(day.entradas), Number(day.salidas)]), 1),
    [report],
  );

  if (!report) return null;

  return (
    <div className="cash-report-workspace">
      <div className={`cash-report-result ${Number(summary.resultado_neto) >= 0 ? "is-positive" : "is-negative"}`}>
        <div>
          <span>Resultado del mes</span>
          <strong>{money(summary.resultado_neto)}</strong>
        </div>
        <p>
          {Number(summary.resultado_neto) >= 0
            ? "Las entradas superaron las salidas durante este periodo."
            : "Las salidas superaron las entradas; revisa el desglose de gastos y costos."}
        </p>
      </div>

      <div className="cash-report-metrics">
        <MetricCard icon={<TrendUp size={22} />} label="Entradas" value={money(summary.entradas)} help="Dinero recibido en caja" tone="positive" />
        <MetricCard icon={<TrendDown size={22} />} label="Salidas" value={money(summary.salidas)} help="Dinero pagado desde caja" tone="negative" />
        <MetricCard icon={<Wallet size={22} />} label="Ventas" value={money(summary.ventas)} help={`${summary.ventas_count ?? 0} ventas registradas`} />
        <MetricCard icon={<Archive size={22} />} label="Costo de ventas" value={money(summary.costo_ventas)} help="Costo del inventario vendido" />
        <MetricCard icon={<Archive size={22} />} label="Costos operativos" value={money(summary.costos_operativos)} help="Costos registrados en el módulo" />
        <MetricCard icon={<CheckCircle size={22} />} label="Utilidad bruta" value={money(summary.utilidad_bruta_ventas)} help="Ventas menos costo del producto" tone="positive" />
      </div>

      <div className="cash-report-grid">
        <section className="surface-card cash-report-panel">
          <div className="cash-report-panel__header">
            <div><h3>Entradas y salidas</h3><p>Detalle agrupado por categoría.</p></div>
          </div>
          <div className="table-responsive">
            <table className="table cash-report-table">
              <thead><tr><th>Tipo</th><th>Categoría</th><th>Mov.</th><th>Total</th></tr></thead>
              <tbody>
                {(report.desglose ?? []).length > 0 ? report.desglose.map((row) => (
                  <tr key={`${row.tipo}-${row.categoria}`}>
                    <td><span className={`cash-report-type cash-report-type--${row.tipo}`}>{row.tipo}</span></td>
                    <td>{CATEGORY_LABELS[row.categoria] ?? row.categoria}</td>
                    <td>{row.cantidad}</td>
                    <td><strong>{money(row.total)}</strong></td>
                  </tr>
                )) : <tr><td colSpan={4} className="text-center muted-text">No hay movimientos en este mes.</td></tr>}
              </tbody>
            </table>
          </div>
        </section>

        <section className="surface-card cash-report-panel">
          <div className="cash-report-panel__header">
            <div><h3>Comportamiento diario</h3><p>Días con actividad de caja.</p></div>
          </div>
          <div className="cash-report-days">
            {(report.evolucion_diaria ?? []).length > 0 ? report.evolucion_diaria.map((day) => (
              <div className="cash-report-day" key={day.fecha}>
                <span>{new Intl.DateTimeFormat("es-SV", { day: "2-digit", month: "short" }).format(new Date(`${day.fecha}T12:00:00`))}</span>
                <div className="cash-report-day__bars">
                  <i className="is-entry" style={{ width: `${(Number(day.entradas) / maxDaily) * 100}%` }} />
                  <i className="is-exit" style={{ width: `${(Number(day.salidas) / maxDaily) * 100}%` }} />
                </div>
                <strong>{money(day.neto)}</strong>
              </div>
            )) : <p className="muted-text">No hay actividad diaria para mostrar.</p>}
          </div>
          <div className="cash-report-legend"><span><i className="is-entry" /> Entradas</span><span><i className="is-exit" /> Salidas</span></div>
        </section>
      </div>
    </div>
  );
}

function CajaReportesPage() {
  const reports = useCajaReports();
  const [section, setSection] = useState("report");
  const years = Array.from({ length: 8 }, (_, index) => new Date().getFullYear() - index);

  function viewClosure(item) {
    reports.showSavedClosure(item);
    setSection("report");
  }

  return (
    <section className="products-page products-page--minimal cash-page cash-reports-page">
      <div className="products-page__header products-page__header--minimal">
        <div><p className="section-kicker">Caja</p><h2>Reportes y cierres mensuales</h2><p className="muted-text">Entiende cuánto entró, cuánto salió y cuál fue el resultado real de cada mes.</p></div>
      </div>

      <div className="cash-report-tabs">
        <button type="button" className={section === "report" ? "is-active" : ""} onClick={() => setSection("report")}>Reporte mensual</button>
        <button type="button" className={section === "history" ? "is-active" : ""} onClick={() => setSection("history")}>Historial de cierres</button>
      </div>

      {section === "report" ? (
        <>
          <section className="surface-card cash-report-controls">
            <div className="cash-report-controls__title"><CalendarBlank size={24} /><div><h3>Selecciona el periodo</h3><p>Genera el resumen antes de guardar el cierre.</p></div></div>
            <div className="cash-report-controls__fields">
              <select className="form-select" value={reports.filters.mes} onChange={(event) => reports.updateFilter("mes", event.target.value)}>
                {MONTHS.map((month, index) => <option key={month} value={index + 1}>{month}</option>)}
              </select>
              <select className="form-select" value={reports.filters.anio} onChange={(event) => reports.updateFilter("anio", event.target.value)}>
                {years.map((year) => <option key={year} value={year}>{year}</option>)}
              </select>
              <button type="button" className="btn cash-report-action cash-report-action--generate" onClick={reports.generate}>Generar</button>
              <button type="button" className="btn cash-report-action cash-report-action--close" onClick={reports.closeMonth} disabled={!reports.report || reports.loading || reports.closing || Boolean(reports.report?.cierre)}>
                {reports.report?.cierre ? "Mes cerrado" : reports.closing ? "Guardando..." : "Guardar cierre"}
              </button>
            </div>
          </section>

          {reports.report?.cierre ? <div className="cash-report-closed"><CheckCircle size={19} weight="fill" /> Cierre guardado el {dateTime(reports.report.cierre.cerrado_en)}. El historial conserva la fotografía de ese momento.</div> : null}
          {reports.error ? <div className="alert alert-danger">{reports.error}</div> : null}
          {reports.loading ? <div className="cash-report-loading">Generando reporte mensual...</div> : <ReportContent report={reports.report} />}
        </>
      ) : (
        <section className="surface-card cash-report-panel cash-report-history">
          <div className="cash-report-panel__header"><div><h3>Historial de cierres</h3><p>Reportes mensuales guardados de forma permanente.</p></div></div>
          {reports.historyError ? <div className="alert alert-danger">{reports.historyError}</div> : null}
          {reports.historyLoading ? <div className="cash-report-loading">Cargando historial...</div> : (
            <div className="table-responsive"><table className="table cash-report-table"><thead><tr><th>Periodo</th><th>Entradas</th><th>Salidas</th><th>Resultado</th><th>Cerrado por</th><th></th></tr></thead><tbody>
              {reports.history.length > 0 ? reports.history.map((item) => (
                <tr key={item.id}><td><strong>{item.payload?.periodo?.etiqueta ?? item.titulo}</strong></td><td>{money(item.payload?.resumen?.entradas)}</td><td>{money(item.payload?.resumen?.salidas)}</td><td className={Number(item.payload?.resumen?.resultado_neto) >= 0 ? "text-success" : "text-danger"}><strong>{money(item.payload?.resumen?.resultado_neto)}</strong></td><td>{item.generado_por_usuario?.name ?? "Sistema"}<small>{dateTime(item.created_at)}</small></td><td><button type="button" className="btn btn-sm btn-outline-success" onClick={() => viewClosure(item)}>Ver cierre</button></td></tr>
              )) : <tr><td colSpan={6} className="text-center muted-text">Todavía no hay cierres mensuales guardados.</td></tr>}
            </tbody></table></div>
          )}
        </section>
      )}
    </section>
  );
}

export default CajaReportesPage;
