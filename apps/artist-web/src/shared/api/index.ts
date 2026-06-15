import {
  artistProfileSchema,
  artistStatsSchema,
  authResponseSchema,
  createAlbumRequestSchema,
  createApiClient,
  loginRequestSchema,
  registerArtistRequestSchema,
  signDeclarationRequestSchema,
  songResponseSchema,
  userProfileSchema,
  albumSchema,
} from "@streaming/api-client";
import type { z } from "zod";
import { z as zod } from "zod";

export const api = createApiClient({
  baseUrl: import.meta.env.VITE_API_URL ?? "/api/v1",
  getAccessToken: () => localStorage.getItem("accessToken"),
});

const emptyResponseSchema = zod.null();

export async function login(email: string, password: string) {
  const body = loginRequestSchema.parse({ email, password });
  const auth = await api.request(
    "/auth/login",
    { method: "POST", body: JSON.stringify(body) },
    authResponseSchema,
  );
  localStorage.setItem("accessToken", auth.accessToken);
  localStorage.setItem("refreshToken", auth.refreshToken);
  const user = await api.request("/users/me", { method: "GET" }, userProfileSchema);
  return { auth, user };
}

export async function registerArtist(
  values: z.infer<typeof registerArtistRequestSchema>,
) {
  const body = registerArtistRequestSchema.parse(values);
  const auth = await api.request(
    "/auth/register/artist",
    { method: "POST", body: JSON.stringify(body) },
    authResponseSchema,
  );
  localStorage.setItem("accessToken", auth.accessToken);
  localStorage.setItem("refreshToken", auth.refreshToken);
  const user = await api.request("/users/me", { method: "GET" }, userProfileSchema);
  return { auth, user };
}

export async function fetchCurrentUser() {
  return api.request("/users/me", { method: "GET" }, userProfileSchema);
}

export async function fetchArtistProfile() {
  return api.request("/artists/me", { method: "GET" }, artistProfileSchema);
}

export async function signDeclaration(documentVersion: string) {
  const body = signDeclarationRequestSchema.parse({
    accepted: true,
    documentVersion,
  });
  await api.request(
    "/artists/me/declaration",
    { method: "POST", body: JSON.stringify(body) },
    emptyResponseSchema,
  );
}

export async function fetchArtistStats() {
  return api.request("/artists/me/stats", { method: "GET" }, artistStatsSchema);
}

export async function createAlbum(
  values: z.infer<typeof createAlbumRequestSchema>,
) {
  const body = createAlbumRequestSchema.parse(values);
  return api.request(
    "/albums",
    { method: "POST", body: JSON.stringify(body) },
    albumSchema,
  );
}

export async function uploadSong(
  albumId: string,
  file: File,
  title: string,
  durationSeconds: number,
  orderInAlbum?: number,
) {
  const form = new FormData();
  form.append("title", title);
  form.append("durationSeconds", String(durationSeconds));
  if (orderInAlbum != null) {
    form.append("orderInAlbum", String(orderInAlbum));
  }
  form.append("file", file);

  return api.request(
    `/albums/${albumId}/songs`,
    { method: "POST", body: form },
    songResponseSchema,
  );
}

export async function getAudioDurationSeconds(file: File): Promise<number> {
  const url = URL.createObjectURL(file);
  try {
    const audio = new Audio(url);
    await new Promise<void>((resolve, reject) => {
      audio.addEventListener("loadedmetadata", () => resolve());
      audio.addEventListener("error", () => reject(new Error("No se pudo leer el audio")));
    });
    if (!Number.isFinite(audio.duration) || audio.duration <= 0) {
      throw new Error("Duración inválida");
    }
    return Math.round(audio.duration);
  } finally {
    URL.revokeObjectURL(url);
  }
}
