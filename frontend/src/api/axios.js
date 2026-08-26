import axios from "axios";
import {
  startGlobalLoading,
  stopGlobalLoading,
} from "../components/interactions/globalLoadingEvents";

const loopbackHosts = new Set(["127.0.0.1", "localhost"]);
const loopbackUrlPattern = /^https?:\/\/(127\.0\.0\.1|localhost)(?=[:/]|$)/i;

function stripTrailingSlash(url) {
  return url.replace(/\/$/, "");
}

function normalizeUrl(url, fallbackPort) {
  if (typeof window === "undefined") {
    return url ?? `http://127.0.0.1:${fallbackPort}`;
  }

  const browserHostname = window.location.hostname;

  if (!loopbackHosts.has(browserHostname)) {
    return !url || loopbackUrlPattern.test(url)
      ? window.location.origin
      : url;
  }

  if (!url) {
    return `http://${browserHostname}:${fallbackPort}`;
  }

  return url.replace(/\/\/(127\.0\.0\.1|localhost)(?=[:/]|$)/, `//${browserHostname}`);
}

export const backendUrl = stripTrailingSlash(
  normalizeUrl(import.meta.env.VITE_BACKEND_URL, 8000),
);

const configuredApiUrl = stripTrailingSlash(
  normalizeUrl(import.meta.env.VITE_API_URL, 8000),
);

const apiUrl = configuredApiUrl.endsWith("/api")
  ? configuredApiUrl
  : `${backendUrl}/api`;

const api = axios.create({
  baseURL: apiUrl,
  withCredentials: true,
  withXSRFToken: true,
  xsrfCookieName: "XSRF-TOKEN",
  xsrfHeaderName: "X-XSRF-TOKEN",
  headers: {
    Accept: "application/json",
    "X-Requested-With": "XMLHttpRequest",
  },
});

api.interceptors.request.use((config) => {
  const method = config.method?.toLowerCase() ?? "get";

  if (!config.skipGlobalLoading && ["post", "put", "patch", "delete"].includes(method)) {
    config.__globalLoadingToken = startGlobalLoading("Cargando...");
  }

  return config;
});

api.interceptors.response.use(
  (response) => {
    if (response.config?.__globalLoadingToken) {
      stopGlobalLoading();
    }

    return response;
  },
  (error) => {
    if (error.config?.__globalLoadingToken) {
      stopGlobalLoading();
    }

    if (
      error?.response?.status === 401
      && typeof window !== "undefined"
      && window.location.pathname !== "/login"
    ) {
      window.location.assign("/login");
    }

    return Promise.reject(error);
  },
);

export default api;
