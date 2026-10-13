// File responsibility: Renders the authenticated shell with navigation, theme controls, and nested page outlet.
import { CheckSquare, FolderKanban, LayoutDashboard, LogOut, Rows3, UserCircle } from "lucide-react";
import { NavLink, Outlet, useNavigate } from "react-router-dom";
import { useLogout } from "../../hooks/useAuth";
import { useAuthStore } from "../../store/authStore";
import { ThemeToggle } from "./ThemeToggle";

/**
 * Renders the authenticated application shell.
 * It stores the current user for navigation visibility and wires logout back to the login route.
 */
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
          <NavLink to="/projects">
            <FolderKanban aria-hidden="true" />
            Projects
          </NavLink>
          <NavLink to="/sprints">
            <CheckSquare aria-hidden="true" />
            Sprints
          </NavLink>
        </nav>
        <div className="sidebar-footer">
          <NavLink className="user-chip" to="/profile" aria-label="Open profile">
            <UserCircle aria-hidden="true" />
            <span>{user?.fullName || user?.username || "Account"}</span>
          </NavLink>
          <ThemeToggle />
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
