import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from "react";
import type { UserProfile } from "@streaming/api-client";
import { fetchCurrentUser } from "@/shared/api";
import { getListenerTier, type ListenerTier } from "@/shared/lib/listener-tier";

type AuthContextValue = {
  user: UserProfile | null;
  tier: ListenerTier;
  isAuthenticated: boolean;
  isLoading: boolean;
  setSession: (token: string, user: UserProfile) => void;
  refreshUser: () => Promise<void>;
  logout: () => void;
};

const AuthContext = createContext<AuthContextValue | null>(null);
const TOKEN_KEY = "accessToken";

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<UserProfile | null>(null);
  const [isLoading, setIsLoading] = useState(Boolean(localStorage.getItem(TOKEN_KEY)));

  const refreshUser = useCallback(async () => {
    if (!localStorage.getItem(TOKEN_KEY)) {
      setUser(null);
      return;
    }
    const profile = await fetchCurrentUser();
    setUser(profile);
  }, []);

  useEffect(() => {
    if (!localStorage.getItem(TOKEN_KEY)) {
      setIsLoading(false);
      return;
    }
    refreshUser()
      .catch(() => {
        localStorage.removeItem(TOKEN_KEY);
        setUser(null);
      })
      .finally(() => setIsLoading(false));
  }, [refreshUser]);

  const tier = getListenerTier(user);

  const value = useMemo<AuthContextValue>(
    () => ({
      user,
      tier,
      isAuthenticated: Boolean(user),
      isLoading,
      setSession: (token, profile) => {
        localStorage.setItem(TOKEN_KEY, token);
        setUser(profile);
      },
      refreshUser,
      logout: () => {
        localStorage.removeItem(TOKEN_KEY);
        localStorage.removeItem("refreshToken");
        setUser(null);
      },
    }),
    [isLoading, refreshUser, tier, user],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth debe usarse dentro de AuthProvider");
  return ctx;
}
