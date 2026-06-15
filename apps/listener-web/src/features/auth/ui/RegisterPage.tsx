import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { registerRequestSchema } from "@streaming/api-client";
import type { z } from "zod";
import { registerUser } from "@/shared/api";
import { useAuth } from "../model/auth-context";

type RegisterForm = z.infer<typeof registerRequestSchema>;

export function RegisterPage() {
  const navigate = useNavigate();
  const { setSession, refreshUser } = useAuth();
  const [error, setError] = useState<string | null>(null);
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<RegisterForm>({ resolver: zodResolver(registerRequestSchema) });

  const onSubmit = handleSubmit(async (values) => {
    setError(null);
    try {
      const { auth, user } = await registerUser(values);
      setSession(auth.accessToken, user);
      await refreshUser();
      navigate("/");
    } catch {
      setError("No se pudo crear la cuenta. Prueba con otro email.");
    }
  });

  return (
    <div className="auth-page">
      <form onSubmit={onSubmit}>
        <h2>Cuenta gratuita</h2>
        <p className="muted">Escucha canciones completas y guarda favoritos.</p>
        <label>
          Nombre
          <input {...register("fullName")} />
          {errors.fullName && <span className="error">{errors.fullName.message}</span>}
        </label>
        <label>
          Email
          <input type="email" {...register("email")} />
          {errors.email && <span className="error">{errors.email.message}</span>}
        </label>
        <label>
          Contraseña
          <input type="password" {...register("password")} />
          {errors.password && <span className="error">{errors.password.message}</span>}
        </label>
        {error && <p className="error">{error}</p>}
        <button type="submit" disabled={isSubmitting}>
          Crear cuenta gratis
        </button>
        <p className="muted">
          ¿Ya tienes cuenta? <Link to="/login">Iniciar sesión</Link>
        </p>
      </form>
    </div>
  );
}
