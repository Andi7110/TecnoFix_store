import { BrowserRouter, Route, Routes } from "react-router-dom";
import ModuleRoute from "../components/auth/ModuleRoute";
import ProtectedRoute from "../components/auth/ProtectedRoute";
import AppLayout from "../components/layout/AppLayout";
import Dashboard from "../pages/Dashboard";
import LoginPage from "../pages/auth/LoginPage";
import BitacoraPage from "../pages/bitacora/BitacoraPage";
import CajaMovimientosPage from "../pages/caja/CajaMovimientosPage";
import CostosPage from "../pages/costos/CostosPage";
import InventarioProductosPage from "../pages/productos/InventarioProductosPage";
import ProductosPage from "../pages/productos/ProductosPage";
import ReparacionesPage from "../pages/reparaciones/ReparacionesPage";
import ReparacionesReportesPage from "../pages/reparaciones/ReparacionesReportesPage";
import VentasPage from "../pages/ventas/VentasPage";
import VentasReportesPage from "../pages/ventas/VentasReportesPage";
import UsuariosPage from "../pages/usuarios/UsuariosPage";

function AppRouter() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/login" element={<LoginPage />} />

        <Route element={<ProtectedRoute />}>
          <Route element={<AppLayout />}>
            <Route element={<ModuleRoute module="dashboard" />}>
              <Route path="/" element={<Dashboard />} />
            </Route>
            <Route element={<ModuleRoute module="caja" />}>
              <Route path="/caja" element={<CajaMovimientosPage />} />
            </Route>
            <Route element={<ModuleRoute module="costos" />}>
              <Route path="/costos" element={<CostosPage />} />
            </Route>
            <Route element={<ModuleRoute module="inventario" />}>
              <Route path="/productos" element={<ProductosPage />} />
              <Route path="/productos/inventario" element={<InventarioProductosPage />} />
            </Route>
            <Route element={<ModuleRoute module="ventas" />}>
              <Route path="/ventas" element={<VentasPage />} />
              <Route path="/ventas/reportes" element={<VentasReportesPage />} />
            </Route>
            <Route element={<ModuleRoute module="reparaciones" />}>
              <Route path="/reparaciones" element={<ReparacionesPage />} />
              <Route path="/reparaciones/reportes" element={<ReparacionesReportesPage />} />
            </Route>
            <Route element={<ModuleRoute module="bitacora" />}>
              <Route path="/bitacora" element={<BitacoraPage />} />
            </Route>
            <Route element={<ModuleRoute module="usuarios" />}>
              <Route path="/usuarios" element={<UsuariosPage />} />
            </Route>
          </Route>
        </Route>
      </Routes>
    </BrowserRouter>
  );
}

export default AppRouter;
