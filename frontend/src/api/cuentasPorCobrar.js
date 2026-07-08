import api from "./axios";
import { cleanQueryParams } from "./queryParams";

export async function listCuentasPorCobrar(params = {}) {
  const response = await api.get("/cuentas-por-cobrar", {
    params: cleanQueryParams(params),
  });

  return response.data;
}

export async function getCuentaPorCobrar(cuentaId) {
  const response = await api.get(`/cuentas-por-cobrar/${cuentaId}`);

  return response.data.data;
}

export async function createAbonoCuentaPorCobrar(cuentaId, payload) {
  const response = await api.post(`/cuentas-por-cobrar/${cuentaId}/abonos`, payload);

  return response.data.data;
}
