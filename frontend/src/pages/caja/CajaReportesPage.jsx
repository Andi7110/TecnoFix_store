import { useMemo, useState } from "react";
import { Archive, CalendarBlank, ChartBar, CheckCircle, Scales, TrendDown, TrendUp, Wallet } from "../../icons/phosphor";
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
  saldo_inicial: "Saldo inicial",
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
        <MetricCard icon={<Wallet size={22} />} label="Saldo inicial" value={money(summary.saldo_inicial)} help="Base fuera del resultado operativo" />
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

function BalanceLine({ item }) {
  return (
    <tr>
      <td>
        <strong>{item.nombre}</strong>
        <small>{item.descripcion}</small>
      </td>
      <td className="text-end"><strong>{money(item.monto)}</strong></td>
    </tr>
  );
}

function BalanceSection({ title, items, total, emptyText }) {
  return (
    <section className="surface-card cash-report-panel balance-sheet-panel">
      <div className="cash-report-panel__header">
        <div>
          <h3>{title}</h3>
          <p>{items.length > 0 ? "Partidas incluidas en el corte seleccionado." : emptyText}</p>
        </div>
        <strong>{money(total)}</strong>
      </div>
      <div className="table-responsive">
        <table className="table cash-report-table balance-sheet-table">
          <tbody>
            {items.length > 0 ? items.map((item) => (
              <BalanceLine item={item} key={item.codigo} />
            )) : (
              <tr>
                <td className="muted-text">{emptyText}</td>
                <td className="text-end"><strong>{money(0)}</strong></td>
              </tr>
            )}
          </tbody>
          <tfoot>
            <tr>
              <td>Total {title.toLowerCase()}</td>
              <td className="text-end">{money(total)}</td>
            </tr>
          </tfoot>
        </table>
      </div>
    </section>
  );
}

function BalanceGeneralContent({ balance }) {
  const assets = balance?.activos ?? {};
  const liabilities = balance?.pasivos ?? {};
  const equity = balance?.patrimonio ?? {};
  const summary = balance?.resumen ?? {};

  if (!balance) return null;

  return (
    <div className="cash-report-workspace balance-sheet-workspace">
      <div className="cash-report-result balance-sheet-result">
        <div>
          <span>Balance general</span>
          <strong>{money(summary.total_activos)}</strong>
        </div>
        <p>
          Corte al {balance.periodo?.fecha_corte}. Activos comparados contra pasivos y patrimonio calculado del sistema.
        </p>
      </div>

      <div className="cash-report-metrics">
        <MetricCard icon={<Wallet size={22} />} label="Activos" value={money(summary.total_activos)} help="Caja, cuentas por cobrar e inventario" tone="positive" />
        <MetricCard icon={<TrendDown size={22} />} label="Pasivos" value={money(summary.total_pasivos)} help="Sin pasivos registrados todavía" />
        <MetricCard icon={<Scales size={22} />} label="Patrimonio" value={money(summary.total_patrimonio)} help="Activos menos pasivos registrados" />
        <MetricCard icon={<Archive size={22} />} label="Inventario" value={`${summary.unidades_inventario ?? 0} uds.`} help="Unidades consideradas al costo" />
      </div>

      <div className="balance-sheet-grid">
        <BalanceSection
          title="Activos"
          items={assets.corrientes ?? []}
          total={assets.total ?? 0}
          emptyText="No hay activos registrados para este corte."
        />
        <BalanceSection
          title="Pasivos"
          items={liabilities.corrientes ?? []}
          total={liabilities.total ?? 0}
          emptyText="El sistema aun no registra deudas, prestamos ni cuentas por pagar."
        />
        <BalanceSection
          title="Patrimonio"
          items={equity.partidas ?? []}
          total={equity.total ?? 0}
          emptyText="No hay partidas de patrimonio registradas."
        />
      </div>

      <section className="surface-card cash-report-panel balance-sheet-check">
        <div>
          <span>Comprobacion</span>
          <strong>{money(summary.pasivo_mas_patrimonio)}</strong>
          <small>Pasivo + patrimonio</small>
        </div>
        <div>
          <span>Diferencia</span>
          <strong>{money(summary.diferencia)}</strong>
          <small>Debe quedar en cero</small>
        </div>
      </section>

      <section className="surface-card cash-report-panel balance-sheet-notes">
        <h3>Notas del balance</h3>
        <ul>
          {(balance.notas ?? []).map((note) => <li key={note}>{note}</li>)}
        </ul>
      </section>
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
        <button type="button" className={section === "balance" ? "is-active" : ""} onClick={() => setSection("balance")}>Balance general</button>
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
              <button type="button" className="btn cash-report-action cash-report-action--generate" onClick={reports.generate}>
                <ChartBar size={17} weight="bold" aria-hidden="true" />
                <span>Generar</span>
              </button>
              <button type="button" className="btn cash-report-action cash-report-action--close" onClick={reports.closeMonth} disabled={!reports.report || reports.loading || reports.closing || Boolean(reports.report?.cierre)}>
                {reports.report?.cierre ? "Mes cerrado" : reports.closing ? "Guardando..." : "Guardar cierre"}
              </button>
            </div>
          </section>

          {reports.report?.cierre ? <div className="cash-report-closed"><CheckCircle size={19} weight="fill" /> Cierre guardado el {dateTime(reports.report.cierre.cerrado_en)}. El historial conserva la fotografía de ese momento.</div> : null}
          {reports.error ? <div className="alert alert-danger">{reports.error}</div> : null}
          {reports.loading ? <div className="cash-report-loading">Generando reporte mensual...</div> : <ReportContent report={reports.report} />}
        </>
      ) : section === "balance" ? (
        <>
          <section className="surface-card cash-report-controls">
            <div className="cash-report-controls__title"><Scales size={24} /><div><h3>Selecciona el corte</h3><p>Genera el balance general al cierre del mes.</p></div></div>
            <div className="cash-report-controls__fields">
              <select className="form-select" value={reports.filters.mes} onChange={(event) => reports.updateFilter("mes", event.target.value)}>
                {MONTHS.map((month, index) => <option key={month} value={index + 1}>{month}</option>)}
              </select>
              <select className="form-select" value={reports.filters.anio} onChange={(event) => reports.updateFilter("anio", event.target.value)}>
                {years.map((year) => <option key={year} value={year}>{year}</option>)}
              </select>
              <button type="button" className="btn cash-report-action cash-report-action--generate" onClick={reports.generate}>
                <ChartBar size={17} weight="bold" aria-hidden="true" />
                <span>Generar</span>
              </button>
            </div>
          </section>

          {reports.balanceError ? <div className="alert alert-danger">{reports.balanceError}</div> : null}
          {reports.balanceLoading ? <div className="cash-report-loading">Generando balance general...</div> : <BalanceGeneralContent balance={reports.balanceGeneral} />}
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
