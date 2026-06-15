import { Link } from "react-router-dom";
import { useAuth } from "@/features/auth/model/auth-context";
import { tierLabel } from "@/shared/lib/listener-tier";

export function PremiumPage() {
  const { tier } = useAuth();

  return (
    <section className="auth-page">
      <h2>Premium</h2>
      <p className="muted">Tu plan actual: {tierLabel(tier)}</p>
      <p>
        La suscripción premium con pago real llegará en la <strong>Fase 4</strong> (Stripe).
        Mientras tanto, un admin puede asignar plan premium en base de datos para pruebas.
      </p>
      <Link to="/">Volver al inicio</Link>
    </section>
  );
}
