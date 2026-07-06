import { useEffect, useState } from "react";
import DocumentPreviewModal from "./DocumentPreviewModal";
import { previewReportPdf } from "../../api/reportes";

const reportTitles = {
  daily: "Reporte diario de ventas",
  monthly: "Estado de resultados mensual",
  "repair-daily": "Reporte diario de reparaciones",
  "repair-monthly": "Reporte mensual de reparaciones",
};

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

function ReportPreviewModal({ type, report, onClose }) {
  const [pdfUrl, setPdfUrl] = useState("");
  const [loadError, setLoadError] = useState(false);

  useEffect(() => {
    let ignore = false;
    let objectUrl = "";

    async function loadPdfPreview() {
      setPdfUrl("");
      setLoadError(false);

      try {
        const blob = await previewReportPdf(type, report);

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
  }, [type, report]);

  return (
    <DocumentPreviewModal
      title={reportTitles[type] ?? "Reporte"}
      html={loadError ? errorDocument : loadingDocument}
      src={pdfUrl}
      onClose={onClose}
    />
  );
}

export default ReportPreviewModal;
