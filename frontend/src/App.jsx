import "./App.css";
import "./components/auth/auth.css";
import "./components/bitacora/bitacora.css";
import "./components/caja/caja.css";
import "./components/costos/costos.css";
import "./components/dashboard/dashboard.css";
import "./components/productos/productos.css";
import "./components/reparaciones/reparaciones.css";
import "./components/ventas/ventas.css";
import { QueryClientProvider } from "@tanstack/react-query";
import { ToastContainer } from "react-toastify";
import GlobalInteractions from "./components/interactions/GlobalInteractions";
import AuthProvider from "./context/AuthProvider";
import { queryClient } from "./lib/queryClient";
import AppRouter from "./routes/AppRouter";

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <AuthProvider>
        <GlobalInteractions>
          <AppRouter />
          <ToastContainer
            position="top-right"
            autoClose={2800}
            hideProgressBar={false}
            newestOnTop
            closeOnClick
            pauseOnFocusLoss
            pauseOnHover
            theme="colored"
          />
        </GlobalInteractions>
      </AuthProvider>
    </QueryClientProvider>
  );
}

export default App;
