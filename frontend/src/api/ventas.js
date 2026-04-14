import api from "./axios";
import { cleanQueryParams } from "./queryParams";

export async function listVentas(params = {}) {
  const response = await api.get("/ventas", {
    params: cleanQueryParams(params),
  });

  return response.data;
}

export async function getVenta(ventaId) {
  const response = await api.get(`/ventas/${ventaId}`);

  return response.data.data;
}

export async function createVenta(payload) {
  const response = await api.post("/ventas", payload);

  return response.data.data;
}

export async function listTransferAccounts() {
  const response = await api.get("/ventas/cuentas-transferencia");

  return response.data.data ?? [];
}

export async function createTransferAccount(payload = {}) {
  const response = await api.post("/ventas/cuentas-transferencia", payload);

  return response.data.data;
}

export async function updateTransferAccount(accountId, payload = {}) {
  const response = await api.put(`/ventas/cuentas-transferencia/${accountId}`, payload);

  return response.data.data;
}

export async function deleteTransferAccount(accountId) {
  await api.delete(`/ventas/cuentas-transferencia/${accountId}`);
}

export async function getDailySalesReport(params = {}) {
  const response = await api.get("/ventas/reportes/diario", {
    params: cleanQueryParams(params),
  });

  return response.data.data;
}

export async function getMonthlyIncomeStatement(params = {}) {
  const response = await api.get("/ventas/reportes/estado-resultados", {
    params: cleanQueryParams(params),
  });

  return response.data.data;
}

export async function saveDailySalesReport(payload = {}) {
  const response = await api.post("/ventas/reportes/diario", payload);

  return response.data.data;
}

export async function saveMonthlyIncomeStatement(payload = {}) {
  const response = await api.post("/ventas/reportes/estado-resultados", payload);

  return response.data.data;
}

export async function listSalesReports(params = {}) {
  const response = await api.get("/ventas/reportes/historial", {
    params: cleanQueryParams(params),
  });

  return response.data;
}
