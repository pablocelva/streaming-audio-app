import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { signDeclaration } from "@/shared/api";
import { useAuth } from "@/features/auth/model/auth-context";
import { DECLARATION_TEXT, DECLARATION_VERSION } from "../model/declaration";

export function DeclarationPage() {
  const navigate = useNavigate();
  const { refreshProfile } = useAuth();
  const [accepted, setAccepted] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const onSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    if (!accepted) {
      setError("Debes aceptar la declaración para continuar.");
      return;
    }

    setError(null);
    setIsSubmitting(true);
    try {
      await signDeclaration(DECLARATION_VERSION);
      await refreshProfile();
      navigate("/dashboard");
    } catch {
      setError("No se pudo registrar la declaración. Inténtalo de nuevo.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <section className="panel">
      <h2>Declaración de autoría (no-IA)</h2>
      <p className="muted">Versión del documento: {DECLARATION_VERSION}</p>
      <pre className="declaration-text">{DECLARATION_TEXT}</pre>
      <form onSubmit={onSubmit}>
        <label className="checkbox-row">
          <input
            type="checkbox"
            checked={accepted}
            onChange={(event) => setAccepted(event.target.checked)}
          />
          He leído y acepto la declaración de autoría.
        </label>
        {error && <p className="error">{error}</p>}
        <button type="submit" disabled={isSubmitting}>
          Firmar y continuar
        </button>
      </form>
    </section>
  );
}
