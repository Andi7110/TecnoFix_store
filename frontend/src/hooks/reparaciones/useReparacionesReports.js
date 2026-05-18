import { useEffect, useState } from "react";
import {
  getDailyRepairReport,
  getMonthlyRepairReport,
  listRepairReports,
  saveDailyRepairReport,
  saveMonthlyRepairReport,
} from "../../api/reparaciones";

function getTodayDateValue() {
  const now = new Date();
  const year = now.getFullYear();
  const month = String(now.getMonth() + 1).padStart(2, "0");
  const day = String(now.getDate()).padStart(2, "0");

  return `${year}-${month}-${day}`;
}

export function getInitialReparacionesReportFilters() {
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

export function useReparacionesReports() {
  const initialFilters = getInitialReparacionesReportFilters();
  const [dailyQuery, setDailyQuery] = useState(initialFilters.daily);
  const [monthlyQuery, setMonthlyQuery] = useState(initialFilters.monthly);
  const [dailyReport, setDailyReport] = useState(null);
  const [monthlyReport, setMonthlyReport] = useState(null);
  const [dailyLoading, setDailyLoading] = useState(true);
  const [monthlyLoading, setMonthlyLoading] = useState(true);
  const [dailyError, setDailyError] = useState("");
  const [monthlyError, setMonthlyError] = useState("");
  const [history, setHistory] = useState([]);
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
        const report = await getDailyRepairReport(dailyQuery);

        if (!ignore) {
          setDailyReport(report);
        }
      } catch (requestError) {
        if (!ignore) {
          setDailyError(requestError?.response?.data?.message || "No se pudo generar el reporte diario.");
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
        const report = await getMonthlyRepairReport(monthlyQuery);

        if (!ignore) {
          setMonthlyReport(report);
        }
      } catch (requestError) {
        if (!ignore) {
          setMonthlyError(requestError?.response?.data?.message || "No se pudo generar el reporte mensual.");
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

  async function refreshHistory() {
    setHistoryLoading(true);
    setHistoryError("");

    try {
      const response = await listRepairReports({ per_page: 10 });
      setHistory(response.data ?? []);
    } catch (requestError) {
      setHistoryError(requestError?.response?.data?.message || "No se pudo cargar el historial de reportes.");
    } finally {
      setHistoryLoading(false);
    }
  }

  useEffect(() => {
    refreshHistory();
  }, []);

  async function saveDailyReport(filters) {
    setDailySaving(true);

    try {
      const saved = await saveDailyRepairReport(filters);
      await refreshHistory();

      return saved;
    } finally {
      setDailySaving(false);
    }
  }

  async function saveMonthlyReport(filters) {
    setMonthlySaving(true);

    try {
      const saved = await saveMonthlyRepairReport(filters);
      await refreshHistory();

      return saved;
    } finally {
      setMonthlySaving(false);
    }
  }

  return {
    initialFilters,
    dailyReport,
    dailyLoading,
    dailyError,
    dailySaving,
    monthlyReport,
    monthlyLoading,
    monthlyError,
    monthlySaving,
    history,
    historyLoading,
    historyError,
    generateDailyReport: setDailyQuery,
    generateMonthlyReport: setMonthlyQuery,
    saveDailyReport,
    saveMonthlyReport,
  };
}
