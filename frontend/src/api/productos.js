import api from "./axios";
import { cleanQueryParams } from "./queryParams";

function isFileValue(value) {
  return typeof File !== "undefined" && value instanceof File;
}

function toProductoFormData(payload, methodOverride = null) {
  const formData = new FormData();

  Object.entries(payload ?? {}).forEach(([key, value]) => {
    if (value === undefined) {
      return;
    }

    if (value === null) {
      formData.append(key, "");
      return;
    }

    if (isFileValue(value)) {
      formData.append(key, value);
      return;
    }

    if (Array.isArray(value)) {
      value.forEach((item) => {
        if (item !== undefined && item !== null) {
          formData.append(`${key}[]`, item);
        }
      });
      return;
    }

    if (typeof value === "boolean") {
      formData.append(key, value ? "1" : "0");
      return;
    }

    formData.append(key, String(value));
  });

  if (methodOverride) {
    formData.append("_method", methodOverride);
  }

  return formData;
}

export async function getProductosPaginados(params = {}, options = {}) {
  const response = await api.get("/inventario/productos", {
    params: cleanQueryParams(params),
    signal: options.signal,
  });

  return response.data;
}

export async function getProducto(productoId) {
  const response = await api.get(`/inventario/productos/${productoId}`);

  return response.data.data;
}

export async function getNextProductoCode(moduloId, categoriaId, options = {}) {
  const response = await api.get("/inventario/productos/siguiente-codigo", {
    params: {
      modulo_id: moduloId,
      categoria_id: categoriaId,
    },
    signal: options.signal,
  });

  return response.data.data;
}

export async function createProducto(payload) {
  const hasFotos = isFileValue(payload?.foto) || payload?.fotos_variantes?.some(isFileValue);
  const response = hasFotos
    ? await api.post("/inventario/productos", toProductoFormData(payload))
    : await api.post("/inventario/productos", payload);

  return response.data.data;
}

export async function updateProducto(productoId, payload) {
  const hasFotos = isFileValue(payload?.foto) || payload?.fotos_variantes?.some(isFileValue);
  const response = hasFotos
    ? await api.post(
      `/inventario/productos/${productoId}`,
      toProductoFormData(payload, "PUT"),
    )
    : await api.put(`/inventario/productos/${productoId}`, payload);

  return response.data.data;
}

export async function changeProductoEstado(productoId, estado) {
  const response = await api.patch(`/inventario/productos/${productoId}/estado`, {
    estado,
  });

  return response.data.data;
}

export async function deleteProducto(productoId) {
  const response = await api.delete(`/inventario/productos/${productoId}`);

  return response.data;
}

export async function createMovimientoInventario(payload) {
  const response = await api.post("/inventario/movimientos", payload);

  return response.data.data;
}

export const listProductos = getProductosPaginados;
export const updateProductoEstado = changeProductoEstado;
