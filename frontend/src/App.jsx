import "./App.css";
import "./components/auth/auth.css";
import "./components/bitacora/bitacora.css";
import "./components/caja/caja.css";
import "./components/dashboard/dashboard.css";
import "./components/productos/productos.css";
import "./components/reparaciones/reparaciones.css";
import "./components/ventas/ventas.css";
import AuthProvider from "./context/AuthProvider";
import AppRouter from "./routes/AppRouter";

function App() {
  return (
    <AuthProvider>
      <AppRouter />
    </AuthProvider>
  );
}

export default App;
