import api from "./axios";
import { cleanQueryParams } from "./queryParams";

export async function listModulos(params = {}) {
  const response = await api.get("/inventario/modulos", {
    params: cleanQueryParams({
      per_page: 100,
      ...params,
    }),
  });

  return response.data.data;
}

export async function listCategorias(params = {}) {
  const response = await api.get("/inventario/categorias", {
    params: cleanQueryParams({
      per_page: 100,
      ...params,
    }),
  });

  return response.data.data;
}
