import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { loginRequestSchema } from "@streaming/api-client";
import type { z } from "zod";
import { login } from "@/shared/api";
import { useAuth } from "../model/auth-context";

type LoginForm = z.infer<typeof loginRequestSchema>;

export function LoginPage() {
  const navigate = useNavigate();
  const { setSession } = useAuth();
  const [error, setError] = useState<string | null>(null);
  const {
    register,
    handleSubmit,
    formState: { isSubmitting },
  } = useForm<LoginForm>({ resolver: zodResolver(loginRequestSchema) });

  const onSubmit = handleSubmit(async (values) => {
    setError(null);
    try {
      const { auth, user } = await login(values.email, values.password);
      setSession(auth.accessToken, user);
      navigate("/dashboard");
    } catch {
      setError("Credenciales inválidas");
    }
  });

  return (
    <div className="auth-page">
      <form onSubmit={onSubmit}>
        <h2>Iniciar sesión</h2>
        <label>
          Email
          <input type="email" {...register("email")} />
        </label>
        <label>
          Contraseña
          <input type="password" {...register("password")} />
        </label>
        {error && <p className="error">{error}</p>}
        <button type="submit" disabled={isSubmitting}>
          Entrar
        </button>
      </form>
    </div>
  );
}
