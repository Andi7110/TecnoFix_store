import { Navigate, Outlet, useLocation } from "react-router-dom";
import { useAuth } from "../../hooks/auth/useAuth";

function ProtectedRoute() {
  const location = useLocation();
  const { isAuthenticated, loading } = useAuth();

  if (loading) {
    return (
      <div className="auth-screen auth-screen--loading">
        <div className="surface-card auth-loading-card">
          <p className="section-kicker">TecnoFix</p>
          <h1>Cargando sesión</h1>
          <p className="muted-text">Validando acceso al sistema.</p>
        </div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" replace state={{ from: location }} />;
  }

  return <Outlet />;
}

export default ProtectedRoute;
