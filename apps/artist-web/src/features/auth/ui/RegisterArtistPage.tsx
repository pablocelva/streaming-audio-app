import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { registerArtistRequestSchema } from "@streaming/api-client";
import type { z } from "zod";
import { registerArtist } from "@/shared/api";
import { useAuth } from "../model/auth-context";

type RegisterForm = z.infer<typeof registerArtistRequestSchema>;

export function RegisterArtistPage() {
  const navigate = useNavigate();
  const { setSession, refreshProfile } = useAuth();
  const [error, setError] = useState<string | null>(null);
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<RegisterForm>({ resolver: zodResolver(registerArtistRequestSchema) });

  const onSubmit = handleSubmit(async (values) => {
    setError(null);
    try {
      const { auth, user } = await registerArtist(values);
      setSession(auth.accessToken, user);
      await refreshProfile();
      navigate("/declaration");
    } catch {
      setError("No se pudo completar el registro. Revisa los datos o usa otro email.");
    }
  });

  return (
    <div className="auth-page">
      <form onSubmit={onSubmit}>
        <h2>Registro de artista</h2>
        <label>
          Nombre completo
          <input {...register("fullName")} />
          {errors.fullName && <span className="error">{errors.fullName.message}</span>}
        </label>
        <label>
          Nombre artístico
          <input {...register("stageName")} />
          {errors.stageName && <span className="error">{errors.stageName.message}</span>}
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
        <label>
          Biografía (opcional)
          <textarea rows={3} {...register("biography")} />
        </label>
        {error && <p className="error">{error}</p>}
        <button type="submit" disabled={isSubmitting}>
          Crear cuenta de artista
        </button>
        <p className="muted">
          ¿Ya tienes cuenta? <Link to="/login">Iniciar sesión</Link>
        </p>
      </form>
    </div>
  );
}
