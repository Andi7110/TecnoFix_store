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
