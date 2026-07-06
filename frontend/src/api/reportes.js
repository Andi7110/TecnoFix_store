import api from "./axios";

export async function previewReportPdf(type, report) {
  const response = await api.post(
    "/reportes/pdf",
    { type, report },
    {
      responseType: "blob",
      skipGlobalLoading: true,
    },
  );

  return response.data;
}

export async function previewBarcodePdf(items) {
  const response = await api.post(
    "/reportes/codigos/pdf",
    { items },
    {
      responseType: "blob",
      skipGlobalLoading: true,
    },
  );

  return response.data;
}

export async function previewTicketPdf(venta, ticketConfig = null) {
  const response = await api.post(
    "/reportes/ticket/pdf",
    { venta, ticketConfig },
    {
      responseType: "blob",
      skipGlobalLoading: true,
    },
  );

  return response.data;
}
