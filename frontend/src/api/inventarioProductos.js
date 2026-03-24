import api from "./axios";
import { cleanQueryParams } from "./queryParams";

export async function getInventarioProductosPaginados(params = {}) {
  const response = await api.get("/inventario/productos/inventario", {
    params: cleanQueryParams(params),
  });

  return response.data;
}

export const listInventarioProductos = getInventarioProductosPaginados;
