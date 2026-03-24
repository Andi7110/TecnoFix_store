import { useEffect, useState } from "react";
import { listReparaciones } from "../../api/reparaciones";

export function useReparacionesList(filters) {
  const [reparaciones, setReparaciones] = useState([]);
  const [meta, setMeta] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [reloadToken, setReloadToken] = useState(0);

  useEffect(() => {
    let ignore = false;

    async function loadReparaciones() {
      setLoading(true);
      setError("");

      try {
        const response = await listReparaciones(filters);

        if (!ignore) {
          setReparaciones(response.data ?? []);
          setMeta(response.meta ?? null);
        }
      } catch {
        if (!ignore) {
          setError("No se pudieron cargar las reparaciones.");
        }
      } finally {
        if (!ignore) {
          setLoading(false);
        }
      }
    }

    loadReparaciones();

    return () => {
      ignore = true;
    };
  }, [filters, reloadToken]);

  function reload() {
    setReloadToken((current) => current + 1);
  }

  return {
    reparaciones,
    meta,
    loading,
    error,
    reload,
  };
}
