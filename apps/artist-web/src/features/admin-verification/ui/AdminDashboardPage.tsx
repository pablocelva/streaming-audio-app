import { useEffect, useState } from "react";
import { fetchAdminDashboard } from "@/shared/api/admin";
import type { AdminDashboard } from "@streaming/api-client";

export function AdminDashboardPage() {
  const [data, setData] = useState<AdminDashboard | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchAdminDashboard()
      .then(setData)
      .catch(() => setError("No se pudo cargar el resumen global."));
  }, []);

  if (error) {
    return <p className="error">{error}</p>;
  }

  if (!data) {
    return <p>Cargando resumen...</p>;
  }

  return (
    <section className="panel">
      <h2>Resumen de plataforma</h2>
      <div className="stats-grid">
        <article className="stat-card">
          <h3>Usuarios registrados</h3>
          <p className="stat-value">{data.registeredUsers}</p>
        </article>
        <article className="stat-card">
          <h3>Artistas verificados</h3>
          <p className="stat-value">{data.verifiedArtists}</p>
        </article>
        <article className="stat-card">
          <h3>Pendientes de verificación</h3>
          <p className="stat-value">{data.pendingArtists}</p>
        </article>
        <article className="stat-card">
          <h3>Reproducciones del mes</h3>
          <p className="stat-value">{data.monthlyPlays}</p>
        </article>
        <article className="stat-card">
          <h3>Liquidaciones pendientes</h3>
          <p className="stat-value">{data.pendingSettlements}</p>
          <p className="muted">Disponible en Fase 4 (Stripe)</p>
        </article>
      </div>
    </section>
  );
}
