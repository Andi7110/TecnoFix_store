import api from "./axios";
import { cleanQueryParams } from "./queryParams";

export async function listCostos(params = {}) {
  const response = await api.get("/costos", {
    params: cleanQueryParams(params),
  });

  return response.data;
}

export async function createCosto(payload) {
  const response = await api.post("/costos", payload);

  return response.data.data;
}

export async function getCostosResumen(params = {}) {
  const response = await api.get("/costos/resumen", {
    params: cleanQueryParams(params),
  });

  return response.data.data;
}
