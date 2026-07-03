import { CheckSquare } from "lucide-react";
import { LoginForm } from "../components/Auth/LoginForm";

export function LoginPage() {
  return (
    <main className="auth-page">
      <section className="auth-panel">
        <div className="auth-brand">
          <CheckSquare aria-hidden="true" />
          <div>
            <h1>TaskManager</h1>
            <p>Sign in to continue.</p>
          </div>
        </div>
        <LoginForm />
      </section>
    </main>
  );
}
