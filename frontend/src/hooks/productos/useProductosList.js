import { useEffect, useState } from "react";
import { listProductos } from "../../api/productos";

export function useProductosList(filters) {
  const [productos, setProductos] = useState([]);
  const [meta, setMeta] = useState(null);
  const [links, setLinks] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [reloadToken, setReloadToken] = useState(0);

  useEffect(() => {
    let ignore = false;

    async function loadProductos() {
      setLoading(true);
      setError("");

      try {
        const response = await listProductos(filters);

        if (ignore) {
          return;
        }

        setProductos(response.data ?? []);
        setMeta(response.meta ?? null);
        setLinks(response.links ?? null);
      } catch {
        if (ignore) {
          return;
        }

        setError("No se pudieron cargar los productos.");
      } finally {
        if (!ignore) {
          setLoading(false);
        }
      }
    }

    loadProductos();

    return () => {
      ignore = true;
    };
  }, [filters, reloadToken]);

  function reload() {
    setReloadToken((current) => current + 1);
  }

  return {
    productos,
    meta,
    links,
    loading,
    error,
    reload,
  };
}
