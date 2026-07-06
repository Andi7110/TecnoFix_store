import { useEffect, useState } from "react";
import DocumentPreviewModal from "./DocumentPreviewModal";
import { previewTicketPdf } from "../../api/reportes";

const loadingDocument = `
  <!doctype html>
  <html lang="es">
    <body style="margin:0;display:grid;place-items:center;min-height:100vh;font-family:Arial,sans-serif;color:#475569;">
      Generando PDF...
    </body>
  </html>
`;

const errorDocument = `
  <!doctype html>
  <html lang="es">
    <body style="margin:0;display:grid;place-items:center;min-height:100vh;font-family:Arial,sans-serif;color:#991b1b;">
      No se pudo cargar la vista previa PDF.
    </body>
  </html>
`;

function TicketPreviewModal({ venta, ticketConfig = null, onClose }) {
  const [pdfUrl, setPdfUrl] = useState("");
  const [loadError, setLoadError] = useState(false);

  useEffect(() => {
    let ignore = false;
    let objectUrl = "";

    async function loadPdfPreview() {
      setPdfUrl("");
      setLoadError(false);

      try {
        const blob = await previewTicketPdf(venta, ticketConfig);

        if (ignore) {
          return;
        }

        objectUrl = URL.createObjectURL(blob);
        setPdfUrl(objectUrl);
      } catch {
        setLoadError(true);
        setPdfUrl("");
      }
    }

    loadPdfPreview();

    return () => {
      ignore = true;

      if (objectUrl) {
        URL.revokeObjectURL(objectUrl);
      }
    };
  }, [venta, ticketConfig]);

  return (
    <DocumentPreviewModal
      title={`Ticket ${venta?.numero_venta ?? "TecnoFix"}`}
      subtitle="Vista previa de ticket"
      html={loadError ? errorDocument : loadingDocument}
      src={pdfUrl}
      onClose={onClose}
      frameClassName="report-preview-modal__frame--ticket"
    />
  );
}

export default TicketPreviewModal;
