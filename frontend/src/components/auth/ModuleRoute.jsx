import { Navigate, Outlet } from "react-router-dom";
import { useAuth } from "../../hooks/auth/useAuth";
import { canAccessModule, getDefaultPathForUser } from "../../utils/accessControl";

function ModuleRoute({ module }) {
  const { user } = useAuth();

  if (!canAccessModule(user, module)) {
    return <Navigate to={getDefaultPathForUser(user)} replace />;
  }

  return <Outlet />;
}

export default ModuleRoute;
