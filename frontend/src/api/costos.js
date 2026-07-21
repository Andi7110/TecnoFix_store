import api from "./axios";
import { cleanQueryParams } from "./queryParams";

export async function listCostos(params = {}) {
  const response = await api.get("/costos", {
    params: cleanQueryParams(params),
  });

  return response.data;
}

export async function createCosto(payload) {
  return postCostoForm("/costos", payload);
}

export async function createCompraInventario(payload) {
  return postCostoForm("/costos/compras", payload);
}

async function postCostoForm(url, payload) {
  const formData = new FormData();

  Object.entries(payload).forEach(([key, value]) => {
    if (key === "comprobantes") {
      value.forEach((file) => formData.append("comprobantes[]", file));
    } else if (typeof value === "boolean") {
      formData.append(key, value ? "1" : "0");
    } else if (value !== null && value !== undefined && value !== "") {
      formData.append(key, value);
    }
  });

  const response = await api.post(url, formData);

  return response.data.data;
}

export async function getCostosResumen(params = {}) {
  const response = await api.get("/costos/resumen", {
    params: cleanQueryParams(params),
  });

  return response.data.data;
}
