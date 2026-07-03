import { zodResolver } from "@hookform/resolvers/zod";
import { UserPlus } from "lucide-react";
import { useForm } from "react-hook-form";
import { Link, useNavigate } from "react-router-dom";
import { z } from "zod";
import { getApiErrorMessage } from "../../api/client";
import { useRegister } from "../../hooks/useAuth";

const schema = z.object({
  username: z.string().min(3, "Use at least 3 characters").max(50),
  email: z.string().email("Enter a valid email"),
  fullName: z.string().max(255).optional(),
  password: z.string().min(8, "Use at least 8 characters").max(100)
});

type FormValues = z.infer<typeof schema>;

export function RegisterForm() {
  const registerUser = useRegister();
  const navigate = useNavigate();
  const form = useForm<FormValues>({
    resolver: zodResolver(schema),
    defaultValues: { username: "", email: "", fullName: "", password: "" }
  });

  const onSubmit = form.handleSubmit((values) => {
    registerUser.mutate(values, {
      onSuccess: () => navigate("/", { replace: true })
    });
  });

  return (
    <form className="auth-form" onSubmit={onSubmit}>
      <label>
        Username
        <input autoComplete="username" {...form.register("username")} />
        {form.formState.errors.username && <small>{form.formState.errors.username.message}</small>}
      </label>
      <label>
        Email
        <input type="email" autoComplete="email" {...form.register("email")} />
        {form.formState.errors.email && <small>{form.formState.errors.email.message}</small>}
      </label>
      <label>
        Full name
        <input autoComplete="name" {...form.register("fullName")} />
      </label>
      <label>
        Password
        <input type="password" autoComplete="new-password" {...form.register("password")} />
        {form.formState.errors.password && <small>{form.formState.errors.password.message}</small>}
      </label>
      {registerUser.isError && <p className="form-error">{getApiErrorMessage(registerUser.error)}</p>}
      <button className="primary-button" type="submit" disabled={registerUser.isLoading}>
        <UserPlus aria-hidden="true" />
        {registerUser.isLoading ? "Creating account" : "Create account"}
      </button>
      <p className="auth-switch">
        Already registered? <Link to="/login">Sign in</Link>
      </p>
    </form>
  );
}
