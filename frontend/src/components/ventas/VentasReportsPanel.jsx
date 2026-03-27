import { exportReportToPdf } from "../../utils/reportPrint";

const MONTH_LABELS = [
  "Enero",
  "Febrero",
  "Marzo",
  "Abril",
  "Mayo",
  "Junio",
  "Julio",
  "Agosto",
  "Septiembre",
  "Octubre",
  "Noviembre",
  "Diciembre",
];

function formatCurrency(value) {
  return new Intl.NumberFormat("es-SV", {
    style: "currency",
    currency: "USD",
  }).format(Number(value ?? 0));
}

function formatPercent(value) {
  return `${Number(value ?? 0).toFixed(2)}%`;
}

function formatDateTime(value) {
  if (!value) {
    return "-";
  }

  return new Intl.DateTimeFormat("es-SV", {
    dateStyle: "medium",
    timeStyle: "short",
  }).format(new Date(value));
}

function formatDate(value) {
  if (!value) {
    return "-";
  }

  return new Intl.DateTimeFormat("es-SV", {
    dateStyle: "medium",
  }).format(new Date(value));
}

function formatLabel(value) {
  return String(value ?? "")
    .replace(/_/g, " ")
    .replace(/\b\w/g, (char) => char.toUpperCase());
}

function ReportMetric({ label, value, tone = "default" }) {
  return (
    <article className={`ventas-report-metric ventas-report-metric--${tone}`}>
      <span>{label}</span>
      <strong>{value}</strong>
    </article>
  );
}

function DailyReportContent({ report }) {
  return (
    <div className="ventas-report-body">
      <div className="ventas-report-metrics">
        <ReportMetric label="Ventas netas" value={formatCurrency(report.resumen.ventas_netas)} tone="accent" />
        <ReportMetric label="Costo de ventas" value={formatCurrency(report.resumen.costo_ventas)} />
        <ReportMetric label="Utilidad bruta" value={formatCurrency(report.resumen.utilidad_bruta)} tone="success" />
        <ReportMetric label="Margen bruto" value={formatPercent(report.resumen.margen_bruto_porcentaje)} />
        <ReportMetric label="Ventas del dia" value={report.resumen.ventas_count} />
        <ReportMetric label="Items vendidos" value={report.resumen.items_vendidos} />
        <ReportMetric label="Ticket promedio" value={formatCurrency(report.resumen.ticket_promedio)} />
        <ReportMetric label="Caja neta" value={formatCurrency(report.caja.neto)} />
      </div>

      <div className="ventas-report-grid">
        <section className="ventas-report-panel">
          <h4>Ventas por metodo</h4>
          <div className="table-responsive">
            <table className="table align-middle ventas-report-table">
              <thead>
                <tr>
                  <th>Metodo</th>
                  <th>Ventas</th>
                  <th>Total</th>
                </tr>
              </thead>
              <tbody>
                {report.ventas_por_metodo.length > 0 ? report.ventas_por_metodo.map((row) => (
                  <tr key={row.metodo_pago}>
                    <td>{formatLabel(row.metodo_pago)}</td>
                    <td>{row.ventas_count}</td>
                    <td>{formatCurrency(row.total)}</td>
                  </tr>
                )) : (
                  <tr>
                    <td colSpan={3} className="muted-text text-center">Sin ventas registradas.</td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </section>

        <section className="ventas-report-panel">
          <h4>Ventas por modulo</h4>
          <div className="table-responsive">
            <table className="table align-middle ventas-report-table">
              <thead>
                <tr>
                  <th>Modulo</th>
                  <th>Ventas</th>
                  <th>Utilidad</th>
                </tr>
              </thead>
              <tbody>
                {report.ventas_por_modulo.length > 0 ? report.ventas_por_modulo.map((row) => (
                  <tr key={`${row.modulo_id ?? "na"}-${row.modulo_nombre}`}>
                    <td>{row.modulo_nombre}</td>
                    <td>{formatCurrency(row.ventas_netas)}</td>
                    <td>{formatCurrency(row.utilidad_bruta)}</td>
                  </tr>
                )) : (
                  <tr>
                    <td colSpan={3} className="muted-text text-center">Sin ventas por modulo.</td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </section>
      </div>

      <section className="ventas-report-panel">
        <div className="ventas-report-panel__header">
          <h4>Top productos del dia</h4>
          <span className="muted-text">Generado {formatDateTime(report.generated_at)}</span>
        </div>
        <div className="table-responsive">
          <table className="table align-middle ventas-report-table">
            <thead>
              <tr>
                <th>Producto</th>
                <th>Cantidad</th>
                <th>Total</th>
                <th>Utilidad</th>
              </tr>
            </thead>
            <tbody>
              {report.top_productos.length > 0 ? report.top_productos.map((row) => (
                <tr key={`${row.producto_id ?? row.producto_nombre}-${row.cantidad}`}>
                  <td>
                    <div className="product-name">{row.producto_nombre}</div>
                    <div className="product-code">{row.producto_codigo ?? "Sin codigo"}</div>
                  </td>
                  <td>{row.cantidad}</td>
                  <td>{formatCurrency(row.total)}</td>
                  <td>{formatCurrency(row.utilidad_bruta)}</td>
                </tr>
              )) : (
                <tr>
                  <td colSpan={4} className="muted-text text-center">No hay productos vendidos en la fecha seleccionada.</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </section>
    </div>
  );
}

function MonthlyReportContent({ report }) {
  return (
    <div className="ventas-report-body">
      <div className="ventas-report-metrics">
        <ReportMetric label="Ventas netas" value={formatCurrency(report.estado_resultados.ventas_netas)} tone="accent" />
        <ReportMetric label="Otros ingresos" value={formatCurrency(report.estado_resultados.otros_ingresos)} />
        <ReportMetric label="Ingresos operativos" value={formatCurrency(report.estado_resultados.ingresos_operativos)} />
        <ReportMetric label="Costo de ventas" value={formatCurrency(report.estado_resultados.costo_ventas)} />
        <ReportMetric label="Utilidad bruta" value={formatCurrency(report.estado_resultados.utilidad_bruta)} tone="success" />
        <ReportMetric label="Gastos operativos" value={formatCurrency(report.estado_resultados.gastos_operativos)} />
        <ReportMetric label="Utilidad operativa" value={formatCurrency(report.estado_resultados.utilidad_operativa)} tone="success" />
        <ReportMetric label="Margen operativo" value={formatPercent(report.estado_resultados.margen_operativo_porcentaje)} />
      </div>

      <div className="ventas-report-grid">
        <section className="ventas-report-panel">
          <h4>Gastos operativos</h4>
          <div className="table-responsive">
            <table className="table align-middle ventas-report-table">
              <thead>
                <tr>
                  <th>Categoria</th>
                  <th>Mov.</th>
                  <th>Total</th>
                </tr>
              </thead>
              <tbody>
                {report.detalle_gastos_operativos.length > 0 ? report.detalle_gastos_operativos.map((row) => (
                  <tr key={row.categoria_movimiento}>
                    <td>{formatLabel(row.categoria_movimiento)}</td>
                    <td>{row.movimientos_count}</td>
                    <td>{formatCurrency(row.total)}</td>
                  </tr>
                )) : (
                  <tr>
                    <td colSpan={3} className="muted-text text-center">No hay gastos operativos registrados.</td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </section>

        <section className="ventas-report-panel">
          <h4>Movimientos excluidos</h4>
          <div className="table-responsive">
            <table className="table align-middle ventas-report-table">
              <thead>
                <tr>
                  <th>Tipo</th>
                  <th>Categoria</th>
                  <th>Total</th>
                </tr>
              </thead>
              <tbody>
                {report.movimientos_excluidos.length > 0 ? report.movimientos_excluidos.map((row) => (
                  <tr key={`${row.tipo_movimiento}-${row.categoria_movimiento}`}>
                    <td>{formatLabel(row.tipo_movimiento)}</td>
                    <td>{formatLabel(row.categoria_movimiento)}</td>
                    <td>{formatCurrency(row.total)}</td>
                  </tr>
                )) : (
                  <tr>
                    <td colSpan={3} className="muted-text text-center">No hay movimientos excluidos en el periodo.</td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </section>
      </div>

      <section className="ventas-report-panel">
        <div className="ventas-report-panel__header">
          <h4>Notas del calculo</h4>
          <span className="muted-text">Generado {formatDateTime(report.generated_at)}</span>
        </div>
        <ul className="ventas-report-notes">
          {report.notas.map((note) => (
            <li key={note}>{note}</li>
          ))}
        </ul>
      </section>
    </div>
  );
}

function VentasReportsPanel({
  modulos,
  dailyValues,
  onDailyChange,
  onDailySubmit,
  onDailySave,
  dailyReport,
  dailyLoading,
  dailyError,
  dailySaving,
  monthlyValues,
  onMonthlyChange,
  onMonthlySubmit,
  onMonthlySave,
  monthlyReport,
  monthlyLoading,
  monthlyError,
  monthlySaving,
  history,
  historyLoading,
  historyError,
}) {
  const currentYear = new Date().getFullYear();
  const yearOptions = Array.from({ length: 6 }, (_, index) => String(currentYear - index));

  return (
    <section className="ventas-reportes">
      <article className="surface-card ventas-report-card">
        <div className="ventas-report-card__header">
          <div>
            <p className="section-kicker">Cierre diario</p>
            <h3>Reporte diario de ventas</h3>
            <p className="muted-text">
              Resume ventas, costo vendido, utilidad, caja y productos destacados del dia.
            </p>
          </div>
        </div>

        <form
          className="ventas-report-form"
          onSubmit={(event) => {
            event.preventDefault();
            onDailySubmit();
          }}
        >
          <div>
            <label className="form-label">Fecha</label>
            <input
              type="date"
              className="form-control"
              value={dailyValues.fecha}
              onChange={(event) => onDailyChange("fecha", event.target.value)}
            />
          </div>

          <div>
            <label className="form-label">Modulo</label>
            <select
              className="form-select"
              value={dailyValues.modulo_id}
              onChange={(event) => onDailyChange("modulo_id", event.target.value)}
            >
              <option value="">Todos</option>
              {modulos.map((modulo) => (
                <option key={modulo.id} value={modulo.id}>
                  {modulo.nombre}
                </option>
              ))}
            </select>
          </div>

          <div className="ventas-report-form__actions">
            <button type="submit" className="btn btn-primary">
              Generar reporte diario
            </button>
          </div>
        </form>

        <div className="ventas-report-actions">
          <button
            type="button"
            className="btn btn-success"
            onClick={() => exportReportToPdf("daily", dailyReport)}
            disabled={!dailyReport || dailyLoading}
          >
            Exportar PDF
          </button>
          <button
            type="button"
            className="btn btn-outline-dark"
            onClick={onDailySave}
            disabled={!dailyReport || dailyLoading || dailySaving}
          >
            {dailySaving ? "Guardando..." : "Guardar cierre"}
          </button>
        </div>

        {dailyError ? <div className="alert alert-danger mb-0">{dailyError}</div> : null}
        {dailyLoading ? (
          <p className="empty-state">Generando reporte diario...</p>
        ) : dailyReport ? (
          <DailyReportContent report={dailyReport} />
        ) : null}
      </article>

      <article className="surface-card ventas-report-card">
        <div className="ventas-report-card__header">
          <div>
            <p className="section-kicker">Cierre mensual</p>
            <h3>Estado de resultados</h3>
            <p className="muted-text">
              Separa ingresos operativos, costo de ventas, gastos operativos y movimientos excluidos.
            </p>
          </div>
        </div>

        <form
          className="ventas-report-form ventas-report-form--three"
          onSubmit={(event) => {
            event.preventDefault();
            onMonthlySubmit();
          }}
        >
          <div>
            <label className="form-label">Mes</label>
            <select
              className="form-select"
              value={monthlyValues.mes}
              onChange={(event) => onMonthlyChange("mes", event.target.value)}
            >
              {MONTH_LABELS.map((label, index) => (
                <option key={label} value={String(index + 1)}>
                  {label}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="form-label">Anio</label>
            <select
              className="form-select"
              value={monthlyValues.anio}
              onChange={(event) => onMonthlyChange("anio", event.target.value)}
            >
              {yearOptions.map((year) => (
                <option key={year} value={year}>
                  {year}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="form-label">Modulo</label>
            <select
              className="form-select"
              value={monthlyValues.modulo_id}
              onChange={(event) => onMonthlyChange("modulo_id", event.target.value)}
            >
              <option value="">Todos</option>
              {modulos.map((modulo) => (
                <option key={modulo.id} value={modulo.id}>
                  {modulo.nombre}
                </option>
              ))}
            </select>
          </div>

          <div className="ventas-report-form__actions">
            <button type="submit" className="btn btn-outline-dark">
              Generar estado mensual
            </button>
          </div>
        </form>

        <div className="ventas-report-actions">
          <button
            type="button"
            className="btn btn-success"
            onClick={() => exportReportToPdf("monthly", monthlyReport)}
            disabled={!monthlyReport || monthlyLoading}
          >
            Exportar PDF
          </button>
          <button
            type="button"
            className="btn btn-outline-dark"
            onClick={onMonthlySave}
            disabled={!monthlyReport || monthlyLoading || monthlySaving}
          >
            {monthlySaving ? "Guardando..." : "Guardar estado mensual"}
          </button>
        </div>

        {monthlyError ? <div className="alert alert-danger mb-0">{monthlyError}</div> : null}
        {monthlyLoading ? (
          <p className="empty-state">Generando estado de resultados...</p>
        ) : monthlyReport ? (
          <MonthlyReportContent report={monthlyReport} />
        ) : null}
      </article>

      <article className="surface-card ventas-report-card ventas-report-card--history">
        <div className="ventas-report-card__header">
          <div>
            <p className="section-kicker">Historial</p>
            <h3>Reportes guardados</h3>
            <p className="muted-text">
              Estos cierres quedan almacenados para consultarlos mas adelante.
            </p>
          </div>
        </div>

        {historyError ? <div className="alert alert-danger mb-0">{historyError}</div> : null}

        {historyLoading ? (
          <p className="empty-state">Cargando historial...</p>
        ) : (
          <div className="table-responsive">
            <table className="table align-middle ventas-report-table">
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
                    <td>
                      {item.tipo_reporte === "diario_ventas"
                        ? formatDate(item.fecha_reporte)
                        : item.payload?.periodo?.etiqueta ?? "-"}
                    </td>
                    <td>{item.modulo?.nombre ?? "Todos"}</td>
                    <td>{item.generado_por_usuario?.name ?? "Sistema"}</td>
                    <td>{formatDateTime(item.created_at)}</td>
                  </tr>
                )) : (
                  <tr>
                    <td colSpan={5} className="muted-text text-center">Todavia no has guardado cierres.</td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        )}
      </article>
    </section>
  );
}

export default VentasReportsPanel;
