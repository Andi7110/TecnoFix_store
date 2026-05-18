function formatCurrency(value) {
  return new Intl.NumberFormat("es-SV", {
    style: "currency",
    currency: "USD",
  }).format(Number(value ?? 0));
}

function formatPercent(value) {
  return `${Number(value ?? 0).toFixed(2)}%`;
}

function escapeHtml(value) {
  return String(value ?? "")
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#039;");
}

function buildRows(rows, columns) {
  if (!rows?.length) {
    return `<tr><td colspan="${columns.length}" style="text-align:center;color:#64748b;">Sin registros.</td></tr>`;
  }

  return rows.map((row) => `
    <tr>
      ${columns.map((column) => `<td>${escapeHtml(column.render(row))}</td>`).join("")}
    </tr>
  `).join("");
}

function buildSection(title, tableHeaders, rows, columns) {
  return `
    <section style="margin-top:24px;">
      <h3 style="margin:0 0 12px;font-size:16px;color:#0f172a;">${escapeHtml(title)}</h3>
      <table style="width:100%;border-collapse:collapse;font-size:13px;">
        <thead>
          <tr>
            ${tableHeaders.map((header) => `<th style="text-align:left;padding:10px;border-bottom:1px solid #cbd5e1;color:#475569;">${escapeHtml(header)}</th>`).join("")}
          </tr>
        </thead>
        <tbody>
          ${buildRows(rows, columns)}
        </tbody>
      </table>
    </section>
  `;
}

function buildDailyHtml(report) {
  const metrics = [
    ["Ventas netas", formatCurrency(report.resumen.ventas_netas)],
    ["Costo de ventas", formatCurrency(report.resumen.costo_ventas)],
    ["Utilidad bruta", formatCurrency(report.resumen.utilidad_bruta)],
    ["Margen bruto", formatPercent(report.resumen.margen_bruto_porcentaje)],
    ["Ventas del dia", String(report.resumen.ventas_count)],
    ["Items vendidos", String(report.resumen.items_vendidos)],
    ["Ticket promedio", formatCurrency(report.resumen.ticket_promedio)],
    ["Caja neta", formatCurrency(report.caja.neto)],
  ];

  return `
    <h1 style="margin:0 0 8px;font-size:24px;color:#0f172a;">Reporte diario de ventas</h1>
    <p style="margin:0;color:#475569;">Fecha: ${escapeHtml(report.fecha)}${report.modulo?.nombre ? ` | Modulo: ${escapeHtml(report.modulo.nombre)}` : ""}</p>
    <div style="display:grid;grid-template-columns:repeat(4,1fr);gap:12px;margin-top:20px;">
      ${metrics.map(([label, value]) => `
        <div style="border:1px solid #cbd5e1;border-radius:12px;padding:12px;background:#f8fafc;">
          <div style="font-size:11px;letter-spacing:.08em;text-transform:uppercase;color:#64748b;">${escapeHtml(label)}</div>
          <div style="margin-top:6px;font-size:18px;font-weight:700;color:#0f172a;">${escapeHtml(value)}</div>
        </div>
      `).join("")}
    </div>
    ${buildSection("Ventas por metodo", ["Metodo", "Ventas", "Total"], report.ventas_por_metodo, [
      { render: (row) => row.metodo_pago },
      { render: (row) => row.ventas_count },
      { render: (row) => formatCurrency(row.total) },
    ])}
    ${buildSection("Ventas por modulo", ["Modulo", "Ventas", "Utilidad"], report.ventas_por_modulo, [
      { render: (row) => row.modulo_nombre },
      { render: (row) => formatCurrency(row.ventas_netas) },
      { render: (row) => formatCurrency(row.utilidad_bruta) },
    ])}
    ${buildSection("Top productos", ["Producto", "Cantidad", "Total", "Utilidad"], report.top_productos, [
      { render: (row) => `${row.producto_nombre}${row.producto_codigo ? ` (${row.producto_codigo})` : ""}` },
      { render: (row) => row.cantidad },
      { render: (row) => formatCurrency(row.total) },
      { render: (row) => formatCurrency(row.utilidad_bruta) },
    ])}
  `;
}

function buildMonthlyHtml(report) {
  const metrics = [
    ["Ventas netas", formatCurrency(report.estado_resultados.ventas_netas)],
    ["Otros ingresos", formatCurrency(report.estado_resultados.otros_ingresos)],
    ["Ingresos operativos", formatCurrency(report.estado_resultados.ingresos_operativos)],
    ["Costo de ventas", formatCurrency(report.estado_resultados.costo_ventas)],
    ["Utilidad bruta", formatCurrency(report.estado_resultados.utilidad_bruta)],
    ["Gastos operativos", formatCurrency(report.estado_resultados.gastos_operativos)],
    ["Utilidad operativa", formatCurrency(report.estado_resultados.utilidad_operativa)],
    ["Margen operativo", formatPercent(report.estado_resultados.margen_operativo_porcentaje)],
  ];

  return `
    <h1 style="margin:0 0 8px;font-size:24px;color:#0f172a;">Estado de resultados mensual</h1>
    <p style="margin:0;color:#475569;">Periodo: ${escapeHtml(report.periodo.etiqueta)}${report.modulo?.nombre ? ` | Modulo: ${escapeHtml(report.modulo.nombre)}` : ""}</p>
    <div style="display:grid;grid-template-columns:repeat(4,1fr);gap:12px;margin-top:20px;">
      ${metrics.map(([label, value]) => `
        <div style="border:1px solid #cbd5e1;border-radius:12px;padding:12px;background:#f8fafc;">
          <div style="font-size:11px;letter-spacing:.08em;text-transform:uppercase;color:#64748b;">${escapeHtml(label)}</div>
          <div style="margin-top:6px;font-size:18px;font-weight:700;color:#0f172a;">${escapeHtml(value)}</div>
        </div>
      `).join("")}
    </div>
    ${buildSection("Gastos operativos", ["Categoria", "Mov.", "Total"], report.detalle_gastos_operativos, [
      { render: (row) => row.categoria_movimiento },
      { render: (row) => row.movimientos_count },
      { render: (row) => formatCurrency(row.total) },
    ])}
    ${buildSection("Movimientos excluidos", ["Tipo", "Categoria", "Total"], report.movimientos_excluidos, [
      { render: (row) => row.tipo_movimiento },
      { render: (row) => row.categoria_movimiento },
      { render: (row) => formatCurrency(row.total) },
    ])}
    <section style="margin-top:24px;">
      <h3 style="margin:0 0 12px;font-size:16px;color:#0f172a;">Notas</h3>
      <ul style="margin:0;padding-left:18px;color:#334155;">
        ${report.notas.map((note) => `<li style="margin-top:6px;">${escapeHtml(note)}</li>`).join("")}
      </ul>
    </section>
  `;
}

function buildRepairDailyHtml(report) {
  const metrics = [
    ["Ingresadas", String(report.resumen.ingresadas)],
    ["Entregadas", String(report.resumen.entregadas)],
    ["Ingresos caja", formatCurrency(report.resumen.ingresos_caja)],
    ["Costos", formatCurrency(report.resumen.costos_reparacion)],
    ["Utilidad", formatCurrency(report.resumen.utilidad_reparaciones)],
    ["Margen utilidad", formatPercent(report.resumen.margen_utilidad_porcentaje)],
    ["Valor estimado", formatCurrency(report.resumen.valor_estimado)],
    ["Saldo abierto", formatCurrency(report.resumen.saldo_pendiente_abierto)],
  ];

  return `
    <h1 style="margin:0 0 8px;font-size:24px;color:#0f172a;">Reporte diario de reparaciones</h1>
    <p style="margin:0;color:#475569;">Fecha: ${escapeHtml(report.fecha)}${report.modulo?.nombre ? ` | Modulo: ${escapeHtml(report.modulo.nombre)}` : ""}</p>
    <div style="display:grid;grid-template-columns:repeat(3,1fr);gap:12px;margin-top:20px;">
      ${metrics.map(([label, value]) => `
        <div style="border:1px solid #cbd5e1;border-radius:12px;padding:12px;background:#f8fafc;">
          <div style="font-size:11px;letter-spacing:.08em;text-transform:uppercase;color:#64748b;">${escapeHtml(label)}</div>
          <div style="margin-top:6px;font-size:18px;font-weight:700;color:#0f172a;">${escapeHtml(value)}</div>
        </div>
      `).join("")}
    </div>
    ${buildSection("Estado actual", ["Estado", "Cantidad", "Saldo"], report.estado_actual, [
      { render: (row) => row.estado },
      { render: (row) => row.total },
      { render: (row) => formatCurrency(row.saldo_pendiente) },
    ])}
    ${buildSection("Ingresos por modulo", ["Modulo", "Movimientos", "Total"], report.ingresos_por_modulo, [
      { render: (row) => row.modulo_nombre },
      { render: (row) => row.movimientos },
      { render: (row) => formatCurrency(row.total) },
    ])}
    ${buildSection("Costos por tipo", ["Tipo", "Movimientos", "Total"], report.costos_por_tipo, [
      { render: (row) => row.tipo_costo },
      { render: (row) => row.movimientos },
      { render: (row) => formatCurrency(row.total) },
    ])}
    ${buildSection("Entregas recientes", ["Codigo", "Cliente", "Equipo", "Costo"], report.entregas_recientes, [
      { render: (row) => row.codigo_reparacion },
      { render: (row) => row.cliente_nombre },
      { render: (row) => row.equipo },
      { render: (row) => formatCurrency(row.costo_reparacion) },
    ])}
  `;
}

function buildRepairMonthlyHtml(report) {
  const metrics = [
    ["Ingresadas", String(report.resumen.ingresadas)],
    ["Entregadas", String(report.resumen.entregadas)],
    ["Ingresos caja", formatCurrency(report.resumen.ingresos_caja)],
    ["Costos", formatCurrency(report.resumen.costos_reparacion)],
    ["Utilidad", formatCurrency(report.resumen.utilidad_reparaciones)],
    ["Margen utilidad", formatPercent(report.resumen.margen_utilidad_porcentaje)],
    ["Valor entregado", formatCurrency(report.resumen.valor_entregado)],
    ["Saldo abierto", formatCurrency(report.resumen.saldo_pendiente_abierto)],
  ];

  return `
    <h1 style="margin:0 0 8px;font-size:24px;color:#0f172a;">Reporte mensual de reparaciones</h1>
    <p style="margin:0;color:#475569;">Periodo: ${escapeHtml(report.periodo.etiqueta)}${report.modulo?.nombre ? ` | Modulo: ${escapeHtml(report.modulo.nombre)}` : ""}</p>
    <div style="display:grid;grid-template-columns:repeat(3,1fr);gap:12px;margin-top:20px;">
      ${metrics.map(([label, value]) => `
        <div style="border:1px solid #cbd5e1;border-radius:12px;padding:12px;background:#f8fafc;">
          <div style="font-size:11px;letter-spacing:.08em;text-transform:uppercase;color:#64748b;">${escapeHtml(label)}</div>
          <div style="margin-top:6px;font-size:18px;font-weight:700;color:#0f172a;">${escapeHtml(value)}</div>
        </div>
      `).join("")}
    </div>
    ${buildSection("Ingresos por dia", ["Fecha", "Movimientos", "Total"], report.ingresos_por_dia, [
      { render: (row) => row.fecha },
      { render: (row) => row.movimientos },
      { render: (row) => formatCurrency(row.total) },
    ])}
    ${buildSection("Costos por tipo", ["Tipo", "Movimientos", "Total"], report.costos_por_tipo, [
      { render: (row) => row.tipo_costo },
      { render: (row) => row.movimientos },
      { render: (row) => formatCurrency(row.total) },
    ])}
    ${buildSection("Reparaciones por estado", ["Estado", "Cantidad", "Valor"], report.reparaciones_por_estado, [
      { render: (row) => row.estado },
      { render: (row) => row.total },
      { render: (row) => formatCurrency(row.valor) },
    ])}
  `;
}

export function exportReportToPdf(type, report) {
  if (typeof window === "undefined" || !report) {
    return;
  }

  const printWindow = window.open("", "_blank", "width=1200,height=900");

  if (!printWindow) {
    return;
  }

  const builders = {
    daily: {
      title: "Reporte diario de ventas",
      body: buildDailyHtml,
    },
    monthly: {
      title: "Estado de resultados mensual",
      body: buildMonthlyHtml,
    },
    "repair-daily": {
      title: "Reporte diario de reparaciones",
      body: buildRepairDailyHtml,
    },
    "repair-monthly": {
      title: "Reporte mensual de reparaciones",
      body: buildRepairMonthlyHtml,
    },
  };
  const builder = builders[type] ?? builders.daily;
  const title = builder.title;
  const body = builder.body(report);

  printWindow.document.write(`
    <!doctype html>
    <html lang="es">
      <head>
        <meta charset="utf-8" />
        <title>${escapeHtml(title)}</title>
      </head>
      <body style="font-family:Arial,sans-serif;padding:32px;color:#0f172a;">
        ${body}
      </body>
    </html>
  `);
  printWindow.document.close();
  printWindow.focus();
  printWindow.print();
}
