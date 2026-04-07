import { useMemo, useState } from "react";
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

function Insight({ title, body, tone = "default" }) {
  return (
    <article className={`ventas-report-insight ventas-report-insight--${tone}`}>
      <strong>{title}</strong>
      <p>{body}</p>
    </article>
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
        <div>
          <span className="muted-text">Modulo</span>
          <strong>{moduleName ?? "Todos"}</strong>
        </div>
        <div>
          <span className="muted-text">Generado</span>
          <strong>{formatDateTime(generatedAt)}</strong>
        </div>
      </div>
    </div>
  );
}

function SummaryList({ title, items, emptyMessage }) {
  return (
    <section className="ventas-report-panel">
      <div className="ventas-report-panel__header"><h4>{title}</h4></div>
      {items.length > 0 ? (
        <div className="ventas-report-summary-list">
          {items.map((item) => (
            <article key={item.id} className="ventas-report-summary-list__item">
              <div>
                <strong>{item.title}</strong>
                <span>{item.subtitle}</span>
              </div>
              <div className="ventas-report-summary-list__meta">
                <strong>{item.value}</strong>
                {item.secondary ? <span>{item.secondary}</span> : null}
              </div>
            </article>
          ))}
        </div>
      ) : <p className="empty-state">{emptyMessage}</p>}
    </section>
  );
}

function DailyContent({ report }) {
  const [tab, setTab] = useState("resumen");
  const insights = useMemo(() => {
    const metodo = report.ventas_por_metodo?.[0];
    const modulo = report.ventas_por_modulo?.[0];
    const producto = report.top_productos?.[0];
    return [
      {
        id: "m1",
        title: metodo ? `${formatLabel(metodo.metodo_pago)} lidera el cobro` : "Sin metodo dominante",
        body: metodo ? `${metodo.ventas_count} ventas por ${formatCurrency(metodo.total)}.` : "No hay ventas registradas para analizar metodos.",
        tone: "accent",
      },
      {
        id: "m2",
        title: modulo ? `${modulo.modulo_nombre} lidera el dia` : "Sin modulo lider",
        body: modulo ? `${formatCurrency(modulo.ventas_netas)} en ventas y ${formatCurrency(modulo.utilidad_bruta)} en utilidad.` : "No hay datos por modulo para el dia.",
        tone: "success",
      },
      {
        id: "m3",
        title: producto ? `${producto.producto_nombre} fue el producto estrella` : "Sin producto destacado",
        body: producto ? `${producto.cantidad} unidades por ${formatCurrency(producto.total)}.` : "No hay productos vendidos para destacar.",
      },
    ];
  }, [report]);
  const topItems = useMemo(() => (
    (report.top_productos ?? []).slice(0, 5).map((row) => ({
      id: `${row.producto_id ?? row.producto_nombre}-${row.cantidad}`,
      title: row.producto_nombre,
      subtitle: row.producto_codigo ?? "Sin codigo",
      value: formatCurrency(row.total),
      secondary: `${row.cantidad} unidades`,
    }))
  ), [report]);

  return (
    <div className="ventas-report-workspace">
      <Banner
        kicker="Comercial diario"
        title="Lectura ejecutiva del dia"
        description="Unifica ventas, caja, utilidad y comportamiento de productos en una sola capa de lectura."
        generatedAt={report.generated_at}
        moduleName={report.modulo?.nombre}
      />

      <div className="ventas-report-kpis">
        <Metric label="Ventas netas" value={formatCurrency(report.resumen.ventas_netas)} tone="accent" />
        <Metric label="Utilidad bruta" value={formatCurrency(report.resumen.utilidad_bruta)} tone="success" />
        <Metric label="Margen bruto" value={formatPercent(report.resumen.margen_bruto_porcentaje)} />
        <Metric label="Ticket promedio" value={formatCurrency(report.resumen.ticket_promedio)} />
        <Metric label="Items vendidos" value={report.resumen.items_vendidos} />
        <Metric label="Caja neta" value={formatCurrency(report.caja.neto)} />
      </div>

      <div className="ventas-report-insights">
        {insights.map((item) => <Insight key={item.id} title={item.title} body={item.body} tone={item.tone} />)}
      </div>

      <Tabs
        value={tab}
        onChange={setTab}
        options={[
          { value: "resumen", label: "Resumen" },
          { value: "productos", label: "Productos" },
          { value: "metodos", label: "Metodos" },
          { value: "modulos", label: "Modulos" },
        ]}
      />

      {tab === "resumen" ? (
        <div className="ventas-report-grid ventas-report-grid--balanced">
          <section className="ventas-report-panel">
            <div className="ventas-report-panel__header"><h4>Salud comercial</h4></div>
            <div className="ventas-report-health">
              <div className="ventas-report-health__item"><span className="muted-text">Costo de ventas</span><strong>{formatCurrency(report.resumen.costo_ventas)}</strong></div>
              <div className="ventas-report-health__item"><span className="muted-text">Ventas del dia</span><strong>{report.resumen.ventas_count}</strong></div>
              <div className="ventas-report-health__item"><span className="muted-text">Ticket promedio</span><strong>{formatCurrency(report.resumen.ticket_promedio)}</strong></div>
              <div className="ventas-report-health__item"><span className="muted-text">Caja neta</span><strong>{formatCurrency(report.caja.neto)}</strong></div>
            </div>
          </section>
          <SummaryList title="Top productos del dia" items={topItems} emptyMessage="No hay productos vendidos en la fecha seleccionada." />
        </div>
      ) : null}

      {tab === "productos" ? (
        <section className="ventas-report-panel">
          <div className="ventas-report-panel__header"><h4>Productos destacados del dia</h4></div>
          <div className="table-responsive">
            <table className="table align-middle ventas-report-table">
              <thead><tr><th>Producto</th><th>Cantidad</th><th>Total</th><th>Utilidad</th></tr></thead>
              <tbody>
                {report.top_productos.length > 0 ? report.top_productos.map((row) => (
                  <tr key={`${row.producto_id ?? row.producto_nombre}-${row.cantidad}`}>
                    <td><div className="product-name">{row.producto_nombre}</div><div className="product-code">{row.producto_codigo ?? "Sin codigo"}</div></td>
                    <td>{row.cantidad}</td>
                    <td>{formatCurrency(row.total)}</td>
                    <td>{formatCurrency(row.utilidad_bruta)}</td>
                  </tr>
                )) : <tr><td colSpan={4} className="muted-text text-center">No hay productos vendidos en la fecha seleccionada.</td></tr>}
              </tbody>
            </table>
          </div>
        </section>
      ) : null}

      {tab === "metodos" ? (
        <section className="ventas-report-panel">
          <div className="ventas-report-panel__header"><h4>Ventas por metodo de pago</h4></div>
          <div className="table-responsive">
            <table className="table align-middle ventas-report-table">
              <thead><tr><th>Metodo</th><th>Ventas</th><th>Total</th></tr></thead>
              <tbody>
                {report.ventas_por_metodo.length > 0 ? report.ventas_por_metodo.map((row) => (
                  <tr key={row.metodo_pago}><td>{formatLabel(row.metodo_pago)}</td><td>{row.ventas_count}</td><td>{formatCurrency(row.total)}</td></tr>
                )) : <tr><td colSpan={3} className="muted-text text-center">Sin ventas registradas.</td></tr>}
              </tbody>
            </table>
          </div>
        </section>
      ) : null}

      {tab === "modulos" ? (
        <section className="ventas-report-panel">
          <div className="ventas-report-panel__header"><h4>Ventas por modulo</h4></div>
          <div className="table-responsive">
            <table className="table align-middle ventas-report-table">
              <thead><tr><th>Modulo</th><th>Ventas</th><th>Utilidad</th></tr></thead>
              <tbody>
                {report.ventas_por_modulo.length > 0 ? report.ventas_por_modulo.map((row) => (
                  <tr key={`${row.modulo_id ?? "na"}-${row.modulo_nombre}`}><td>{row.modulo_nombre}</td><td>{formatCurrency(row.ventas_netas)}</td><td>{formatCurrency(row.utilidad_bruta)}</td></tr>
                )) : <tr><td colSpan={3} className="muted-text text-center">Sin ventas por modulo.</td></tr>}
              </tbody>
            </table>
          </div>
        </section>
      ) : null}
    </div>
  );
}

function MonthlyContent({ report }) {
  const [tab, setTab] = useState("resumen");
  const insights = useMemo(() => {
    const gasto = report.detalle_gastos_operativos?.[0];
    const excluido = report.movimientos_excluidos?.[0];
    return [
      {
        id: "i1",
        title: "La utilidad operativa marca el cierre",
        body: `${formatCurrency(report.estado_resultados.utilidad_operativa)} con margen de ${formatPercent(report.estado_resultados.margen_operativo_porcentaje)}.`,
        tone: "success",
      },
      {
        id: "i2",
        title: gasto ? `${formatLabel(gasto.categoria_movimiento)} lidera los gastos` : "Sin gastos dominantes",
        body: gasto ? `${gasto.movimientos_count} movimientos por ${formatCurrency(gasto.total)}.` : "No hay gastos operativos registrados en el periodo.",
        tone: "accent",
      },
      {
        id: "i3",
        title: excluido ? `${formatLabel(excluido.categoria_movimiento)} fue el principal excluido` : "Sin movimientos excluidos relevantes",
        body: excluido ? `${formatCurrency(excluido.total)} bajo ${formatLabel(excluido.tipo_movimiento)}.` : "No hay movimientos excluidos para destacar.",
      },
    ];
  }, [report]);
  const expenses = useMemo(() => (
    (report.detalle_gastos_operativos ?? []).slice(0, 5).map((row) => ({
      id: row.categoria_movimiento,
      title: formatLabel(row.categoria_movimiento),
      subtitle: `${row.movimientos_count} movimientos`,
      value: formatCurrency(row.total),
    }))
  ), [report]);

  return (
    <div className="ventas-report-workspace">
      <Banner
        kicker="Contabilidad mensual"
        title="Estado financiero del periodo"
        description="Organiza ingresos, costos, gastos y exclusiones para leer el resultado real del negocio."
        generatedAt={report.generated_at}
        moduleName={report.modulo?.nombre}
      />

      <div className="ventas-report-kpis">
        <Metric label="Ventas netas" value={formatCurrency(report.estado_resultados.ventas_netas)} tone="accent" />
        <Metric label="Ingresos operativos" value={formatCurrency(report.estado_resultados.ingresos_operativos)} />
        <Metric label="Utilidad bruta" value={formatCurrency(report.estado_resultados.utilidad_bruta)} tone="success" />
        <Metric label="Gastos operativos" value={formatCurrency(report.estado_resultados.gastos_operativos)} />
        <Metric label="Utilidad operativa" value={formatCurrency(report.estado_resultados.utilidad_operativa)} tone="success" />
        <Metric label="Margen operativo" value={formatPercent(report.estado_resultados.margen_operativo_porcentaje)} />
      </div>

      <div className="ventas-report-insights">
        {insights.map((item) => <Insight key={item.id} title={item.title} body={item.body} tone={item.tone} />)}
      </div>

      <Tabs
        value={tab}
        onChange={setTab}
        options={[
          { value: "resumen", label: "Resumen" },
          { value: "gastos", label: "Gastos" },
          { value: "contabilidad", label: "Contabilidad" },
          { value: "notas", label: "Notas" },
        ]}
      />

      {tab === "resumen" ? (
        <div className="ventas-report-grid ventas-report-grid--balanced">
          <section className="ventas-report-panel">
            <div className="ventas-report-panel__header"><h4>Lectura contable</h4></div>
            <div className="ventas-report-health">
              <div className="ventas-report-health__item"><span className="muted-text">Otros ingresos</span><strong>{formatCurrency(report.estado_resultados.otros_ingresos)}</strong></div>
              <div className="ventas-report-health__item"><span className="muted-text">Costo de ventas</span><strong>{formatCurrency(report.estado_resultados.costo_ventas)}</strong></div>
              <div className="ventas-report-health__item"><span className="muted-text">Gastos operativos</span><strong>{formatCurrency(report.estado_resultados.gastos_operativos)}</strong></div>
              <div className="ventas-report-health__item"><span className="muted-text">Utilidad operativa</span><strong>{formatCurrency(report.estado_resultados.utilidad_operativa)}</strong></div>
            </div>
          </section>
          <SummaryList title="Rubros de gasto mas relevantes" items={expenses} emptyMessage="No hay gastos operativos registrados." />
        </div>
      ) : null}

      {tab === "gastos" ? (
        <section className="ventas-report-panel">
          <div className="ventas-report-panel__header"><h4>Gastos operativos</h4></div>
          <div className="table-responsive">
            <table className="table align-middle ventas-report-table">
              <thead><tr><th>Categoria</th><th>Mov.</th><th>Total</th></tr></thead>
              <tbody>
                {report.detalle_gastos_operativos.length > 0 ? report.detalle_gastos_operativos.map((row) => (
                  <tr key={row.categoria_movimiento}><td>{formatLabel(row.categoria_movimiento)}</td><td>{row.movimientos_count}</td><td>{formatCurrency(row.total)}</td></tr>
                )) : <tr><td colSpan={3} className="muted-text text-center">No hay gastos operativos registrados.</td></tr>}
              </tbody>
            </table>
          </div>
        </section>
      ) : null}

      {tab === "contabilidad" ? (
        <div className="ventas-report-grid ventas-report-grid--balanced">
          <section className="ventas-report-panel">
            <div className="ventas-report-panel__header"><h4>Estado contable resumido</h4></div>
            <div className="ventas-report-ledger">
              <div className="ventas-report-ledger__row"><span>Ventas netas</span><strong>{formatCurrency(report.estado_resultados.ventas_netas)}</strong></div>
              <div className="ventas-report-ledger__row"><span>Otros ingresos</span><strong>{formatCurrency(report.estado_resultados.otros_ingresos)}</strong></div>
              <div className="ventas-report-ledger__row"><span>Ingresos operativos</span><strong>{formatCurrency(report.estado_resultados.ingresos_operativos)}</strong></div>
              <div className="ventas-report-ledger__row"><span>Costo de ventas</span><strong>{formatCurrency(report.estado_resultados.costo_ventas)}</strong></div>
              <div className="ventas-report-ledger__row"><span>Utilidad bruta</span><strong>{formatCurrency(report.estado_resultados.utilidad_bruta)}</strong></div>
              <div className="ventas-report-ledger__row"><span>Gastos operativos</span><strong>{formatCurrency(report.estado_resultados.gastos_operativos)}</strong></div>
              <div className="ventas-report-ledger__row ventas-report-ledger__row--accent"><span>Utilidad operativa</span><strong>{formatCurrency(report.estado_resultados.utilidad_operativa)}</strong></div>
            </div>
          </section>
          <section className="ventas-report-panel">
            <div className="ventas-report-panel__header"><h4>Movimientos excluidos</h4></div>
            <div className="table-responsive">
              <table className="table align-middle ventas-report-table">
                <thead><tr><th>Tipo</th><th>Categoria</th><th>Total</th></tr></thead>
                <tbody>
                  {report.movimientos_excluidos.length > 0 ? report.movimientos_excluidos.map((row) => (
                    <tr key={`${row.tipo_movimiento}-${row.categoria_movimiento}`}><td>{formatLabel(row.tipo_movimiento)}</td><td>{formatLabel(row.categoria_movimiento)}</td><td>{formatCurrency(row.total)}</td></tr>
                  )) : <tr><td colSpan={3} className="muted-text text-center">No hay movimientos excluidos en el periodo.</td></tr>}
                </tbody>
              </table>
            </div>
          </section>
        </div>
      ) : null}

      {tab === "notas" ? (
        <section className="ventas-report-panel">
          <div className="ventas-report-panel__header"><h4>Notas del calculo</h4></div>
          <ul className="ventas-report-notes">{report.notas.map((note) => <li key={note}>{note}</li>)}</ul>
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
          <p className="section-kicker">Comercial</p>
          <h3>Reporte diario de ventas</h3>
          <p className="muted-text">Visualiza cierres diarios, comportamiento comercial, caja y productos del dia sin perder trazabilidad.</p>
        </div>
      </div>
      <form className="ventas-report-controlbar" onSubmit={(event) => { event.preventDefault(); onDailySubmit(); }}>
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
        <div className="ventas-report-controlbar__actions">
          <button type="submit" className="btn btn-primary">Generar reporte</button>
          <button type="button" className="btn btn-success" onClick={() => exportReportToPdf("daily", dailyReport)} disabled={!dailyReport || dailyLoading}>Exportar PDF</button>
          <button type="button" className="btn btn-outline-dark" onClick={onDailySave} disabled={!dailyReport || dailyLoading || dailySaving}>{dailySaving ? "Guardando..." : "Guardar cierre"}</button>
        </div>
      </form>
      {dailyError ? <div className="alert alert-danger mb-0">{dailyError}</div> : null}
      {dailyLoading ? <p className="empty-state">Generando reporte diario...</p> : null}
      {!dailyLoading && dailyReport ? <DailyContent report={dailyReport} /> : null}
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
          <p className="section-kicker">Contabilidad</p>
          <h3>Estado de resultados mensual</h3>
          <p className="muted-text">Separa ingresos, costos, gastos y exclusiones para un cierre contable mucho mas claro.</p>
        </div>
      </div>
      <form className="ventas-report-controlbar ventas-report-controlbar--three" onSubmit={(event) => { event.preventDefault(); onMonthlySubmit(); }}>
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
        <div className="ventas-report-controlbar__actions">
          <button type="submit" className="btn btn-primary">Generar estado</button>
          <button type="button" className="btn btn-success" onClick={() => exportReportToPdf("monthly", monthlyReport)} disabled={!monthlyReport || monthlyLoading}>Exportar PDF</button>
          <button type="button" className="btn btn-outline-dark" onClick={onMonthlySave} disabled={!monthlyReport || monthlyLoading || monthlySaving}>{monthlySaving ? "Guardando..." : "Guardar estado"}</button>
        </div>
      </form>
      {monthlyError ? <div className="alert alert-danger mb-0">{monthlyError}</div> : null}
      {monthlyLoading ? <p className="empty-state">Generando estado de resultados...</p> : null}
      {!monthlyLoading && monthlyReport ? <MonthlyContent report={monthlyReport} /> : null}
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
          <p className="muted-text">Consulta cierres diarios y estados mensuales almacenados en el sistema.</p>
        </div>
      </div>
      {historyError ? <div className="alert alert-danger mb-0">{historyError}</div> : null}
      {historyLoading ? <p className="empty-state">Cargando historial...</p> : (
        <div className="table-responsive">
          <table className="table align-middle ventas-report-table">
            <thead><tr><th>Reporte</th><th>Periodo</th><th>Modulo</th><th>Generado por</th><th>Creado</th></tr></thead>
            <tbody>
              {history.length > 0 ? history.map((item) => (
                <tr key={item.id}>
                  <td>{item.titulo}</td>
                  <td>{item.tipo_reporte === "diario_ventas" ? formatDate(item.fecha_reporte) : item.payload?.periodo?.etiqueta ?? "-"}</td>
                  <td>{item.modulo?.nombre ?? "Todos"}</td>
                  <td>{item.generado_por_usuario?.name ?? "Sistema"}</td>
                  <td>{formatDateTime(item.created_at)}</td>
                </tr>
              )) : <tr><td colSpan={5} className="muted-text text-center">Todavia no has guardado cierres.</td></tr>}
            </tbody>
          </table>
        </div>
      )}
    </article>
  );
}

function VentasReportsPanel(props) {
  const [section, setSection] = useState("daily");
  return (
    <section className="ventas-report-center">
      <article className="surface-card ventas-report-center__hero">
        <div>
          <p className="section-kicker">Centro financiero</p>
          <h3>Analisis comercial y contable</h3>
          <p className="muted-text">Cambia entre lectura ejecutiva, detalle analitico y trazabilidad historica sin saturar la vista.</p>
        </div>
        <Tabs
          value={section}
          onChange={setSection}
          options={[
            { value: "daily", label: "Resumen diario" },
            { value: "monthly", label: "Estado mensual" },
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

export default VentasReportsPanel;
