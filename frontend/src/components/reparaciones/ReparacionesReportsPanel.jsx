import { useState } from "react";
import ReportPreviewModal from "../reportes/ReportPreviewModal";

const MONTH_LABELS = ["Enero", "Febrero", "Marzo", "Abril", "Mayo", "Junio", "Julio", "Agosto", "Septiembre", "Octubre", "Noviembre", "Diciembre"];

function formatCurrency(value) {
  return new Intl.NumberFormat("es-SV", { style: "currency", currency: "USD" }).format(Number(value ?? 0));
}

function formatPercent(value) {
  return `${Number(value ?? 0).toFixed(2)}%`;
}

function normalizeDateTime(value) {
  if (!value || typeof value !== "string") return value;
  return value.includes("T") ? value : value.replace(" ", "T");
}

function normalizeDateOnly(value) {
  if (!value || typeof value !== "string") return value;
  return /^\d{4}-\d{2}-\d{2}$/.test(value) ? `${value}T00:00:00` : normalizeDateTime(value);
}

function formatDateTime(value) {
  if (!value) return "-";
  return new Intl.DateTimeFormat("es-SV", { dateStyle: "medium", timeStyle: "short" }).format(new Date(normalizeDateTime(value)));
}

function formatDate(value) {
  if (!value) return "-";
  return new Intl.DateTimeFormat("es-SV", { dateStyle: "medium" }).format(new Date(normalizeDateOnly(value)));
}

function formatLabel(value) {
  return String(value ?? "").replace(/_/g, " ").replace(/\b\w/g, (char) => char.toUpperCase());
}

function Tabs({ value, onChange, options }) {
  return (
    <div className="ventas-report-tabs ventas-report-tabs--simple">
      {options.map((option) => (
        <button
          key={option.value}
          type="button"
          className={`ventas-report-tabs__item ${value === option.value ? "is-active" : ""}`}
          onClick={() => onChange(option.value)}
        >
          {option.label}
        </button>
      ))}
    </div>
  );
}

function EmptyRow({ colSpan, children }) {
  return (
    <tr>
      <td colSpan={colSpan} className="muted-text text-center">
        {children}
      </td>
    </tr>
  );
}

function ReportLoading() {
  return (
    <div className="ventas-report-simple__loading" aria-live="polite">
      Cargando reporte...
    </div>
  );
}

function SummaryTable({ report }) {
  const resumen = report.resumen ?? {};
  const rows = [
    ["Reparaciones entregadas", Number(resumen.entregadas ?? 0)],
    ["Valor entregado", formatCurrency(resumen.valor_entregado)],
    ["Costos de esas reparaciones", formatCurrency(resumen.costos_entregadas)],
    ["Utilidad obtenida", formatCurrency(resumen.utilidad_entregadas ?? resumen.utilidad_reparaciones)],
    ["Margen utilidad", formatPercent(resumen.margen_utilidad_porcentaje)],
    ["Ingresos en caja del periodo", formatCurrency(resumen.ingresos_caja)],
    ["Costos registrados en el periodo", formatCurrency(resumen.costos_reparacion)],
    ["Flujo neto de caja", formatCurrency(resumen.utilidad_caja_periodo)],
    ["Reparaciones ingresadas", Number(resumen.ingresadas ?? 0)],
    ["Valor estimado ingresado", formatCurrency(resumen.valor_estimado)],
    ["Saldo pendiente abierto", formatCurrency(resumen.saldo_pendiente_abierto)],
  ];

  return (
    <section className="ventas-report-table-shell ventas-report-table-shell--simple">
      <div className="ventas-report-table-title">
        <h4>Informe de utilidad de reparaciones</h4>
        <span>{report.modulo?.nombre ?? "Todos los modulos"}</span>
      </div>
      <div className="table-responsive">
        <table className="table align-middle ventas-report-table ventas-report-simple__table">
          <thead>
            <tr>
              <th>Metrica</th>
              <th>Resultado</th>
            </tr>
          </thead>
          <tbody>
            {rows.map(([label, value]) => (
              <tr key={label}>
                <td>{label}</td>
                <td>{value}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </section>
  );
}

function DeliveredTable({ rows }) {
  return (
    <section className="ventas-report-table-shell ventas-report-table-shell--simple">
      <div className="ventas-report-table-title">
        <h4>Reparaciones entregadas</h4>
        <span>Utilidad = costo cobrado - costos registrados</span>
      </div>
      <div className="table-responsive">
        <table className="table align-middle ventas-report-table ventas-report-simple__table">
          <thead>
            <tr>
              <th>Codigo</th>
              <th>Cliente</th>
              <th>Equipo</th>
              <th>Cobrado</th>
              <th>Costos</th>
              <th>Utilidad</th>
              <th>Entrega</th>
            </tr>
          </thead>
          <tbody>
            {rows.length > 0 ? rows.map((row) => (
              <tr key={row.codigo_reparacion}>
                <td>{row.codigo_reparacion}</td>
                <td>{row.cliente_nombre ?? "-"}</td>
                <td>{row.equipo}</td>
                <td>{formatCurrency(row.costo_reparacion)}</td>
                <td>{formatCurrency(row.costos_total)}</td>
                <td>{formatCurrency(row.utilidad)}</td>
                <td>{formatDateTime(row.fecha_entrega)}</td>
              </tr>
            )) : <EmptyRow colSpan={7}>No hay reparaciones entregadas en el periodo seleccionado.</EmptyRow>}
          </tbody>
        </table>
      </div>
    </section>
  );
}

function StatusTable({ rows }) {
  return (
    <section className="ventas-report-table-shell ventas-report-table-shell--simple">
      <div className="ventas-report-table-title">
        <h4>Estado actual del taller</h4>
      </div>
      <div className="table-responsive">
        <table className="table align-middle ventas-report-table ventas-report-simple__table">
          <thead>
            <tr>
              <th>Estado</th>
              <th>Reparaciones</th>
              <th>Saldo pendiente</th>
            </tr>
          </thead>
          <tbody>
            {rows.length > 0 ? rows.map((row) => (
              <tr key={row.estado}>
                <td>{formatLabel(row.estado)}</td>
                <td>{row.total}</td>
                <td>{formatCurrency(row.saldo_pendiente)}</td>
              </tr>
            )) : <EmptyRow colSpan={3}>Sin reparaciones activas.</EmptyRow>}
          </tbody>
        </table>
      </div>
    </section>
  );
}

function CashAndCostsTables({ report }) {
  const incomeRows = report.ingresos_por_modulo ?? [];
  const costRows = report.costos_por_tipo ?? [];

  return (
    <div className="ventas-report-simple__two-columns">
      <section className="ventas-report-table-shell ventas-report-table-shell--simple">
        <div className="ventas-report-table-title">
          <h4>Entradas de caja</h4>
        </div>
        <div className="table-responsive">
          <table className="table align-middle ventas-report-table ventas-report-simple__table">
            <thead>
              <tr>
                <th>Modulo</th>
                <th>Movimientos</th>
                <th>Total</th>
              </tr>
            </thead>
            <tbody>
              {incomeRows.length > 0 ? incomeRows.map((row) => (
                <tr key={`${row.modulo_id ?? "na"}-${row.modulo_nombre}`}>
                  <td>{row.modulo_nombre}</td>
                  <td>{row.movimientos}</td>
                  <td>{formatCurrency(row.total)}</td>
                </tr>
              )) : <EmptyRow colSpan={3}>Sin entradas de caja por reparacion.</EmptyRow>}
            </tbody>
          </table>
        </div>
      </section>

      <section className="ventas-report-table-shell ventas-report-table-shell--simple">
        <div className="ventas-report-table-title">
          <h4>Costos registrados</h4>
        </div>
        <div className="table-responsive">
          <table className="table align-middle ventas-report-table ventas-report-simple__table">
            <thead>
              <tr>
                <th>Tipo</th>
                <th>Movimientos</th>
                <th>Total</th>
              </tr>
            </thead>
            <tbody>
              {costRows.length > 0 ? costRows.map((row) => (
                <tr key={row.tipo_costo}>
                  <td>{formatLabel(row.tipo_costo)}</td>
                  <td>{row.movimientos}</td>
                  <td>{formatCurrency(row.total)}</td>
                </tr>
              )) : <EmptyRow colSpan={3}>Sin costos registrados en el periodo.</EmptyRow>}
            </tbody>
          </table>
        </div>
      </section>
    </div>
  );
}

function MonthlyProfitTable({ rows }) {
  return (
    <section className="ventas-report-table-shell ventas-report-table-shell--simple">
      <div className="ventas-report-table-title">
        <h4>Utilidad por dia de entrega</h4>
      </div>
      <div className="table-responsive">
        <table className="table align-middle ventas-report-table ventas-report-simple__table">
          <thead>
            <tr>
              <th>Fecha</th>
              <th>Entregadas</th>
              <th>Valor</th>
              <th>Costos</th>
              <th>Utilidad</th>
            </tr>
          </thead>
          <tbody>
            {rows.length > 0 ? rows.map((row) => (
              <tr key={row.fecha}>
                <td>{formatDate(row.fecha)}</td>
                <td>{row.entregadas}</td>
                <td>{formatCurrency(row.valor)}</td>
                <td>{formatCurrency(row.costos)}</td>
                <td>{formatCurrency(row.utilidad)}</td>
              </tr>
            )) : <EmptyRow colSpan={5}>Sin reparaciones entregadas en este mes.</EmptyRow>}
          </tbody>
        </table>
      </div>
    </section>
  );
}

function RepairReport({ report, mode }) {
  const deliveredRows = report.entregas_recientes ?? [];
  const isMonthly = mode === "monthly";

  return (
    <div className="ventas-report-simple__workspace">
      <div className="ventas-report-simple__meta">
        <span>Periodo: <strong>{isMonthly ? report.periodo?.etiqueta : formatDate(report.fecha)}</strong></span>
        <span>Generado: <strong>{formatDateTime(report.generated_at)}</strong></span>
        <span>Modulo: <strong>{report.modulo?.nombre ?? "Todos"}</strong></span>
      </div>

      <SummaryTable report={report} />
      {isMonthly ? <MonthlyProfitTable rows={report.utilidad_entregas_por_dia ?? []} /> : null}
      <DeliveredTable rows={deliveredRows} />
      <CashAndCostsTables report={report} />
      <StatusTable rows={report.estado_actual ?? []} />
    </div>
  );
}

function DailyWorkspace({
  modulos,
  dailyValues,
  onDailyChange,
  onDailySubmit,
  onDailySave,
  dailyReport,
  dailyLoading,
  dailyError,
  dailySaving,
  onPreviewReport,
}) {
  return (
    <article className="ventas-report-simple">
      <div className="ventas-report-simple__header">
        <div>
          <p className="section-kicker">Reparaciones</p>
          <h3>Reporte diario</h3>
          <p className="muted-text">Consulta utilidad por reparaciones entregadas, entradas de caja, costos y saldos.</p>
        </div>
      </div>

      <form className="ventas-report-simple__filters" onSubmit={(event) => { event.preventDefault(); onDailySubmit(); }}>
        <div>
          <label className="form-label">Fecha</label>
          <input type="date" className="form-control" value={dailyValues.fecha} onChange={(event) => onDailyChange("fecha", event.target.value)} />
        </div>
        <div>
          <label className="form-label">Modulo</label>
          <select className="form-select" value={dailyValues.modulo_id} onChange={(event) => onDailyChange("modulo_id", event.target.value)}>
            <option value="">Todos</option>
            {modulos.map((modulo) => <option key={modulo.id} value={modulo.id}>{modulo.nombre}</option>)}
          </select>
        </div>
        <div className="ventas-report-simple__actions">
          <button type="submit" className="btn btn-primary">Generar</button>
          <button type="button" className="btn btn-success" onClick={() => onPreviewReport("repair-daily", dailyReport)} disabled={!dailyReport || dailyLoading}>Exportar PDF</button>
          <button type="button" className="btn btn-outline-dark" onClick={onDailySave} disabled={!dailyReport || dailyLoading || dailySaving}>
            {dailySaving ? "Guardando..." : "Guardar"}
          </button>
        </div>
      </form>

      {dailyError ? <div className="alert alert-danger mb-0">{dailyError}</div> : null}
      {dailyLoading ? <ReportLoading /> : null}
      {!dailyLoading && dailyReport ? <RepairReport report={dailyReport} mode="daily" /> : null}
    </article>
  );
}

function MonthlyWorkspace({
  modulos,
  monthlyValues,
  onMonthlyChange,
  onMonthlySubmit,
  onMonthlySave,
  monthlyReport,
  monthlyLoading,
  monthlyError,
  monthlySaving,
  onPreviewReport,
}) {
  const currentYear = new Date().getFullYear();
  const yearOptions = Array.from({ length: 6 }, (_, index) => String(currentYear - index));

  return (
    <article className="ventas-report-simple">
      <div className="ventas-report-simple__header">
        <div>
          <p className="section-kicker">Reparaciones</p>
          <h3>Reporte mensual</h3>
          <p className="muted-text">Revisa la utilidad por entregas y el flujo de caja acumulado del taller.</p>
        </div>
      </div>

      <form className="ventas-report-simple__filters ventas-report-simple__filters--three" onSubmit={(event) => { event.preventDefault(); onMonthlySubmit(); }}>
        <div>
          <label className="form-label">Mes</label>
          <select className="form-select" value={monthlyValues.mes} onChange={(event) => onMonthlyChange("mes", event.target.value)}>
            {MONTH_LABELS.map((label, index) => <option key={label} value={String(index + 1)}>{label}</option>)}
          </select>
        </div>
        <div>
          <label className="form-label">Anio</label>
          <select className="form-select" value={monthlyValues.anio} onChange={(event) => onMonthlyChange("anio", event.target.value)}>
            {yearOptions.map((year) => <option key={year} value={year}>{year}</option>)}
          </select>
        </div>
        <div>
          <label className="form-label">Modulo</label>
          <select className="form-select" value={monthlyValues.modulo_id} onChange={(event) => onMonthlyChange("modulo_id", event.target.value)}>
            <option value="">Todos</option>
            {modulos.map((modulo) => <option key={modulo.id} value={modulo.id}>{modulo.nombre}</option>)}
          </select>
        </div>
        <div className="ventas-report-simple__actions">
          <button type="submit" className="btn btn-primary">Generar</button>
          <button type="button" className="btn btn-success" onClick={() => onPreviewReport("repair-monthly", monthlyReport)} disabled={!monthlyReport || monthlyLoading}>Exportar PDF</button>
          <button type="button" className="btn btn-outline-dark" onClick={onMonthlySave} disabled={!monthlyReport || monthlyLoading || monthlySaving}>
            {monthlySaving ? "Guardando..." : "Guardar"}
          </button>
        </div>
      </form>

      {monthlyError ? <div className="alert alert-danger mb-0">{monthlyError}</div> : null}
      {monthlyLoading ? <ReportLoading /> : null}
      {!monthlyLoading && monthlyReport ? <RepairReport report={monthlyReport} mode="monthly" /> : null}
    </article>
  );
}

function HistoryWorkspace({ history, historyLoading, historyError }) {
  return (
    <article className="ventas-report-simple">
      <div className="ventas-report-simple__header">
        <div>
          <p className="section-kicker">Historial</p>
          <h3>Reportes guardados</h3>
          <p className="muted-text">Consulta los cierres de reparaciones almacenados.</p>
        </div>
      </div>

      {historyError ? <div className="alert alert-danger mb-0">{historyError}</div> : null}
      {historyLoading ? <ReportLoading /> : (
        <section className="ventas-report-table-shell ventas-report-table-shell--simple">
          <div className="table-responsive">
            <table className="table align-middle ventas-report-table ventas-report-simple__table">
              <thead>
                <tr>
                  <th>Reporte</th>
                  <th>Periodo</th>
                  <th>Modulo</th>
                  <th>Generado por</th>
                  <th>Creado</th>
                </tr>
              </thead>
              <tbody>
                {history.length > 0 ? history.map((item) => (
                  <tr key={item.id}>
                    <td>{item.titulo}</td>
                    <td>{item.tipo_reporte === "diario_reparaciones" ? formatDate(item.fecha_reporte) : item.payload?.periodo?.etiqueta ?? "-"}</td>
                    <td>{item.modulo?.nombre ?? "Todos"}</td>
                    <td>{item.generado_por_usuario?.name ?? "Sistema"}</td>
                    <td>{formatDateTime(item.created_at)}</td>
                  </tr>
                )) : <EmptyRow colSpan={5}>Todavia no has guardado reportes de reparaciones.</EmptyRow>}
              </tbody>
            </table>
          </div>
        </section>
      )}
    </article>
  );
}

function ReparacionesReportsPanel(props) {
  const [section, setSection] = useState("daily");
  const [previewReport, setPreviewReport] = useState(null);

  return (
    <section className="ventas-report-center ventas-report-center--simple repairs-report-center">
      <div className="ventas-report-simple__tabs-row">
        <Tabs
          value={section}
          onChange={setSection}
          options={[
            { value: "daily", label: "Reporte diario" },
            { value: "monthly", label: "Reporte mensual" },
            { value: "history", label: "Historial" },
          ]}
        />
      </div>

      {section === "daily" ? <DailyWorkspace {...props} onPreviewReport={(type, report) => setPreviewReport({ type, report })} /> : null}
      {section === "monthly" ? <MonthlyWorkspace {...props} onPreviewReport={(type, report) => setPreviewReport({ type, report })} /> : null}
      {section === "history" ? <HistoryWorkspace history={props.history} historyLoading={props.historyLoading} historyError={props.historyError} /> : null}

      {previewReport ? (
        <ReportPreviewModal
          type={previewReport.type}
          report={previewReport.report}
          onClose={() => setPreviewReport(null)}
        />
      ) : null}
    </section>
  );
}

export default ReparacionesReportsPanel;
