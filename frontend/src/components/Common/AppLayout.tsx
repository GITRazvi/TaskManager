import { CheckSquare, LayoutDashboard, LogOut, Rows3, UserCircle } from "lucide-react";
import { NavLink, Outlet, useNavigate } from "react-router-dom";
import { useLogout } from "../../hooks/useAuth";
import { useAuthStore } from "../../store/authStore";

export function AppLayout() {
  const navigate = useNavigate();
  const user = useAuthStore((state) => state.user);
  const logout = useLogout();

  const handleLogout = () => {
    logout.mutate(undefined, {
      onSettled: () => navigate("/login", { replace: true })
    });
  };

  return (
    <div className="app-shell">
      <aside className="sidebar">
        <div className="brand">
          <CheckSquare aria-hidden="true" />
          <span>TaskManager</span>
        </div>
        <nav className="nav-list" aria-label="Primary">
          <NavLink to="/" end>
            <LayoutDashboard aria-hidden="true" />
            Dashboard
          </NavLink>
          <NavLink to="/tasks">
            <Rows3 aria-hidden="true" />
            Tasks
          </NavLink>
          <NavLink to="/sprints">
            <CheckSquare aria-hidden="true" />
            Sprints
          </NavLink>
        </nav>
        <div className="sidebar-footer">
          <div className="user-chip">
            <UserCircle aria-hidden="true" />
            <span>{user?.fullName || user?.username || "Account"}</span>
          </div>
          <button className="icon-text-button" type="button" onClick={handleLogout}>
            <LogOut aria-hidden="true" />
            Logout
          </button>
        </div>
      </aside>
      <main className="main-area">
        <Outlet />
      </main>
    </div>
  );
}
