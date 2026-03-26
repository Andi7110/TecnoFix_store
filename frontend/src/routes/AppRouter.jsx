import { BrowserRouter, Route, Routes } from "react-router-dom";
import ProtectedRoute from "../components/auth/ProtectedRoute";
import AppLayout from "../components/layout/AppLayout";
import Dashboard from "../pages/Dashboard";
import LoginPage from "../pages/auth/LoginPage";
import CrearMovimientoCajaPage from "../pages/caja/CrearMovimientoCajaPage";
import CajaMovimientosPage from "../pages/caja/CajaMovimientosPage";
import CrearProductoPage from "../pages/productos/CrearProductoPage";
import EditarProductoPage from "../pages/productos/EditarProductoPage";
import InventarioProductosPage from "../pages/productos/InventarioProductosPage";
import ProductosPage from "../pages/productos/ProductosPage";
import CrearReparacionPage from "../pages/reparaciones/CrearReparacionPage";
import EditarReparacionPage from "../pages/reparaciones/EditarReparacionPage";
import ReparacionesPage from "../pages/reparaciones/ReparacionesPage";
import CrearVentaPage from "../pages/ventas/CrearVentaPage";
import VentasPage from "../pages/ventas/VentasPage";

function AppRouter() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/login" element={<LoginPage />} />

        <Route element={<ProtectedRoute />}>
          <Route element={<AppLayout />}>
            <Route path="/" element={<Dashboard />} />
            <Route path="/caja" element={<CajaMovimientosPage />} />
            <Route path="/caja/nuevo" element={<CrearMovimientoCajaPage />} />
            <Route path="/productos" element={<ProductosPage />} />
            <Route path="/productos/inventario" element={<InventarioProductosPage />} />
            <Route path="/productos/nuevo" element={<CrearProductoPage />} />
            <Route path="/productos/:productoId/editar" element={<EditarProductoPage />} />
            <Route path="/ventas" element={<VentasPage />} />
            <Route path="/ventas/nueva" element={<CrearVentaPage />} />
            <Route path="/reparaciones" element={<ReparacionesPage />} />
            <Route path="/reparaciones/nueva" element={<CrearReparacionPage />} />
            <Route path="/reparaciones/:reparacionId/editar" element={<EditarReparacionPage />} />
          </Route>
        </Route>
      </Routes>
    </BrowserRouter>
  );
}

export default AppRouter;
