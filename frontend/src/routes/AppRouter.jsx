import { lazy, Suspense } from "react";
import { BrowserRouter, Route, Routes } from "react-router-dom";
import ModuleRoute from "../components/auth/ModuleRoute";
import ProtectedRoute from "../components/auth/ProtectedRoute";
import { GlobalLoadingOverlay } from "../components/interactions/GlobalInteractions";

const AppLayout = lazy(() => import("../components/layout/AppLayout"));
const Dashboard = lazy(() => import("../pages/Dashboard"));
const LoginPage = lazy(() => import("../pages/auth/LoginPage"));
const BitacoraPage = lazy(() => import("../pages/bitacora/BitacoraPage"));
const CajaMovimientosPage = lazy(() => import("../pages/caja/CajaMovimientosPage"));
const CajaComprobantesPage = lazy(() => import("../pages/caja/CajaComprobantesPage"));
const CajaReportesPage = lazy(() => import("../pages/caja/CajaReportesPage"));
const CostosPage = lazy(() => import("../pages/costos/CostosPage"));
const CuentasPorCobrarPage = lazy(() => import("../pages/cuentas/CuentasPorCobrarPage"));
const InventarioProductosPage = lazy(() => import("../pages/productos/InventarioProductosPage"));
const ProductosPage = lazy(() => import("../pages/productos/ProductosPage"));
const ReparacionesPage = lazy(() => import("../pages/reparaciones/ReparacionesPage"));
const ReparacionesReportesPage = lazy(() => import("../pages/reparaciones/ReparacionesReportesPage"));
const VentasPage = lazy(() => import("../pages/ventas/VentasPage"));
const VentasReportesPage = lazy(() => import("../pages/ventas/VentasReportesPage"));
const UsuariosPage = lazy(() => import("../pages/usuarios/UsuariosPage"));

function AppRouter() {
  return (
    <BrowserRouter>
      <Suspense fallback={<GlobalLoadingOverlay active message="Cargando modulo..." />}>
        <Routes>
          <Route path="/login" element={<LoginPage />} />

          <Route element={<ProtectedRoute />}>
            <Route element={<AppLayout />}>
              <Route element={<ModuleRoute module="dashboard" />}>
                <Route path="/" element={<Dashboard />} />
              </Route>
              <Route element={<ModuleRoute module="caja" />}>
                <Route path="/caja" element={<CajaMovimientosPage />} />
                <Route path="/caja/comprobantes" element={<CajaComprobantesPage />} />
                <Route path="/caja/reportes" element={<CajaReportesPage />} />
              </Route>
              <Route element={<ModuleRoute module="costos" />}>
                <Route path="/costos" element={<CostosPage />} />
              </Route>
              <Route element={<ModuleRoute module="cuentas_cobrar" />}>
                <Route path="/cuentas-por-cobrar" element={<CuentasPorCobrarPage />} />
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
      </Suspense>
    </BrowserRouter>
  );
}

export default AppRouter;
