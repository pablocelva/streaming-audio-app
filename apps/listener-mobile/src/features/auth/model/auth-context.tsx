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
import { fetchCurrentUser, initApiToken, setApiToken } from "@/shared/api";
import { storage, TOKEN_KEY } from "@/shared/storage";
import { getListenerTier, type ListenerTier } from "@/shared/lib/listener-tier";

type AuthContextValue = {
  user: UserProfile | null;
  tier: ListenerTier;
  isAuthenticated: boolean;
  isLoading: boolean;
  setSession: (user: UserProfile) => void;
  refreshUser: () => Promise<void>;
  logout: () => Promise<void>;
};

const AuthContext = createContext<AuthContextValue | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<UserProfile | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  const refreshUser = useCallback(async () => {
    const token = await storage.getItem(TOKEN_KEY);
    if (!token) {
      setUser(null);
      return;
    }
    await initApiToken();
    const profile = await fetchCurrentUser();
    setUser(profile);
  }, []);

  useEffect(() => {
    initApiToken()
      .then(() => refreshUser())
      .catch(async () => {
        await setApiToken(null);
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
      setSession: (profile) => setUser(profile),
      refreshUser,
      logout: async () => {
        await setApiToken(null);
        await storage.removeItem("refreshToken");
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
