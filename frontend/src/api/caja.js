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

export const listMovimientosCaja = getMovimientosCajaPaginados;
