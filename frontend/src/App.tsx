// File responsibility: Defines the frontend route tree, protected/public route behavior, and active theme binding.
import { Navigate, Route, Routes } from "react-router-dom";
import { useEffect } from "react";
import { AppLayout } from "./components/Common/AppLayout";
import { ProtectedRoute } from "./components/Common/ProtectedRoute";
import { useAuthStore } from "./store/authStore";
import { useThemeStore } from "./store/themeStore";
import { DashboardPage } from "./pages/DashboardPage";
import { LoginPage } from "./pages/LoginPage";
import { NotFoundPage } from "./pages/NotFoundPage";
import { ProfilePage } from "./pages/ProfilePage";
import { RegisterPage } from "./pages/RegisterPage";
import { ProjectsPage } from "./pages/ProjectsPage";
import { SprintBoardPage } from "./pages/SprintBoardPage";
import { TasksPage } from "./pages/TasksPage";
import { UsersPage } from "./pages/UsersPage";

/**
 * Blocks authenticated users from pages such as login and register.
 * children stores the public page element to render when no access token exists.
 */
function PublicOnly({ children }: { children: JSX.Element }) {
  const token = useAuthStore((state) => state.accessToken);
  return token ? <Navigate to="/" replace /> : children;
}

/**
 * Defines the application routes and writes the selected theme to the document root.
 */
export default function App() {
  const theme = useThemeStore((state) => state.theme);

  useEffect(() => {
    document.documentElement.dataset.theme = theme;
  }, [theme]);

  return (
    <Routes>
      <Route
        path="/login"
        element={
          <PublicOnly>
            <LoginPage />
          </PublicOnly>
        }
      />
      <Route
        path="/register"
        element={
          <PublicOnly>
            <RegisterPage />
          </PublicOnly>
        }
      />
      <Route element={<ProtectedRoute />}>
        <Route element={<AppLayout />}>
          <Route index element={<DashboardPage />} />
          <Route path="tasks" element={<TasksPage />} />
          <Route path="projects" element={<ProjectsPage />} />
          <Route path="sprints" element={<SprintBoardPage />} />
          <Route path="profile" element={<ProfilePage />} />
          <Route path="users" element={<UsersPage />} />
        </Route>
      </Route>
      <Route path="*" element={<NotFoundPage />} />
    </Routes>
  );
}
