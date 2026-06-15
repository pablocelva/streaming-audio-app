import type { UserProfile } from "@streaming/api-client";

export type ListenerTier = "guest" | "free" | "premium";

export function getListenerTier(user: UserProfile | null): ListenerTier {
  if (!user) return "guest";
  const sub = user.subscription;
  if (sub?.plan === "premium" && sub.status === "activa") {
    return "premium";
  }
  return "free";
}

export function tierLabel(tier: ListenerTier): string {
  switch (tier) {
    case "guest":
      return "Sin cuenta · Vista previa 30s";
    case "free":
      return "Cuenta gratuita";
    case "premium":
      return "Premium";
  }
}
