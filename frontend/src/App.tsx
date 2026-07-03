import { Navigate, Route, Routes } from "react-router-dom";
import { AppLayout } from "./components/Common/AppLayout";
import { ProtectedRoute } from "./components/Common/ProtectedRoute";
import { useAuthStore } from "./store/authStore";
import { DashboardPage } from "./pages/DashboardPage";
import { LoginPage } from "./pages/LoginPage";
import { NotFoundPage } from "./pages/NotFoundPage";
import { RegisterPage } from "./pages/RegisterPage";
import { SprintBoardPage } from "./pages/SprintBoardPage";
import { TasksPage } from "./pages/TasksPage";

function PublicOnly({ children }: { children: JSX.Element }) {
  const token = useAuthStore((state) => state.accessToken);
  return token ? <Navigate to="/" replace /> : children;
}

export default function App() {
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
          <Route path="sprints" element={<SprintBoardPage />} />
        </Route>
      </Route>
      <Route path="*" element={<NotFoundPage />} />
    </Routes>
  );
}
