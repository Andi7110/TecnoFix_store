import { useState } from "react";
import { getVenta } from "../../api/ventas";

export function useVentaDetail() {
  const [venta, setVenta] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  async function openVenta(ventaId) {
    setLoading(true);
    setError("");

    try {
      const detalle = await getVenta(ventaId);
      setVenta(detalle);
    } catch (requestError) {
      setError(
        requestError?.response?.data?.message
          || "No se pudo cargar el detalle de la venta.",
      );
    } finally {
      setLoading(false);
    }
  }

  function closeVenta() {
    setVenta(null);
    setError("");
  }

  return {
    venta,
    loading,
    error,
    openVenta,
    closeVenta,
  };
}
