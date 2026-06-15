import { createContext, useCallback, useContext, useEffect, useMemo, useState, type ReactNode } from "react";
import type { ArtistProfile, UserProfile } from "@streaming/api-client";
import { fetchArtistProfile, fetchCurrentUser } from "@/shared/api";

type AuthContextValue = {
  user: UserProfile | null;
  artist: ArtistProfile | null;
  accessToken: string | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  setSession: (token: string, user: UserProfile) => void;
  refreshProfile: () => Promise<void>;
  logout: () => void;
};

const AuthContext = createContext<AuthContextValue | null>(null);

const TOKEN_KEY = "accessToken";

export function AuthProvider({ children }: { children: ReactNode }) {
  const [accessToken, setAccessToken] = useState<string | null>(
    () => localStorage.getItem(TOKEN_KEY),
  );
  const [user, setUser] = useState<UserProfile | null>(null);
  const [artist, setArtist] = useState<ArtistProfile | null>(null);
  const [isLoading, setIsLoading] = useState(Boolean(localStorage.getItem(TOKEN_KEY)));

  const refreshProfile = useCallback(async () => {
    if (!localStorage.getItem(TOKEN_KEY)) {
      setUser(null);
      setArtist(null);
      return;
    }

    const profile = await fetchCurrentUser();
    setUser(profile);

    if (profile.roles.includes("ARTIST")) {
      try {
        const artistProfile = await fetchArtistProfile();
        setArtist(artistProfile);
      } catch {
        setArtist(null);
      }
    } else {
      setArtist(null);
    }
  }, []);

  useEffect(() => {
    if (!accessToken) {
      setIsLoading(false);
      return;
    }

    refreshProfile()
      .catch(() => {
        localStorage.removeItem(TOKEN_KEY);
        setAccessToken(null);
        setUser(null);
        setArtist(null);
      })
      .finally(() => setIsLoading(false));
  }, [accessToken, refreshProfile]);

  const value = useMemo<AuthContextValue>(
    () => ({
      user,
      artist,
      accessToken,
      isAuthenticated: Boolean(accessToken),
      isLoading,
      setSession: (token, profile) => {
        localStorage.setItem(TOKEN_KEY, token);
        setAccessToken(token);
        setUser(profile);
      },
      refreshProfile,
      logout: () => {
        localStorage.removeItem(TOKEN_KEY);
        localStorage.removeItem("refreshToken");
        setAccessToken(null);
        setUser(null);
        setArtist(null);
      },
    }),
    [accessToken, artist, isLoading, refreshProfile, user],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth debe usarse dentro de AuthProvider");
  return ctx;
}
