import { useState } from "react";
import { updateProductoEstado } from "../../api/productos";

export function useProductoEstado() {
  const [pendingId, setPendingId] = useState(null);

  async function changeEstado(producto) {
    setPendingId(producto.id);

    try {
      await updateProductoEstado(producto.id, !producto.estado);
    } finally {
      setPendingId(null);
    }
  }

  return {
    pendingId,
    changeEstado,
  };
}
