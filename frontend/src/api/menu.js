import api from "./axios";

export async function getMenu() {
  const response = await api.get("/menu", { skipGlobalLoading: true });

  return response.data?.data ?? [];
}
