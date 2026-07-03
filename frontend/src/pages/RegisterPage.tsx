import { CheckSquare } from "lucide-react";
import { RegisterForm } from "../components/Auth/RegisterForm";

export function RegisterPage() {
  return (
    <main className="auth-page">
      <section className="auth-panel">
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
