import { useEffect, useState } from "react";
import {
  getDailySalesReport,
  getMonthlyIncomeStatement,
  listSalesReports,
  saveDailySalesReport,
  saveMonthlyIncomeStatement,
} from "../../api/ventas";

function getTodayDateValue() {
  const now = new Date();
  const year = now.getFullYear();
  const month = String(now.getMonth() + 1).padStart(2, "0");
  const day = String(now.getDate()).padStart(2, "0");

  return `${year}-${month}-${day}`;
}

export function getInitialVentasReportFilters() {
  const now = new Date();

  return {
    daily: {
      fecha: getTodayDateValue(),
      modulo_id: "",
    },
    monthly: {
      anio: String(now.getFullYear()),
      mes: String(now.getMonth() + 1),
      modulo_id: "",
    },
  };
}

export function useVentasReports() {
  const initialFilters = getInitialVentasReportFilters();
  const [dailyQuery, setDailyQuery] = useState(initialFilters.daily);
  const [monthlyQuery, setMonthlyQuery] = useState(initialFilters.monthly);
  const [dailyReport, setDailyReport] = useState(null);
  const [monthlyReport, setMonthlyReport] = useState(null);
  const [dailyLoading, setDailyLoading] = useState(true);
  const [monthlyLoading, setMonthlyLoading] = useState(true);
  const [dailyError, setDailyError] = useState("");
  const [monthlyError, setMonthlyError] = useState("");
  const [history, setHistory] = useState([]);
  const [historyMeta, setHistoryMeta] = useState(null);
  const [historyLoading, setHistoryLoading] = useState(true);
  const [historyError, setHistoryError] = useState("");
  const [dailySaving, setDailySaving] = useState(false);
  const [monthlySaving, setMonthlySaving] = useState(false);

  useEffect(() => {
    let ignore = false;

    async function loadDailyReport() {
      setDailyLoading(true);
      setDailyError("");

      try {
        const report = await getDailySalesReport(dailyQuery);

        if (!ignore) {
          setDailyReport(report);
        }
      } catch (requestError) {
        if (!ignore) {
          setDailyError(
            requestError?.response?.data?.message
              || "No se pudo generar el reporte diario.",
          );
        }
      } finally {
        if (!ignore) {
          setDailyLoading(false);
        }
      }
    }

    loadDailyReport();

    return () => {
      ignore = true;
    };
  }, [dailyQuery]);

  useEffect(() => {
    let ignore = false;

    async function loadMonthlyReport() {
      setMonthlyLoading(true);
      setMonthlyError("");

      try {
        const report = await getMonthlyIncomeStatement(monthlyQuery);

        if (!ignore) {
          setMonthlyReport(report);
        }
      } catch (requestError) {
        if (!ignore) {
          setMonthlyError(
            requestError?.response?.data?.message
              || "No se pudo generar el estado de resultados.",
          );
        }
      } finally {
        if (!ignore) {
          setMonthlyLoading(false);
        }
      }
    }

    loadMonthlyReport();

    return () => {
      ignore = true;
    };
  }, [monthlyQuery]);

  useEffect(() => {
    let ignore = false;

    async function loadHistory() {
      setHistoryLoading(true);
      setHistoryError("");

      try {
        const response = await listSalesReports({ per_page: 10 });

        if (!ignore) {
          setHistory(response.data ?? []);
          setHistoryMeta(response.meta ?? null);
        }
      } catch (requestError) {
        if (!ignore) {
          setHistoryError(
            requestError?.response?.data?.message
              || "No se pudo cargar el historial de reportes.",
          );
        }
      } finally {
        if (!ignore) {
          setHistoryLoading(false);
        }
      }
    }

    loadHistory();

    return () => {
      ignore = true;
    };
  }, []);

  function generateDailyReport(filters) {
    setDailyQuery(filters);
  }

  function generateMonthlyReport(filters) {
    setMonthlyQuery(filters);
  }

  async function refreshHistory() {
    setHistoryLoading(true);
    setHistoryError("");

    try {
      const response = await listSalesReports({ per_page: 10 });
      setHistory(response.data ?? []);
      setHistoryMeta(response.meta ?? null);
    } catch (requestError) {
      setHistoryError(
        requestError?.response?.data?.message
          || "No se pudo actualizar el historial de reportes.",
      );
    } finally {
      setHistoryLoading(false);
    }
  }

  async function saveDailyReport(filters) {
    setDailySaving(true);

    try {
      const saved = await saveDailySalesReport(filters);
      await refreshHistory();

      return saved;
    } finally {
      setDailySaving(false);
    }
  }

  async function saveMonthlyReport(filters) {
    setMonthlySaving(true);

    try {
      const saved = await saveMonthlyIncomeStatement(filters);
      await refreshHistory();

      return saved;
    } finally {
      setMonthlySaving(false);
    }
  }

  return {
    dailyReport,
    dailyLoading,
    dailyError,
    monthlyReport,
    monthlyLoading,
    monthlyError,
    generateDailyReport,
    generateMonthlyReport,
    initialFilters,
    saveDailyReport,
    saveMonthlyReport,
    history,
    historyMeta,
    historyLoading,
    historyError,
    dailySaving,
    monthlySaving,
  };
}
