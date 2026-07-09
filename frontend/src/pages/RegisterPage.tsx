// File responsibility: Renders the registration page around the registration form.
import { CheckSquare } from "lucide-react";
import { RegisterForm } from "../components/Auth/RegisterForm";
import { ThemeToggle } from "../components/Common/ThemeToggle";

/**
 * Renders the account registration screen.
 */
export function RegisterPage() {
  return (
    <main className="auth-page">
      <section className="auth-panel">
        <div className="auth-actions">
          <ThemeToggle />
        </div>
        <div className="auth-brand">
          <CheckSquare aria-hidden="true" />
          <div>
            <h1>TaskManager</h1>
            <p>Create your workspace account.</p>
          </div>
        </div>
        <RegisterForm />
      </section>
    </main>
  );
}
