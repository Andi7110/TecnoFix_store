import { buildCode39Svg, sanitizeCode39Value } from "./barcode39";

function escapeHtml(value) {
  return String(value ?? "")
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#039;");
}

function formatCurrency(value) {
  return new Intl.NumberFormat("es-SV", {
    style: "currency",
    currency: "USD",
  }).format(Number(value ?? 0));
}

function normalizePrintItems(items = []) {
  return items.flatMap((item) => {
    const quantity = Math.max(0, Number(item.quantity ?? 0));

    if (!quantity) {
      return [];
    }

    const codigo = sanitizeCode39Value(item.codigo);

    return Array.from({ length: quantity }, (_, index) => ({
      id: `${item.id ?? codigo}-${index}`,
      codigo,
      nombre: item.nombre ?? "Producto",
      precio: item.precio_venta ?? 0,
    }));
  });
}

export function printProductBarcodes(items) {
  if (typeof window === "undefined") {
    return;
  }

  const printableItems = normalizePrintItems(items);

  if (!printableItems.length) {
    throw new Error("Selecciona al menos una etiqueta para imprimir.");
  }

  const printWindow = window.open("", "_blank", "width=1200,height=900");

  if (!printWindow) {
    throw new Error("No se pudo abrir la ventana de impresion.");
  }

  const labelsMarkup = printableItems.map((item) => `
    <article class="barcode-print__label">
      <div class="barcode-print__name">${escapeHtml(item.nombre)}</div>
      <div class="barcode-print__svg">${buildCode39Svg(item.codigo, { height: 68, narrowWidth: 2, wideWidth: 5, quietZone: 10 })}</div>
      <div class="barcode-print__meta">
        <span>${escapeHtml(item.codigo)}</span>
        <strong>${escapeHtml(formatCurrency(item.precio))}</strong>
      </div>
    </article>
  `).join("");

  printWindow.document.write(`
    <!doctype html>
    <html lang="es">
      <head>
        <meta charset="utf-8" />
        <title>Etiquetas de codigo de barras</title>
        <style>
          @page {
            size: A4 portrait;
            margin: 8mm;
          }

          * {
            box-sizing: border-box;
          }

          body {
            margin: 0;
            font-family: Arial, sans-serif;
            color: #111827;
            background: #ffffff;
          }

          .barcode-print {
            display: grid;
            grid-template-columns: repeat(3, minmax(0, 1fr));
            gap: 6mm;
          }

          .barcode-print__label {
            min-height: 34mm;
            border: 1px solid #d1d5db;
            border-radius: 4mm;
            padding: 3.5mm;
            display: flex;
            flex-direction: column;
            justify-content: space-between;
            break-inside: avoid;
          }

          .barcode-print__name {
            font-size: 10.5pt;
            font-weight: 700;
            line-height: 1.2;
            min-height: 10mm;
          }

          .barcode-print__svg {
            margin: 2mm 0 1.5mm;
          }

          .barcode-print__svg svg {
            display: block;
            width: 100%;
            height: 16mm;
          }

          .barcode-print__meta {
            display: flex;
            justify-content: space-between;
            gap: 3mm;
            align-items: center;
            font-size: 9pt;
          }

          .barcode-print__meta span {
            letter-spacing: 0.08em;
          }

          .barcode-print__meta strong {
            font-size: 10pt;
          }
        </style>
      </head>
      <body>
        <main class="barcode-print">
          ${labelsMarkup}
        </main>
      </body>
    </html>
  `);
  printWindow.document.close();
  printWindow.focus();
  printWindow.print();
}
