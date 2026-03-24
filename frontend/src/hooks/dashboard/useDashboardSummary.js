import { useEffect, useState } from "react";
import { getDashboardSummary } from "../../api/dashboard";

const initialSummary = {
  today: {
    total_vendido: 0,
    total_entradas: 0,
    total_salidas: 0,
    productos_stock_bajo: 0,
    reparaciones_pendientes: 0,
  },
  ventas_por_modulo: [],
  resumen_dia: {
    fecha: "",
    balance_caja: 0,
    modulos_con_ventas: 0,
  },
  generated_at: null,
};

export function useDashboardSummary() {
  const [summary, setSummary] = useState(initialSummary);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    let ignore = false;

    async function loadSummary() {
      setLoading(true);
      setError("");

      try {
        const data = await getDashboardSummary();

        if (!ignore) {
          setSummary(data);
        }
      } catch {
        if (!ignore) {
          setError("No se pudo cargar el resumen del dashboard.");
        }
      } finally {
        if (!ignore) {
          setLoading(false);
        }
      }
    }

    loadSummary();

    return () => {
      ignore = true;
    };
  }, []);

  return {
    summary,
    loading,
    error,
  };
}
