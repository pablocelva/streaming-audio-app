import {
  adminDashboardSchema,
  adminSongSchema,
  artistProfileSchema,
  setActiveRequestSchema,
} from "@streaming/api-client";
import { z } from "zod";
import { api } from "./index";

const artistListSchema = z.array(artistProfileSchema);
const adminSongListSchema = z.array(adminSongSchema);

export async function fetchAdminDashboard() {
  return api.request("/admin/dashboard", { method: "GET" }, adminDashboardSchema);
}

export async function fetchPendingArtists() {
  return api.request("/admin/artists/pending", { method: "GET" }, artistListSchema);
}

export async function verifyArtist(artistId: string) {
  return api.request(
    `/admin/artists/${artistId}/verify`,
    { method: "POST" },
    artistProfileSchema,
  );
}

export async function fetchAdminArtists() {
  return api.request("/admin/artists", { method: "GET" }, artistListSchema);
}

export async function setArtistActive(artistId: string, active: boolean) {
  const body = setActiveRequestSchema.parse({ active });
  return api.request(
    `/admin/artists/${artistId}/status`,
    { method: "PATCH", body: JSON.stringify(body) },
    artistProfileSchema,
  );
}

export async function fetchAdminSongs(limit = 50) {
  return api.request(
    `/admin/songs?limit=${limit}`,
    { method: "GET" },
    adminSongListSchema,
  );
}

export async function setSongActive(songId: string, active: boolean) {
  const body = setActiveRequestSchema.parse({ active });
  return api.request(
    `/admin/songs/${songId}/status`,
    { method: "PATCH", body: JSON.stringify(body) },
    adminSongSchema,
  );
}
