import { useCallback, useEffect, useState } from "react";
import {
  closeMonthlyCajaReport,
  getMonthlyCajaReport,
  listMonthlyCajaClosures,
} from "../../api/caja";
import { notifyError, notifySuccess } from "../../utils/toasts";

function currentPeriod() {
  const date = new Date();

  return {
    anio: String(date.getFullYear()),
    mes: String(date.getMonth() + 1),
  };
}

export function useCajaReports() {
  const [filters, setFilters] = useState(currentPeriod);
  const [query, setQuery] = useState(currentPeriod);
  const [report, setReport] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [closing, setClosing] = useState(false);
  const [history, setHistory] = useState([]);
  const [historyLoading, setHistoryLoading] = useState(true);
  const [historyError, setHistoryError] = useState("");

  const loadHistory = useCallback(async () => {
    setHistoryLoading(true);
    setHistoryError("");

    try {
      const response = await listMonthlyCajaClosures({ per_page: 24 });
      setHistory(response.data ?? []);
    } catch (requestError) {
      setHistoryError(requestError?.response?.data?.message || "No se pudo cargar el historial de cierres.");
    } finally {
      setHistoryLoading(false);
    }
  }, []);

  useEffect(() => {
    let ignore = false;

    async function loadReport() {
      setLoading(true);
      setError("");

      try {
        const data = await getMonthlyCajaReport(query);
        if (!ignore) setReport(data);
      } catch (requestError) {
        if (!ignore) {
          const message = requestError?.response?.data?.message || "No se pudo generar el reporte mensual.";
          setError(message);
          notifyError(message);
        }
      } finally {
        if (!ignore) setLoading(false);
      }
    }

    loadReport();

    return () => {
      ignore = true;
    };
  }, [query]);

  useEffect(() => {
    loadHistory();
  }, [loadHistory]);

  function updateFilter(name, value) {
    setFilters((current) => ({ ...current, [name]: value }));
  }

  function generate() {
    setQuery({ ...filters });
  }

  async function closeMonth() {
    setClosing(true);

    try {
      await closeMonthlyCajaReport(query);
      const updated = await getMonthlyCajaReport(query);
      setReport(updated);
      await loadHistory();
      notifySuccess("Cierre mensual guardado en el historial.");
    } catch (requestError) {
      notifyError(requestError?.response?.data?.message || "No se pudo guardar el cierre mensual.");
    } finally {
      setClosing(false);
    }
  }

  function showSavedClosure(item) {
    setFilters({ anio: String(item.anio), mes: String(item.mes) });
    setReport({
      ...(item.payload ?? {}),
      cierre: {
        id: item.id,
        cerrado_en: item.created_at,
        actualizado_en: item.updated_at,
      },
    });
  }

  return {
    filters,
    updateFilter,
    generate,
    report,
    showSavedClosure,
    loading,
    error,
    closing,
    closeMonth,
    history,
    historyLoading,
    historyError,
  };
}
