import api from "./axios";
import { cleanQueryParams } from "./queryParams";

export async function getReparacionesPaginadas(params = {}) {
  const response = await api.get("/reparaciones", {
    params: cleanQueryParams(params),
  });

  return response.data;
}

export async function getReparacion(reparacionId) {
  const response = await api.get(`/reparaciones/${reparacionId}`);

  return response.data.data;
}

export async function createReparacion(payload) {
  const response = await api.post("/reparaciones", payload);

  return response.data.data;
}

export async function updateReparacion(reparacionId, payload) {
  const response = await api.put(`/reparaciones/${reparacionId}`, payload);

  return response.data.data;
}

export async function updateEstadoReparacion(reparacionId, payload) {
  const response = await api.patch(`/reparaciones/${reparacionId}/estado`, payload);

  return response.data.data;
}

export const listReparaciones = getReparacionesPaginadas;
