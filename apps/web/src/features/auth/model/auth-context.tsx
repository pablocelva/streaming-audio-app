import { createContext, useContext, useMemo, useState, type ReactNode } from "react";
import type { UserProfile } from "@streaming/api-client";

type AuthContextValue = {
  user: UserProfile | null;
  accessToken: string | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  setSession: (token: string, user: UserProfile) => void;
  logout: () => void;
};

const AuthContext = createContext<AuthContextValue | null>(null);

const TOKEN_KEY = "accessToken";

export function AuthProvider({ children }: { children: ReactNode }) {
  const [accessToken, setAccessToken] = useState<string | null>(
    () => localStorage.getItem(TOKEN_KEY),
  );
  const [user, setUser] = useState<UserProfile | null>(null);
  const [isLoading] = useState(false);

  const value = useMemo<AuthContextValue>(
    () => ({
      user,
      accessToken,
      isAuthenticated: Boolean(accessToken),
      isLoading,
      setSession: (token, profile) => {
        localStorage.setItem(TOKEN_KEY, token);
        setAccessToken(token);
        setUser(profile);
      },
      logout: () => {
        localStorage.removeItem(TOKEN_KEY);
        setAccessToken(null);
        setUser(null);
      },
    }),
    [accessToken, isLoading, user],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth debe usarse dentro de AuthProvider");
  return ctx;
}
