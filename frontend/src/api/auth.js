import axios from "axios";
import api, { backendUrl } from "./axios";

const csrfClient = axios.create({
  baseURL: backendUrl,
  withCredentials: true,
  withXSRFToken: true,
  headers: {
    Accept: "application/json",
    "X-Requested-With": "XMLHttpRequest",
  },
});

export async function getCsrfCookie() {
  await csrfClient.get("/sanctum/csrf-cookie");
}

export async function login(payload) {
  await getCsrfCookie();

  const response = await api.post("/auth/login", payload);

  return response.data.data;
}

export async function logout() {
  await api.post("/auth/logout");
}

export async function getAuthenticatedUser() {
  const response = await api.get("/auth/me");

  return response.data.data;
}
