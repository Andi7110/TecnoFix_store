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

  const normalizedValue = String(value).includes("T")
    ? value
    : String(value).replace(" ", "T");

  return new Intl.DateTimeFormat("es-SV", {
    dateStyle: "short",
  }).format(new Date(normalizedValue));
}

function formatMetodo(value) {
  return String(value ?? "-")
    .replace(/_/g, " ")
    .replace(/\b\w/g, (char) => char.toUpperCase());
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
      <td style="padding:4px 0;border-bottom:1px solid #222;">
        ${escapeHtml(detalle.producto?.nombre ?? detalle.descripcion_item ?? "Articulo")}
      </td>
      <td style="padding:4px 0;border-bottom:1px solid #222;text-align:center;">${escapeHtml(detalle.cantidad)}</td>
      <td style="padding:4px 0;border-bottom:1px solid #222;text-align:right;">${escapeHtml(formatCurrency(detalle.subtotal))}</td>
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
    footerNote: "Gracias por su compra en Tecnofix",
    ...loadTicketConfig(),
    ...overrideConfig,
  };

  printWindow.document.write(`
    <!doctype html>
    <html lang="es">
      <head>
        <meta charset="utf-8" />
        <title>${escapeHtml(ticketConfig.businessName)}</title>
      </head>
      <body style="margin:0;padding:16px;background:#f3f3f3;font-family:Arial,Helvetica,sans-serif;color:#111;">
        <main style="width:226px;min-height:560px;margin:0 auto;background:#fff;border-radius:16px;padding:22px 18px;box-shadow:0 14px 34px rgba(0,0,0,.18);">
          <header style="text-align:center;">
            <div style="font-family:Georgia,serif;font-size:38px;font-weight:800;letter-spacing:.04em;line-height:1;">${escapeHtml(ticketConfig.businessName)}</div>
            ${ticketConfig.businessAddress ? `<div style="font-size:11px;margin-top:12px;line-height:1.25;">${escapeHtml(ticketConfig.businessAddress)}</div>` : ""}
            ${ticketConfig.businessPhone ? `<div style="font-size:11px;margin-top:3px;">Tel: ${escapeHtml(ticketConfig.businessPhone)}</div>` : ""}
          </header>

          <section style="margin-top:22px;border-top:1px dashed #111;border-bottom:1px dashed #111;padding:9px 0;font-size:11px;">
            <div style="display:flex;justify-content:space-between;">
              <span>Fecha: ${escapeHtml(formatDate(venta.fecha_venta))}</span>
            </div>
          </section>

          <table style="width:100%;border-collapse:collapse;margin-top:10px;font-size:11px;">
            <thead>
              <tr>
                <th style="text-align:left;padding-bottom:4px;border-bottom:1px solid #111;font-weight:400;">Descripción</th>
                <th style="text-align:center;padding-bottom:4px;border-bottom:1px solid #111;font-weight:400;">Cant.</th>
                <th style="text-align:right;padding-bottom:4px;border-bottom:1px solid #111;font-weight:400;">Total</th>
              </tr>
            </thead>
            <tbody>
              ${buildItemsRows(detalles)}
            </tbody>
          </table>

          <section style="margin-top:16px;font-size:11px;">
            <div style="display:flex;justify-content:flex-end;gap:22px;margin-bottom:4px;">
              <span>Subtotal:</span>
              <span>${escapeHtml(formatCurrency(venta.subtotal))}</span>
            </div>
            ${Number(venta.descuento ?? 0) > 0 ? `
              <div style="display:flex;justify-content:flex-end;gap:22px;margin-bottom:4px;">
                <span>Descuento:</span>
                <span>${escapeHtml(formatCurrency(venta.descuento))}</span>
              </div>
            ` : ""}
            <div style="display:flex;justify-content:flex-end;gap:22px;font-weight:700;border-top:1px solid #111;padding-top:5px;">
              <span>Total:</span>
              <span>${escapeHtml(formatCurrency(venta.total))}</span>
            </div>
          </section>

          <section style="margin-top:18px;border-top:1px solid #111;padding-top:9px;font-size:11px;">
            <div style="display:flex;justify-content:space-between;gap:12px;">
              <span>Forma de pago:</span>
              <span>${escapeHtml(formatMetodo(venta.metodo_pago))}</span>
            </div>
          </section>

          <footer style="margin-top:34px;text-align:center;font-size:12px;font-weight:700;line-height:1.3;">
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
