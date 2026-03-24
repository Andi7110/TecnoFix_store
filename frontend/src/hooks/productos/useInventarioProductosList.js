import { useEffect, useState } from "react";
import { listInventarioProductos } from "../../api/inventarioProductos";

export function useInventarioProductosList(filters) {
  const [registros, setRegistros] = useState([]);
  const [meta, setMeta] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [reloadToken, setReloadToken] = useState(0);

  useEffect(() => {
    let ignore = false;

    async function loadRegistros() {
      setLoading(true);
      setError("");

      try {
        const response = await listInventarioProductos(filters);

        if (ignore) {
          return;
        }

        setRegistros(response.data ?? []);
        setMeta(response.meta ?? null);
      } catch {
        if (ignore) {
          return;
        }

        setError("No se pudo cargar el inventario de productos.");
      } finally {
        if (!ignore) {
          setLoading(false);
        }
      }
    }

    loadRegistros();

    return () => {
      ignore = true;
    };
  }, [filters, reloadToken]);

  function reload() {
    setReloadToken((current) => current + 1);
  }

  return {
    registros,
    meta,
    loading,
    error,
    reload,
  };
}
