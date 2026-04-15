import api from "./axios";
import { cleanQueryParams } from "./queryParams";

export async function listBitacora(params = {}) {
  const response = await api.get("/bitacora", {
    params: cleanQueryParams(params),
  });

  return response.data;
}

export async function getBitacora(bitacoraId) {
  const response = await api.get(`/bitacora/${bitacoraId}`);

  return response.data.data;
}
