import { useEffect, useState } from "react";
import { listMovimientosCaja } from "../../api/caja";

export function useCajaList(filters) {
  const [movimientos, setMovimientos] = useState([]);
  const [meta, setMeta] = useState(null);
  const [summary, setSummary] = useState({
    total_entradas: 0,
    total_salidas: 0,
    balance: 0,
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [reloadToken, setReloadToken] = useState(0);

  useEffect(() => {
    let ignore = false;

    async function loadMovimientos() {
      setLoading(true);
      setError("");

      try {
        const response = await listMovimientosCaja(filters);

        if (!ignore) {
          setMovimientos(response.data ?? []);
          setMeta(response.meta ?? null);
          setSummary(
            response.summary ?? {
              total_entradas: 0,
              total_salidas: 0,
              balance: 0,
            }
          );
        }
      } catch {
        if (!ignore) {
          setError("No se pudieron cargar los movimientos de caja.");
        }
      } finally {
        if (!ignore) {
          setLoading(false);
        }
      }
    }

    loadMovimientos();

    return () => {
      ignore = true;
    };
  }, [filters, reloadToken]);

  function reload() {
    setReloadToken((current) => current + 1);
  }

  return {
    movimientos,
    meta,
    summary,
    loading,
    error,
    reload,
  };
}
