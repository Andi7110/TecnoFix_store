import { useState } from "react";
import { exportReportToPdf } from "../../utils/reportPrint";

const MONTH_LABELS = ["Enero", "Febrero", "Marzo", "Abril", "Mayo", "Junio", "Julio", "Agosto", "Septiembre", "Octubre", "Noviembre", "Diciembre"];

function formatCurrency(value) {
  return new Intl.NumberFormat("es-SV", { style: "currency", currency: "USD" }).format(Number(value ?? 0));
}

function formatPercent(value) {
  return `${Number(value ?? 0).toFixed(2)}%`;
}

function formatDateTime(value) {
  if (!value) return "-";
  return new Intl.DateTimeFormat("es-SV", { dateStyle: "medium", timeStyle: "short" }).format(new Date(value));
}

function formatDate(value) {
  if (!value) return "-";
  return new Intl.DateTimeFormat("es-SV", { dateStyle: "medium" }).format(new Date(value));
}

function formatLabel(value) {
  return String(value ?? "").replace(/_/g, " ").replace(/\b\w/g, (char) => char.toUpperCase());
}

function Tabs({ value, onChange, options }) {
  return (
    <div className="ventas-report-tabs">
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

function Metric({ label, value, tone = "default" }) {
  return (
    <article className={`ventas-report-kpi ventas-report-kpi--${tone}`}>
      <span>{label}</span>
      <strong>{value}</strong>
    </article>
  );
}

function ReportTableSkeleton({ columns = 4, rows = 4 }) {
  return (
    <div className="ventas-report-table-shell ventas-report-table-shell--loading">
      <div className="table-responsive">
        <table className="table align-middle ventas-report-table">
          <thead>
            <tr>{Array.from({ length: columns }).map((_, index) => <th key={index}><span className="ventas-report-loading-cell ventas-report-loading-cell--header" /></th>)}</tr>
          </thead>
          <tbody>
            {Array.from({ length: rows }).map((_, rowIndex) => (
              <tr key={rowIndex}>{Array.from({ length: columns }).map((__, colIndex) => <td key={colIndex}><span className="ventas-report-loading-cell ventas-report-loading-cell--medium" /></td>)}</tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

function Banner({ kicker, title, description, generatedAt, moduleName }) {
  return (
    <div className="ventas-report-banner">
      <div>
        <p className="section-kicker">{kicker}</p>
        <h3>{title}</h3>
        <p className="muted-text">{description}</p>
      </div>
      <div className="ventas-report-banner__meta">
        <div><span className="muted-text">Modulo</span><strong>{moduleName ?? "Todos"}</strong></div>
        <div><span className="muted-text">Generado</span><strong>{formatDateTime(generatedAt)}</strong></div>
      </div>
    </div>
  );
}

function RepairSummary({ report, mode }) {
  const [tab, setTab] = useState("resumen");
  const isMonthly = mode === "monthly";

  return (
    <div className="ventas-report-workspace">
      <Banner
        kicker={isMonthly ? "Taller mensual" : "Taller diario"}
        title={isMonthly ? "Resumen mensual de reparaciones" : "Resumen del dia"}
        description="Controla ingresos al taller, entregas, cobros en caja y carga pendiente de reparaciones."
        generatedAt={report.generated_at}
        moduleName={report.modulo?.nombre}
      />

      <div className="ventas-report-kpis">
        <Metric label="Ingresadas" value={report.resumen.ingresadas} tone="accent" />
        <Metric label="Entregadas" value={report.resumen.entregadas} tone="success" />
        <Metric label="Ingresos caja" value={formatCurrency(report.resumen.ingresos_caja)} tone="success" />
        <Metric label="Costos" value={formatCurrency(report.resumen.costos_reparacion)} />
        <Metric label="Utilidad" value={formatCurrency(report.resumen.utilidad_reparaciones)} tone={Number(report.resumen.utilidad_reparaciones ?? 0) >= 0 ? "success" : "danger"} />
        <Metric label="Valor estimado" value={formatCurrency(report.resumen.valor_estimado)} />
      </div>

      <Tabs
        value={tab}
        onChange={setTab}
        options={[
          { value: "resumen", label: "Resumen" },
          { value: "estados", label: "Estados" },
          { value: "caja", label: "Caja" },
          { value: "entregas", label: isMonthly ? "Dias" : "Entregas" },
        ]}
      />

      {tab === "resumen" ? (
        <div className="ventas-report-grid ventas-report-grid--balanced">
          <section className="ventas-report-panel">
            <div className="ventas-report-panel__header"><h4>Operacion de taller</h4></div>
            <div className="ventas-report-health">
              <div className="ventas-report-health__item"><span className="muted-text">Ticket promedio</span><strong>{formatCurrency(report.resumen.ticket_promedio)}</strong></div>
              <div className="ventas-report-health__item"><span className="muted-text">Valor entregado</span><strong>{formatCurrency(report.resumen.valor_entregado)}</strong></div>
              <div className="ventas-report-health__item"><span className="muted-text">Movimientos caja</span><strong>{report.resumen.movimientos_caja}</strong></div>
              <div className="ventas-report-health__item"><span className="muted-text">Movimientos costos</span><strong>{report.resumen.movimientos_costos}</strong></div>
              <div className="ventas-report-health__item"><span className="muted-text">Margen utilidad</span><strong>{formatPercent(report.resumen.margen_utilidad_porcentaje)}</strong></div>
              <div className="ventas-report-health__item"><span className="muted-text">Horas promedio</span><strong>{Number(report.resumen.horas_promedio_entrega ?? 0).toFixed(1)} h</strong></div>
              <div className="ventas-report-health__item"><span className="muted-text">Canceladas</span><strong>{report.resumen.canceladas}</strong></div>
            </div>
          </section>
          <section className="ventas-report-panel">
            <div className="ventas-report-panel__header"><h4>Estado actual</h4></div>
            <div className="ventas-report-summary-list">
              {(report.estado_actual ?? []).map((row) => (
                <article key={row.estado} className="ventas-report-summary-list__item">
                  <div><strong>{formatLabel(row.estado)}</strong><span>{row.total} reparaciones</span></div>
                  <div className="ventas-report-summary-list__meta"><strong>{formatCurrency(row.saldo_pendiente)}</strong><span>saldo</span></div>
                </article>
              ))}
            </div>
          </section>
        </div>
      ) : null}

      {tab === "estados" ? (
        <section className="ventas-report-panel">
          <div className="ventas-report-panel__header"><h4>Reparaciones ingresadas por estado</h4></div>
          <div className="table-responsive">
            <table className="table align-middle ventas-report-table">
              <thead><tr><th>Estado</th><th>Cantidad</th><th>Valor</th></tr></thead>
              <tbody>
                {(report.reparaciones_por_estado ?? []).length > 0 ? report.reparaciones_por_estado.map((row) => (
                  <tr key={row.estado}><td>{formatLabel(row.estado)}</td><td>{row.total}</td><td>{formatCurrency(row.valor)}</td></tr>
                )) : <tr><td colSpan={3} className="muted-text text-center">Sin reparaciones ingresadas en el periodo.</td></tr>}
              </tbody>
            </table>
          </div>
        </section>
      ) : null}

      {tab === "caja" ? (
        <div className="ventas-report-grid ventas-report-grid--balanced">
          <section className="ventas-report-panel">
            <div className="ventas-report-panel__header"><h4>Ingresos de reparaciones por modulo</h4></div>
            <div className="table-responsive">
              <table className="table align-middle ventas-report-table">
                <thead><tr><th>Modulo</th><th>Movimientos</th><th>Total</th></tr></thead>
                <tbody>
                  {(report.ingresos_por_modulo ?? []).length > 0 ? report.ingresos_por_modulo.map((row) => (
                    <tr key={`${row.modulo_id ?? "na"}-${row.modulo_nombre}`}><td>{row.modulo_nombre}</td><td>{row.movimientos}</td><td>{formatCurrency(row.total)}</td></tr>
                  )) : <tr><td colSpan={3} className="muted-text text-center">Sin ingresos de reparaciones en caja.</td></tr>}
                </tbody>
              </table>
            </div>
          </section>
          <section className="ventas-report-panel">
            <div className="ventas-report-panel__header"><h4>Costos por tipo</h4></div>
            <div className="table-responsive">
              <table className="table align-middle ventas-report-table">
                <thead><tr><th>Tipo</th><th>Movimientos</th><th>Total</th></tr></thead>
                <tbody>
                  {(report.costos_por_tipo ?? []).length > 0 ? report.costos_por_tipo.map((row) => (
                    <tr key={row.tipo_costo}><td>{formatLabel(row.tipo_costo)}</td><td>{row.movimientos}</td><td>{formatCurrency(row.total)}</td></tr>
                  )) : <tr><td colSpan={3} className="muted-text text-center">Sin costos registrados en el periodo.</td></tr>}
                </tbody>
              </table>
            </div>
          </section>
        </div>
      ) : null}

      {tab === "entregas" && !isMonthly ? (
        <section className="ventas-report-panel">
          <div className="ventas-report-panel__header"><h4>Entregas recientes</h4></div>
          <div className="table-responsive">
            <table className="table align-middle ventas-report-table">
              <thead><tr><th>Codigo</th><th>Cliente</th><th>Equipo</th><th>Costo</th><th>Entrega</th></tr></thead>
              <tbody>
                {(report.entregas_recientes ?? []).length > 0 ? report.entregas_recientes.map((row) => (
                  <tr key={row.codigo_reparacion}><td>{row.codigo_reparacion}</td><td>{row.cliente_nombre ?? "-"}</td><td>{row.equipo}</td><td>{formatCurrency(row.costo_reparacion)}</td><td>{formatDateTime(row.fecha_entrega)}</td></tr>
                )) : <tr><td colSpan={5} className="muted-text text-center">Sin entregas en la fecha seleccionada.</td></tr>}
              </tbody>
            </table>
          </div>
        </section>
      ) : null}

      {tab === "entregas" && isMonthly ? (
        <section className="ventas-report-panel">
          <div className="ventas-report-panel__header"><h4>Ingresos por dia</h4></div>
          <div className="table-responsive">
            <table className="table align-middle ventas-report-table">
              <thead><tr><th>Fecha</th><th>Movimientos</th><th>Ingresos</th><th>Costos</th><th>Utilidad</th></tr></thead>
              <tbody>
                {(report.ingresos_por_dia ?? []).length > 0 ? report.ingresos_por_dia.map((row) => {
                  const cost = (report.costos_por_dia ?? []).find((item) => item.fecha === row.fecha);
                  const costTotal = Number(cost?.total ?? 0);
                  return (
                    <tr key={row.fecha}><td>{formatDate(row.fecha)}</td><td>{row.movimientos}</td><td>{formatCurrency(row.total)}</td><td>{formatCurrency(costTotal)}</td><td>{formatCurrency(Number(row.total ?? 0) - costTotal)}</td></tr>
                  );
                }) : <tr><td colSpan={5} className="muted-text text-center">Sin ingresos por reparaciones en este mes.</td></tr>}
              </tbody>
            </table>
          </div>
        </section>
      ) : null}
    </div>
  );
}

function DailyWorkspace({ modulos, dailyValues, onDailyChange, onDailySubmit, onDailySave, dailyReport, dailyLoading, dailyError, dailySaving }) {
  return (
    <article className="surface-card ventas-report-shell">
      <div className="ventas-report-shell__header">
        <div>
          <p className="section-kicker">Diario</p>
          <h3>Reporte diario de reparaciones</h3>
          <p className="muted-text">Consolida ingresos al taller, entregas y cobros de reparaciones del dia.</p>
        </div>
      </div>
      <form className="ventas-report-controlbar" onSubmit={(event) => { event.preventDefault(); onDailySubmit(); }}>
        <div><label className="form-label">Fecha</label><input type="date" className="form-control" value={dailyValues.fecha} onChange={(event) => onDailyChange("fecha", event.target.value)} /></div>
        <div><label className="form-label">Modulo</label><select className="form-select" value={dailyValues.modulo_id} onChange={(event) => onDailyChange("modulo_id", event.target.value)}><option value="">Todos</option>{modulos.map((modulo) => <option key={modulo.id} value={modulo.id}>{modulo.nombre}</option>)}</select></div>
        <div className="ventas-report-controlbar__actions">
          <button type="submit" className="btn btn-primary">Generar reporte</button>
          <button type="button" className="btn btn-success" onClick={() => exportReportToPdf("repair-daily", dailyReport)} disabled={!dailyReport || dailyLoading}>Exportar PDF</button>
          <button type="button" className="btn btn-outline-dark" onClick={onDailySave} disabled={!dailyReport || dailyLoading || dailySaving}>{dailySaving ? "Guardando..." : "Guardar cierre"}</button>
        </div>
      </form>
      {dailyError ? <div className="alert alert-danger mb-0">{dailyError}</div> : null}
      {dailyLoading ? <ReportTableSkeleton columns={4} rows={4} /> : null}
      {!dailyLoading && dailyReport ? <RepairSummary report={dailyReport} mode="daily" /> : null}
    </article>
  );
}

function MonthlyWorkspace({ modulos, monthlyValues, onMonthlyChange, onMonthlySubmit, onMonthlySave, monthlyReport, monthlyLoading, monthlyError, monthlySaving }) {
  const currentYear = new Date().getFullYear();
  const yearOptions = Array.from({ length: 6 }, (_, index) => String(currentYear - index));
  return (
    <article className="surface-card ventas-report-shell">
      <div className="ventas-report-shell__header">
        <div>
          <p className="section-kicker">Mensual</p>
          <h3>Reporte mensual de reparaciones</h3>
          <p className="muted-text">Lee productividad, cobros, entregas y saldos abiertos del taller en el periodo.</p>
        </div>
      </div>
      <form className="ventas-report-controlbar ventas-report-controlbar--three" onSubmit={(event) => { event.preventDefault(); onMonthlySubmit(); }}>
        <div><label className="form-label">Mes</label><select className="form-select" value={monthlyValues.mes} onChange={(event) => onMonthlyChange("mes", event.target.value)}>{MONTH_LABELS.map((label, index) => <option key={label} value={String(index + 1)}>{label}</option>)}</select></div>
        <div><label className="form-label">Anio</label><select className="form-select" value={monthlyValues.anio} onChange={(event) => onMonthlyChange("anio", event.target.value)}>{yearOptions.map((year) => <option key={year} value={year}>{year}</option>)}</select></div>
        <div><label className="form-label">Modulo</label><select className="form-select" value={monthlyValues.modulo_id} onChange={(event) => onMonthlyChange("modulo_id", event.target.value)}><option value="">Todos</option>{modulos.map((modulo) => <option key={modulo.id} value={modulo.id}>{modulo.nombre}</option>)}</select></div>
        <div className="ventas-report-controlbar__actions">
          <button type="submit" className="btn btn-primary">Generar reporte</button>
          <button type="button" className="btn btn-success" onClick={() => exportReportToPdf("repair-monthly", monthlyReport)} disabled={!monthlyReport || monthlyLoading}>Exportar PDF</button>
          <button type="button" className="btn btn-outline-dark" onClick={onMonthlySave} disabled={!monthlyReport || monthlyLoading || monthlySaving}>{monthlySaving ? "Guardando..." : "Guardar reporte"}</button>
        </div>
      </form>
      {monthlyError ? <div className="alert alert-danger mb-0">{monthlyError}</div> : null}
      {monthlyLoading ? <ReportTableSkeleton columns={4} rows={4} /> : null}
      {!monthlyLoading && monthlyReport ? <RepairSummary report={monthlyReport} mode="monthly" /> : null}
    </article>
  );
}

function HistoryWorkspace({ history, historyLoading, historyError }) {
  return (
    <article className="surface-card ventas-report-shell">
      <div className="ventas-report-shell__header">
        <div>
          <p className="section-kicker">Historial</p>
          <h3>Reportes guardados</h3>
          <p className="muted-text">Consulta cierres de reparaciones almacenados para seguimiento posterior.</p>
        </div>
      </div>
      {historyError ? <div className="alert alert-danger mb-0">{historyError}</div> : null}
      {historyLoading ? <ReportTableSkeleton columns={5} rows={4} /> : (
        <div className="ventas-report-table-shell">
          <div className="table-responsive">
            <table className="table align-middle ventas-report-table">
              <thead><tr><th>Reporte</th><th>Periodo</th><th>Modulo</th><th>Generado por</th><th>Creado</th></tr></thead>
              <tbody>
                {history.length > 0 ? history.map((item) => (
                  <tr key={item.id}>
                    <td>{item.titulo}</td>
                    <td>{item.tipo_reporte === "diario_reparaciones" ? formatDate(item.fecha_reporte) : item.payload?.periodo?.etiqueta ?? "-"}</td>
                    <td>{item.modulo?.nombre ?? "Todos"}</td>
                    <td>{item.generado_por_usuario?.name ?? "Sistema"}</td>
                    <td>{formatDateTime(item.created_at)}</td>
                  </tr>
                )) : <tr><td colSpan={5} className="muted-text text-center">Todavia no has guardado reportes de reparaciones.</td></tr>}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </article>
  );
}

function ReparacionesReportsPanel(props) {
  const [section, setSection] = useState("daily");
  return (
    <section className="ventas-report-center repairs-report-center">
      <article className="surface-card ventas-report-center__hero">
        <div>
          <p className="section-kicker">Centro de taller</p>
          <h3>Analisis de reparaciones</h3>
          <p className="muted-text">Cambia entre productividad diaria, cierre mensual e historial de reportes guardados.</p>
        </div>
        <Tabs
          value={section}
          onChange={setSection}
          options={[
            { value: "daily", label: "Resumen diario" },
            { value: "monthly", label: "Resumen mensual" },
            { value: "history", label: "Historial" },
          ]}
        />
      </article>
      {section === "daily" ? <DailyWorkspace {...props} /> : null}
      {section === "monthly" ? <MonthlyWorkspace {...props} /> : null}
      {section === "history" ? <HistoryWorkspace history={props.history} historyLoading={props.historyLoading} historyError={props.historyError} /> : null}
    </section>
  );
}

export default ReparacionesReportsPanel;
