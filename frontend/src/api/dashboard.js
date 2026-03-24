import api from "./axios";

export async function getDashboardSummary() {
  const response = await api.get("/dashboard/resumen");

  return response.data.data;
}
