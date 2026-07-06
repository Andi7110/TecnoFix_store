import { useEffect, useState } from "react";
import { listBitacora } from "../../api/bitacora";
import { notifyError } from "../../utils/toasts";

export function useBitacoraList(filters) {
  const [movimientos, setMovimientos] = useState([]);
  const [meta, setMeta] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    let ignore = false;

    async function loadBitacora() {
      setLoading(true);
      setError("");

      try {
        const response = await listBitacora(filters);

        if (!ignore) {
          setMovimientos(response.data ?? []);
          setMeta(response.meta ?? null);
        }
      } catch {
        if (!ignore) {
          const message = "No se pudo cargar la bitacora del sistema.";
          setError(message);
          notifyError(message);
        }
      } finally {
        if (!ignore) {
          setLoading(false);
        }
      }
    }

    loadBitacora();

    return () => {
      ignore = true;
    };
  }, [filters]);

  return {
    movimientos,
    meta,
    loading,
    error,
  };
}
