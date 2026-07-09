// File responsibility: Renders and validates the login form and submits login credentials.
import { zodResolver } from "@hookform/resolvers/zod";
import { LogIn } from "lucide-react";
import { useForm } from "react-hook-form";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { z } from "zod";
import { getApiErrorMessage } from "../../api/client";
import { useLogin } from "../../hooks/useAuth";

const schema = z.object({
  email: z.string().email("Enter a valid email"),
  password: z.string().min(1, "Password is required")
});

type FormValues = z.infer<typeof schema>;

/**
 * Renders the login form and submits credentials through the auth mutation.
 */
export function LoginForm() {
  const login = useLogin();
  const navigate = useNavigate();
  const location = useLocation();
  const form = useForm<FormValues>({
    resolver: zodResolver(schema),
    defaultValues: { email: "", password: "" }
  });
  const from = (location.state as { from?: { pathname?: string } } | null)?.from?.pathname ?? "/";

  const onSubmit = form.handleSubmit((values) => {
    login.mutate(values, {
      onSuccess: () => navigate(from, { replace: true })
    });
  });

  return (
    <form className="auth-form" onSubmit={onSubmit}>
      <label>
        Email
        <input type="email" autoComplete="email" {...form.register("email")} />
        {form.formState.errors.email && <small>{form.formState.errors.email.message}</small>}
      </label>
      <label>
        Password
        <input type="password" autoComplete="current-password" {...form.register("password")} />
        {form.formState.errors.password && <small>{form.formState.errors.password.message}</small>}
      </label>
      {login.isError && <p className="form-error">{getApiErrorMessage(login.error)}</p>}
      <button className="primary-button" type="submit" disabled={login.isLoading}>
        <LogIn aria-hidden="true" />
        {login.isLoading ? "Signing in" : "Sign in"}
      </button>
      <p className="auth-switch">
        New here? <Link to="/register">Create an account</Link>
      </p>
    </form>
  );
}
