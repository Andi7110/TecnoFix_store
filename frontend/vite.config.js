import { defineConfig, loadEnv } from "vite";
import react from "@vitejs/plugin-react";

function splitList(value) {
  return value
    .split(",")
    .map((item) => item.trim())
    .filter(Boolean);
}

function backendProxy(target, proxyOrigin) {
  return {
    target,
    changeOrigin: false,
    configure(proxy) {
      if (!proxyOrigin) {
        return;
      }

      proxy.on("proxyReq", (proxyRequest) => {
        proxyRequest.setHeader("origin", proxyOrigin);
        proxyRequest.setHeader("referer", `${proxyOrigin.replace(/\/$/, "")}/`);
      });
    },
  };
}

export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), "");
  const proxyTarget = env.VITE_DEV_PROXY_TARGET || "http://127.0.0.1:8000";
  const proxyOrigin = env.VITE_DEV_PROXY_ORIGIN || "";
  const allowedHosts = splitList(
    env.VITE_DEV_ALLOWED_HOSTS || "localhost,127.0.0.1",
  );

  return {
    plugins: [react()],
    server: {
      host: env.VITE_DEV_HOST || "127.0.0.1",
      allowedHosts,
      proxy: {
        "/api": backendProxy(proxyTarget, proxyOrigin),
        "/sanctum": backendProxy(proxyTarget, proxyOrigin),
      },
    },
  };
});
