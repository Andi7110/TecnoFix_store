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

export async function entregarReparacion(reparacionId, payload) {
  const response = await api.post(`/reparaciones/${reparacionId}/entregar`, payload);

  return response.data.data;
}

export async function abonarReparacion(reparacionId, payload) {
  const response = await api.post(`/reparaciones/${reparacionId}/abonar`, payload);

  return response.data.data;
}

export async function createCostoReparacion(reparacionId, payload) {
  const response = await api.post(`/reparaciones/${reparacionId}/costos`, payload);

  return response.data.data;
}

export async function updateCostoReparacion(reparacionId, costoId, payload) {
  const response = await api.put(`/reparaciones/${reparacionId}/costos/${costoId}`, payload);

  return response.data.data;
}

export async function getDailyRepairReport(params = {}) {
  const response = await api.get("/reparaciones/reportes/diario", {
    params: cleanQueryParams(params),
  });

  return response.data.data;
}

export async function getMonthlyRepairReport(params = {}) {
  const response = await api.get("/reparaciones/reportes/mensual", {
    params: cleanQueryParams(params),
  });

  return response.data.data;
}

export async function saveDailyRepairReport(payload = {}) {
  const response = await api.post("/reparaciones/reportes/diario", payload);

  return response.data.data;
}

export async function saveMonthlyRepairReport(payload = {}) {
  const response = await api.post("/reparaciones/reportes/mensual", payload);

  return response.data.data;
}

export async function listRepairReports(params = {}) {
  const response = await api.get("/reparaciones/reportes/historial", {
    params: cleanQueryParams(params),
  });

  return response.data;
}

export const listReparaciones = getReparacionesPaginadas;
