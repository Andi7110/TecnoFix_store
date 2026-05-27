import { Navigate, Outlet, useLocation } from "react-router-dom";
import { GlobalLoadingOverlay } from "../interactions/GlobalInteractions";
import { useAuth } from "../../hooks/auth/useAuth";

function ProtectedRoute() {
  const location = useLocation();
  const { isAuthenticated, loading } = useAuth();

  if (loading) {
    return <GlobalLoadingOverlay active message="Cargando..." />;
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" replace state={{ from: location }} />;
  }

  return <Outlet />;
}

export default ProtectedRoute;
