import { useEffect, useState } from "react";
import { listCategorias, listModulos } from "../../api/inventarioCatalogos";

const EXCLUDED_PRODUCT_MODULES = new Set([
  "caja_general",
  "copias_impresiones",
  "inventario",
  "reparaciones",
]);

export function useProductoCatalogos(moduloId = "", excludeProductIncompatibleModules = false) {
  const [modulos, setModulos] = useState([]);
  const [categorias, setCategorias] = useState([]);
  const [loading, setLoading] = useState(true);
  const [loadingCategorias, setLoadingCategorias] = useState(false);

  useEffect(() => {
    let ignore = false;

    async function loadModulos() {
      setLoading(true);

      try {
        const data = await listModulos();
        const modules = excludeProductIncompatibleModules
          ? data.filter(
            (modulo) => !EXCLUDED_PRODUCT_MODULES.has(String(modulo.nombre ?? "").toLowerCase()),
          )
          : data;

        if (!ignore) {
          setModulos(modules);
        }
      } finally {
        if (!ignore) {
          setLoading(false);
        }
      }
    }

    loadModulos();

    return () => {
      ignore = true;
    };
  }, [excludeProductIncompatibleModules]);

  useEffect(() => {
    let ignore = false;

    async function loadCategorias() {
      const moduloDisponible = modulos.some(
        (modulo) => String(modulo.id) === String(moduloId),
      );

      if (!moduloId || !moduloDisponible) {
        if (!ignore) {
          setCategorias([]);
          setLoadingCategorias(false);
        }
        return;
      }

      setLoadingCategorias(true);

      try {
        const data = await listCategorias({ modulo_id: moduloId });

        if (!ignore) {
          setCategorias(data);
        }
      } finally {
        if (!ignore) {
          setLoadingCategorias(false);
        }
      }
    }

    loadCategorias();

    return () => {
      ignore = true;
    };
  }, [moduloId, modulos]);

  return {
    modulos,
    categorias,
    loading,
    loadingCategorias,
  };
}
