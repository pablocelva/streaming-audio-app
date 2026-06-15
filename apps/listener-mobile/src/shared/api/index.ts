import Constants from "expo-constants";
import { Platform } from "react-native";
import {
  authResponseSchema,
  createApiClient,
  featuredCatalogSchema,
  loginRequestSchema,
  playbackEventRequestSchema,
  playbackEventResponseSchema,
  registerRequestSchema,
  searchResultsSchema,
  songSummarySchema,
  streamUrlResponseSchema,
  userProfileSchema,
} from "@streaming/api-client";
import type { z } from "zod";
import { z as zod } from "zod";
import { storage, TOKEN_KEY } from "@/shared/storage";

function defaultApiUrl(): string {
  if (process.env.EXPO_PUBLIC_API_URL) {
    return process.env.EXPO_PUBLIC_API_URL;
  }
  if (Platform.OS === "android") {
    return "http://10.0.2.2:8081/api/v1";
  }
  return "http://localhost:8081/api/v1";
}

export const api = createApiClient({
  baseUrl: defaultApiUrl(),
  getAccessToken: () => tokenCache,
});

let tokenCache: string | null = null;

export async function initApiToken() {
  tokenCache = await storage.getItem(TOKEN_KEY);
}

export async function setApiToken(token: string | null) {
  tokenCache = token;
  if (token) {
    await storage.setItem(TOKEN_KEY, token);
  } else {
    await storage.removeItem(TOKEN_KEY);
  }
}

const favoriteListSchema = zod.array(songSummarySchema);

export async function getListenerSessionId(): Promise<string> {
  const key = "listener-session-id";
  let id = await storage.getItem(key);
  if (!id) {
    id = `${Date.now()}-${Math.random().toString(36).slice(2)}`;
    await storage.setItem(key, id);
  }
  return id;
}

export function getPlaybackOrigin(): "ios" | "android" {
  return Platform.OS === "ios" ? "ios" : "android";
}

export async function fetchFeatured() {
  return api.request("/catalog/featured", { method: "GET" }, featuredCatalogSchema);
}

export async function searchCatalog(query: string) {
  const params = new URLSearchParams({ q: query, limit: "20" });
  return api.request(`/catalog/search?${params}`, { method: "GET" }, searchResultsSchema);
}

export async function fetchStreamUrl(songId: string) {
  return api.request(`/songs/${songId}/stream-url`, { method: "GET" }, streamUrlResponseSchema);
}

export async function login(email: string, password: string) {
  const body = loginRequestSchema.parse({ email, password });
  const auth = await api.request(
    "/auth/login",
    { method: "POST", body: JSON.stringify(body) },
    authResponseSchema,
  );
  await setApiToken(auth.accessToken);
  await storage.setItem("refreshToken", auth.refreshToken);
  const user = await api.request("/users/me", { method: "GET" }, userProfileSchema);
  return { auth, user };
}

export async function registerUser(values: z.infer<typeof registerRequestSchema>) {
  const body = registerRequestSchema.parse(values);
  const auth = await api.request(
    "/auth/register",
    { method: "POST", body: JSON.stringify(body) },
    authResponseSchema,
  );
  await setApiToken(auth.accessToken);
  await storage.setItem("refreshToken", auth.refreshToken);
  const user = await api.request("/users/me", { method: "GET" }, userProfileSchema);
  return { auth, user };
}

export async function fetchCurrentUser() {
  return api.request("/users/me", { method: "GET" }, userProfileSchema);
}

export async function registerPlayback(songId: string, listenedSeconds: number) {
  const body = playbackEventRequestSchema.parse({
    songId,
    listenedSeconds,
    sessionId: await getListenerSessionId(),
    origin: getPlaybackOrigin(),
  });
  return api.request(
    "/playback/events",
    { method: "POST", body: JSON.stringify(body) },
    playbackEventResponseSchema,
  );
}

export async function fetchFavorites() {
  return api.request("/library/favorites", { method: "GET" }, favoriteListSchema);
}

export async function addFavorite(songId: string) {
  await api.request(
    "/library/favorites",
    { method: "POST", body: JSON.stringify({ songId }) },
    zod.null(),
  );
}

export async function removeFavorite(songId: string) {
  await api.request(`/library/favorites/${songId}`, { method: "DELETE" }, zod.null());
}
