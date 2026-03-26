import axios from "axios";

const loopbackHosts = new Set(["127.0.0.1", "localhost"]);

function getBrowserHostname() {
  if (typeof window === "undefined") {
    return null;
  }

  return window.location.hostname;
}

function normalizeLoopbackUrl(url, fallbackPort) {
  const browserHostname = getBrowserHostname();

  if (!browserHostname || !loopbackHosts.has(browserHostname)) {
    return url ?? `http://127.0.0.1:${fallbackPort}`;
  }

  if (!url) {
    return `http://${browserHostname}:${fallbackPort}`;
  }

  return url.replace(/\/\/(127\.0\.0\.1|localhost)(?=[:/]|$)/, `//${browserHostname}`);
}

export const backendUrl = normalizeLoopbackUrl(
  import.meta.env.VITE_BACKEND_URL,
  8000,
);

const apiUrl = normalizeLoopbackUrl(import.meta.env.VITE_API_URL, 8000).endsWith("/api")
  ? normalizeLoopbackUrl(import.meta.env.VITE_API_URL, 8000)
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

api.interceptors.response.use(
  (response) => response,
  (error) => {
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
