import { BrowserRouter, Route, Routes } from "react-router-dom";
import ProtectedRoute from "../components/auth/ProtectedRoute";
import AppLayout from "../components/layout/AppLayout";
import Dashboard from "../pages/Dashboard";
import LoginPage from "../pages/auth/LoginPage";
import BitacoraPage from "../pages/bitacora/BitacoraPage";
import CajaMovimientosPage from "../pages/caja/CajaMovimientosPage";
import InventarioProductosPage from "../pages/productos/InventarioProductosPage";
import ProductosPage from "../pages/productos/ProductosPage";
import EditarReparacionPage from "../pages/reparaciones/EditarReparacionPage";
import ReparacionesPage from "../pages/reparaciones/ReparacionesPage";
import ReparacionesReportesPage from "../pages/reparaciones/ReparacionesReportesPage";
import VentasPage from "../pages/ventas/VentasPage";
import VentasReportesPage from "../pages/ventas/VentasReportesPage";

function AppRouter() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/login" element={<LoginPage />} />

        <Route element={<ProtectedRoute />}>
          <Route element={<AppLayout />}>
            <Route path="/" element={<Dashboard />} />
            <Route path="/caja" element={<CajaMovimientosPage />} />
            <Route path="/productos" element={<ProductosPage />} />
            <Route path="/productos/inventario" element={<InventarioProductosPage />} />
            <Route path="/ventas" element={<VentasPage />} />
            <Route path="/ventas/reportes" element={<VentasReportesPage />} />
            <Route path="/reparaciones" element={<ReparacionesPage />} />
            <Route path="/reparaciones/reportes" element={<ReparacionesReportesPage />} />
            <Route path="/reparaciones/:reparacionId/editar" element={<EditarReparacionPage />} />
            <Route path="/bitacora" element={<BitacoraPage />} />
          </Route>
        </Route>
      </Routes>
    </BrowserRouter>
  );
}

export default AppRouter;
