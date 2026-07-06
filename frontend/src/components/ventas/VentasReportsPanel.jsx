import { useMemo, useState } from "react";
import ReportPreviewModal from "../reportes/ReportPreviewModal";

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

function formatDateTime(value) {
  if (!value) return "-";
  return new Intl.DateTimeFormat("es-SV", { dateStyle: "medium", timeStyle: "short" }).format(new Date(normalizeDateTime(value)));
}

function formatDate(value) {
  if (!value) return "-";
  return new Intl.DateTimeFormat("es-SV", { dateStyle: "medium" }).format(new Date(normalizeDateTime(value)));
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

function HorizontalBarChart({ title, rows, labelKey, valueKey, valueFormatter = formatCurrency, emptyMessage }) {
  const maxValue = useMemo(
    () => Math.max(...rows.map((row) => Number(row[valueKey] ?? 0)), 0),
    [rows, valueKey],
  );

  return (
    <section className="ventas-report-chart">
      <h4>{title}</h4>
      {rows.length > 0 ? (
        <div className="ventas-report-chart__body">
          {rows.map((row, index) => {
            const value = Number(row[valueKey] ?? 0);
            const width = maxValue > 0 ? Math.max((value / maxValue) * 100, 6) : 0;
            const label = typeof labelKey === "function" ? labelKey(row) : row[labelKey];

            return (
              <div className="ventas-report-chart__row" key={`${label}-${index}`}>
                <span className="ventas-report-chart__label">{formatLabel(label)}</span>
                <span className="ventas-report-chart__track" aria-hidden="true">
                  <span className="ventas-report-chart__bar" style={{ width: `${width}%` }} />
                </span>
                <strong>{valueFormatter(value)}</strong>
              </div>
            );
          })}
        </div>
      ) : (
        <p className="empty-state">{emptyMessage}</p>
      )}
    </section>
  );
}

function SummaryTable({ report }) {
  const resumen = report.resumen ?? {};
  const rows = [
    ["Ventas netas", formatCurrency(resumen.ventas_netas)],
    ["Costo de ventas", formatCurrency(resumen.costo_ventas)],
    ["Utilidad bruta", formatCurrency(resumen.utilidad_bruta)],
    ["Margen bruto", formatPercent(resumen.margen_bruto_porcentaje)],
    ["Ventas registradas", Number(resumen.ventas_count ?? 0)],
    ["Items vendidos", Number(resumen.items_vendidos ?? 0)],
    ["Ticket promedio", formatCurrency(resumen.ticket_promedio)],
  ];

  return (
    <section className="ventas-report-table-shell ventas-report-table-shell--simple">
      <div className="ventas-report-table-title">
        <h4>Informe de ventas</h4>
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

function ProductsTable({ rows }) {
  return (
    <section className="ventas-report-table-shell ventas-report-table-shell--simple">
      <div className="ventas-report-table-title">
        <h4>Detalle por producto</h4>
      </div>
      <div className="table-responsive">
        <table className="table align-middle ventas-report-table ventas-report-simple__table">
          <thead>
            <tr>
              <th>Producto</th>
              <th>Codigo</th>
              <th>Cant.</th>
              <th>Total</th>
              <th>Utilidad</th>
            </tr>
          </thead>
          <tbody>
            {rows.length > 0 ? rows.map((row) => (
              <tr key={`${row.producto_id ?? row.producto_nombre}-${row.producto_codigo ?? "sin-codigo"}`}>
                <td>{row.producto_nombre}</td>
                <td>{row.producto_codigo ?? "-"}</td>
                <td>{row.cantidad}</td>
                <td>{formatCurrency(row.total)}</td>
                <td>{formatCurrency(row.utilidad_bruta)}</td>
              </tr>
            )) : <EmptyRow colSpan={5}>No hay productos vendidos en la fecha seleccionada.</EmptyRow>}
          </tbody>
        </table>
      </div>
    </section>
  );
}

function MethodsTable({ rows }) {
  return (
    <section className="ventas-report-table-shell ventas-report-table-shell--simple">
      <div className="ventas-report-table-title">
        <h4>Metodos de pago</h4>
      </div>
      <div className="table-responsive">
        <table className="table align-middle ventas-report-table ventas-report-simple__table">
          <thead>
            <tr>
              <th>Metodo</th>
              <th>Ventas</th>
              <th>Total</th>
            </tr>
          </thead>
          <tbody>
            {rows.length > 0 ? rows.map((row) => (
              <tr key={row.metodo_pago}>
                <td>{formatLabel(row.metodo_pago)}</td>
                <td>{row.ventas_count}</td>
                <td>{formatCurrency(row.total)}</td>
              </tr>
            )) : <EmptyRow colSpan={3}>Sin ventas registradas.</EmptyRow>}
          </tbody>
        </table>
      </div>
    </section>
  );
}

function ModulesTable({ rows }) {
  return (
    <section className="ventas-report-table-shell ventas-report-table-shell--simple">
      <div className="ventas-report-table-title">
        <h4>Ventas por modulo</h4>
      </div>
      <div className="table-responsive">
        <table className="table align-middle ventas-report-table ventas-report-simple__table">
          <thead>
            <tr>
              <th>Modulo</th>
              <th>Ventas</th>
              <th>Total</th>
              <th>Utilidad</th>
            </tr>
          </thead>
          <tbody>
            {rows.length > 0 ? rows.map((row) => (
              <tr key={`${row.modulo_id ?? "na"}-${row.modulo_nombre}`}>
                <td>{row.modulo_nombre}</td>
                <td>{row.ventas_count}</td>
                <td>{formatCurrency(row.ventas_netas)}</td>
                <td>{formatCurrency(row.utilidad_bruta)}</td>
              </tr>
            )) : <EmptyRow colSpan={4}>Sin ventas por modulo.</EmptyRow>}
          </tbody>
        </table>
      </div>
    </section>
  );
}

function DailyReport({ report }) {
  const productRows = report.top_productos ?? [];
  const methodRows = report.ventas_por_metodo ?? [];
  const moduleRows = report.ventas_por_modulo ?? [];

  return (
    <div className="ventas-report-simple__workspace">
      <div className="ventas-report-simple__meta">
        <span>Fecha: <strong>{formatDate(report.fecha)}</strong></span>
        <span>Generado: <strong>{formatDateTime(report.generated_at)}</strong></span>
        <span>Modulo: <strong>{report.modulo?.nombre ?? "Todos"}</strong></span>
      </div>

      <SummaryTable report={report} />

      <div className="ventas-report-chart-grid">
        <HorizontalBarChart
          title="Ventas por metodo"
          rows={methodRows}
          labelKey="metodo_pago"
          valueKey="total"
          emptyMessage="No hay pagos para graficar."
        />
        <HorizontalBarChart
          title="Top productos"
          rows={productRows.slice(0, 6)}
          labelKey="producto_nombre"
          valueKey="total"
          emptyMessage="No hay productos para graficar."
        />
      </div>

      <ProductsTable rows={productRows} />
      <div className="ventas-report-simple__two-columns">
        <MethodsTable rows={methodRows} />
        <ModulesTable rows={moduleRows} />
      </div>
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
          <p className="section-kicker">Ventas</p>
          <h3>Reporte diario</h3>
          <p className="muted-text">Consulta ventas por fecha, productos, metodos de pago y modulos.</p>
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
          <button type="button" className="btn btn-success" onClick={() => onPreviewReport("daily", dailyReport)} disabled={!dailyReport || dailyLoading}>Exportar PDF</button>
          <button type="button" className="btn btn-outline-dark" onClick={onDailySave} disabled={!dailyReport || dailyLoading || dailySaving}>
            {dailySaving ? "Guardando..." : "Guardar"}
          </button>
        </div>
      </form>

      {dailyError ? <div className="alert alert-danger mb-0">{dailyError}</div> : null}
      {dailyLoading ? <ReportLoading /> : null}
      {!dailyLoading && dailyReport ? <DailyReport report={dailyReport} /> : null}
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
          <p className="muted-text">Consulta los reportes de ventas almacenados en el sistema.</p>
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
                    <td>{item.tipo_reporte === "diario_ventas" ? formatDate(item.fecha_reporte) : item.payload?.periodo?.etiqueta ?? "-"}</td>
                    <td>{item.modulo?.nombre ?? "Todos"}</td>
                    <td>{item.generado_por_usuario?.name ?? "Sistema"}</td>
                    <td>{formatDateTime(item.created_at)}</td>
                  </tr>
                )) : <EmptyRow colSpan={5}>Todavia no has guardado reportes.</EmptyRow>}
              </tbody>
            </table>
          </div>
        </section>
      )}
    </article>
  );
}

function VentasReportsPanel(props) {
  const [section, setSection] = useState("daily");
  const [previewReport, setPreviewReport] = useState(null);

  return (
    <section className="ventas-report-center ventas-report-center--simple">
      <div className="ventas-report-simple__tabs-row">
        <Tabs
          value={section}
          onChange={setSection}
          options={[
            { value: "daily", label: "Reporte diario" },
            { value: "history", label: "Historial" },
          ]}
        />
      </div>

      {section === "daily" ? (
        <DailyWorkspace
          {...props}
          onPreviewReport={(type, report) => setPreviewReport({ type, report })}
        />
      ) : null}
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

export default VentasReportsPanel;
