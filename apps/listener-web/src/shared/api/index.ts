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
import { z } from "zod";

const TOKEN_KEY = "accessToken";
const favoriteListSchema = z.array(songSummarySchema);

export const api = createApiClient({
  baseUrl: import.meta.env.VITE_API_URL ?? "/api/v1",
  getAccessToken: () => localStorage.getItem(TOKEN_KEY),
});

export function getListenerSessionId(): string {
  const key = "listener-session-id";
  let id = localStorage.getItem(key);
  if (!id) {
    id = crypto.randomUUID();
    localStorage.setItem(key, id);
  }
  return id;
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
  localStorage.setItem(TOKEN_KEY, auth.accessToken);
  localStorage.setItem("refreshToken", auth.refreshToken);
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
  localStorage.setItem(TOKEN_KEY, auth.accessToken);
  localStorage.setItem("refreshToken", auth.refreshToken);
  const user = await api.request("/users/me", { method: "GET" }, userProfileSchema);
  return { auth, user };
}

export async function fetchCurrentUser() {
  return api.request("/users/me", { method: "GET" }, userProfileSchema);
}

export async function registerPlayback(
  songId: string,
  listenedSeconds: number,
) {
  const body = playbackEventRequestSchema.parse({
    songId,
    listenedSeconds,
    sessionId: getListenerSessionId(),
    origin: "web",
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
    z.null(),
  );
}

export async function removeFavorite(songId: string) {
  await api.request(`/library/favorites/${songId}`, { method: "DELETE" }, z.null());
}
