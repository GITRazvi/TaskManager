// File responsibility: Guards authenticated routes and redirects unauthenticated users to login.
import { Navigate, Outlet, useLocation } from "react-router-dom";
import { useAuthStore } from "../../store/authStore";

/**
 * Allows nested routes only when an access token is stored.
 * location stores the attempted route so login can redirect back after authentication.
 */
export function ProtectedRoute() {
  const token = useAuthStore((state) => state.accessToken);
  const location = useLocation();

  if (!token) {
    return <Navigate to="/login" replace state={{ from: location }} />;
  }

  return <Outlet />;
}
