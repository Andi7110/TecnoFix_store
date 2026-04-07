function formatCurrency(value) {
  return new Intl.NumberFormat("es-SV", {
    style: "currency",
    currency: "USD",
  }).format(Number(value ?? 0));
}

function formatDate(value) {
  if (!value) {
    return "-";
  }

  return new Intl.DateTimeFormat("es-SV", {
    dateStyle: "medium",
    timeStyle: "short",
  }).format(new Date(value));
}

function escapeHtml(value) {
  return String(value ?? "")
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#039;");
}

function buildItemsRows(detalles = []) {
  return detalles.map((detalle) => `
    <tr>
      <td style="padding:8px 0;border-bottom:1px dashed #d4d4d8;">
        <div style="font-weight:700;">${escapeHtml(detalle.producto?.nombre ?? detalle.descripcion_item ?? "Articulo")}</div>
        <div style="font-size:12px;color:#71717a;">${escapeHtml(detalle.producto?.codigo ?? "")}</div>
      </td>
      <td style="padding:8px 0;border-bottom:1px dashed #d4d4d8;text-align:center;">${escapeHtml(detalle.cantidad)}</td>
      <td style="padding:8px 0;border-bottom:1px dashed #d4d4d8;text-align:right;">${escapeHtml(formatCurrency(detalle.subtotal))}</td>
    </tr>
  `).join("");
}

function loadTicketConfig() {
  if (typeof window === "undefined") {
    return null;
  }

  try {
    const rawValue = window.localStorage.getItem("tecnofix-pos-ticket-config");

    return rawValue ? JSON.parse(rawValue) : null;
  } catch {
    return null;
  }
}

export function printSaleTicket(venta, overrideConfig = null) {
  if (typeof window === "undefined" || !venta) {
    return;
  }

  const printWindow = window.open("", "_blank", "width=420,height=900");

  if (!printWindow) {
    return;
  }

  const detalles = venta.detalles ?? [];
  const ticketConfig = {
    businessName: "TecnoFix",
    businessPhone: "",
    businessAddress: "",
    footerNote: "Gracias por tu compra",
    ...loadTicketConfig(),
    ...overrideConfig,
  };

  printWindow.document.write(`
    <!doctype html>
    <html lang="es">
      <head>
        <meta charset="utf-8" />
        <title>${escapeHtml(venta.numero_venta ?? "Ticket de venta")}</title>
      </head>
      <body style="margin:0;padding:18px;background:#f4f4f5;font-family:Arial,sans-serif;">
        <main style="max-width:320px;margin:0 auto;background:#fff;border:1px solid #e4e4e7;border-radius:18px;padding:18px;color:#18181b;">
          <header style="text-align:center;border-bottom:1px dashed #d4d4d8;padding-bottom:14px;">
            <div style="font-size:17px;font-weight:800;">${escapeHtml(ticketConfig.businessName)}</div>
            ${ticketConfig.businessPhone ? `<div style="font-size:12px;color:#52525b;margin-top:4px;">Tel: ${escapeHtml(ticketConfig.businessPhone)}</div>` : ""}
            ${ticketConfig.businessAddress ? `<div style="font-size:12px;color:#52525b;margin-top:2px;">${escapeHtml(ticketConfig.businessAddress)}</div>` : ""}
            <div style="font-size:11px;letter-spacing:.18em;text-transform:uppercase;color:#71717a;">Ticket de venta</div>
            <h1 style="margin:8px 0 4px;font-size:20px;">${escapeHtml(venta.numero_venta ?? "Venta")}</h1>
            <p style="margin:0;font-size:12px;color:#52525b;">${escapeHtml(formatDate(venta.fecha_venta))}</p>
          </header>

          <section style="display:grid;gap:10px;margin-top:14px;">
            <div style="display:flex;justify-content:space-between;gap:12px;font-size:13px;">
              <span style="color:#71717a;">Modulo</span>
              <strong style="text-align:right;">${escapeHtml(venta.modulo?.nombre ?? "General")}</strong>
            </div>
            <div style="display:flex;justify-content:space-between;gap:12px;font-size:13px;">
              <span style="color:#71717a;">Metodo</span>
              <strong style="text-align:right;">${escapeHtml(venta.metodo_pago ?? "-")}</strong>
            </div>
          </section>

          <table style="width:100%;border-collapse:collapse;margin-top:14px;font-size:13px;">
            <thead>
              <tr>
                <th style="text-align:left;padding-bottom:8px;color:#71717a;font-size:11px;text-transform:uppercase;">Articulo</th>
                <th style="text-align:center;padding-bottom:8px;color:#71717a;font-size:11px;text-transform:uppercase;">Cant.</th>
                <th style="text-align:right;padding-bottom:8px;color:#71717a;font-size:11px;text-transform:uppercase;">Total</th>
              </tr>
            </thead>
            <tbody>
              ${buildItemsRows(detalles)}
            </tbody>
          </table>

          <section style="margin-top:14px;border-top:1px dashed #d4d4d8;padding-top:14px;">
            <div style="display:flex;justify-content:space-between;font-size:13px;margin-bottom:6px;">
              <span style="color:#71717a;">Subtotal</span>
              <strong>${escapeHtml(formatCurrency(venta.subtotal))}</strong>
            </div>
            <div style="display:flex;justify-content:space-between;font-size:13px;margin-bottom:6px;">
              <span style="color:#71717a;">Descuento</span>
              <strong>${escapeHtml(formatCurrency(venta.descuento))}</strong>
            </div>
            <div style="display:flex;justify-content:space-between;font-size:16px;margin-top:10px;">
              <span>Total</span>
              <strong>${escapeHtml(formatCurrency(venta.total))}</strong>
            </div>
          </section>

          ${venta.observacion ? `
            <section style="margin-top:14px;padding-top:14px;border-top:1px dashed #d4d4d8;">
              <div style="font-size:11px;text-transform:uppercase;letter-spacing:.14em;color:#71717a;">Observacion</div>
              <p style="margin:8px 0 0;font-size:13px;line-height:1.45;">${escapeHtml(venta.observacion)}</p>
            </section>
          ` : ""}

          <footer style="margin-top:18px;text-align:center;font-size:11px;color:#71717a;">
            ${escapeHtml(ticketConfig.footerNote)}
          </footer>
        </main>
      </body>
    </html>
  `);
  printWindow.document.close();
  printWindow.focus();
  printWindow.print();
}
