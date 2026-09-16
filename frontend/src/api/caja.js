import api from "./axios";
import { cleanQueryParams } from "./queryParams";

export async function getMovimientosCajaPaginados(params = {}) {
  const response = await api.get("/caja/movimientos", {
    params: cleanQueryParams(params),
  });

  return response.data;
}

export async function getMovimientoCaja(movimientoId) {
  const response = await api.get(`/caja/movimientos/${movimientoId}`);

  return response.data.data;
}

export async function createMovimientoCaja(payload) {
  const response = await api.post("/caja/movimientos", payload);

  return response.data.data;
}

export async function getMonthlyCajaReport(params = {}) {
  const response = await api.get("/caja/reportes/mensual", {
    params: cleanQueryParams(params),
  });

  return response.data.data;
}

export async function getBalanceGeneralCajaReport(params = {}) {
  const response = await api.get("/caja/reportes/balance-general", {
    params: cleanQueryParams(params),
  });

  return response.data.data;
}

export async function closeMonthlyCajaReport(payload = {}) {
  const response = await api.post("/caja/reportes/cierre", payload);

  return response.data.data;
}

export async function listMonthlyCajaClosures(params = {}) {
  const response = await api.get("/caja/reportes/historial", {
    params: cleanQueryParams(params),
  });

  return response.data;
}

export const listMovimientosCaja = getMovimientosCajaPaginados;

export async function listComprobantesCaja(params = {}) {
  const response = await api.get("/caja/comprobantes", {
    params: cleanQueryParams(params),
  });

  return response.data;
}

export async function getComprobanteArchivo(archivoUrl) {
  const response = await api.get(archivoUrl, {
    responseType: "blob",
    skipGlobalLoading: true,
  });

  return {
    blob: response.data,
    mimeType: response.headers["content-type"] || response.data?.type,
  };
}
