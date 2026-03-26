import { useEffect, useState } from "react";
import { listVentas } from "../../api/ventas";

export function useVentasList(filters) {
  const [ventas, setVentas] = useState([]);
  const [meta, setMeta] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [reloadToken, setReloadToken] = useState(0);

  useEffect(() => {
    let ignore = false;

    async function loadVentas() {
      setLoading(true);
      setError("");

      try {
        const response = await listVentas(filters);

        if (ignore) {
          return;
        }

        setVentas(response.data ?? []);
        setMeta(response.meta ?? null);
      } catch (requestError) {
        if (ignore) {
          return;
        }

        setError(
          requestError?.response?.data?.message
            || "No se pudieron cargar las ventas.",
        );
      } finally {
        if (!ignore) {
          setLoading(false);
        }
      }
    }

    loadVentas();

    return () => {
      ignore = true;
    };
  }, [filters, reloadToken]);

  function reload() {
    setReloadToken((current) => current + 1);
  }

  return {
    ventas,
    meta,
    loading,
    error,
    reload,
  };
}
