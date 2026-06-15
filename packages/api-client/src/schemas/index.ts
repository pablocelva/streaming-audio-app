import { z } from "zod";

export const subscriptionPlanSchema = z.enum(["gratis", "premium"]);
export const subscriptionStatusSchema = z.enum([
  "activa",
  "cancelada",
  "vencida",
  "pendiente",
]);
export const roleSchema = z.enum(["USER", "ARTIST", "ADMIN"]);
export const playbackOriginSchema = z.enum(["web", "ios", "android"]);

export const authResponseSchema = z.object({
  accessToken: z.string(),
  refreshToken: z.string(),
  expiresIn: z.number().int(),
});

export const loginRequestSchema = z.object({
  email: z.string().email(),
  password: z.string().min(8),
});

export const registerRequestSchema = loginRequestSchema.extend({
  fullName: z.string().min(1),
});

export const registerArtistRequestSchema = registerRequestSchema.extend({
  stageName: z.string().min(1),
  biography: z.string().optional(),
});

export const subscriptionSchema = z.object({
  plan: subscriptionPlanSchema,
  status: subscriptionStatusSchema,
  expiresAt: z.string().datetime().nullable().optional(),
});

export const userProfileSchema = z.object({
  id: z.string().uuid(),
  email: z.string().email(),
  fullName: z.string().nullable().optional(),
  roles: z.array(roleSchema),
  subscription: subscriptionSchema.nullable().optional(),
});

export const artistProfileSchema = z.object({
  id: z.string().uuid(),
  stageName: z.string(),
  biography: z.string().nullable().optional(),
  profileImageUrl: z.string().nullable().optional(),
  verified: z.boolean(),
  active: z.boolean(),
  declarationSigned: z.boolean(),
});

export const songSummarySchema = z.object({
  id: z.string().uuid(),
  title: z.string(),
  durationSeconds: z.number().int(),
  artistName: z.string(),
  albumTitle: z.string(),
});

export const albumSchema = z.object({
  id: z.string().uuid(),
  title: z.string(),
  releaseYear: z.number().int().nullable().optional(),
  genre: z.string().nullable().optional(),
  coverImageUrl: z.string().nullable().optional(),
  artistId: z.string().uuid(),
  songs: z.array(songSummarySchema).optional(),
});

export const featuredCatalogSchema = z.object({
  albums: z.array(albumSchema),
  songs: z.array(songSummarySchema),
});

export const searchResultsSchema = z.object({
  artists: z.array(artistProfileSchema),
  songs: z.array(songSummarySchema),
});

export const streamUrlResponseSchema = z.object({
  url: z.string().url(),
  expiresAt: z.string().datetime(),
  accessTier: z.enum(["guest", "free", "premium"]),
  maxPlaySeconds: z.number().int().nullable().optional(),
  quality: z.enum(["preview", "standard", "high"]),
});

export const playbackEventResponseSchema = z.object({
  id: z.number().int(),
  isValidForRoyalties: z.boolean(),
  weight: z.number(),
});

export const artistStatsSchema = z.object({
  totalPlays: z.number().int(),
  premiumPlays: z.number().int(),
  freePlays: z.number().int(),
  totalWeight: z.number(),
  topSongs: z.array(
    z.object({
      songId: z.string().uuid(),
      title: z.string(),
      plays: z.number().int(),
      weight: z.number(),
    }),
  ),
});

export const playbackEventRequestSchema = z.object({
  songId: z.string().uuid(),
  listenedSeconds: z.number().int().min(0),
  sessionId: z.string().min(1),
  origin: playbackOriginSchema,
});

export const signDeclarationRequestSchema = z.object({
  accepted: z.literal(true),
  documentVersion: z.string().min(1),
});

export const createAlbumRequestSchema = z.object({
  title: z.string().min(1),
  releaseYear: z.number().int().min(1900).max(2100).optional(),
  genre: z.string().optional(),
  coverImageUrl: z.string().url().optional(),
});

export const songResponseSchema = z.object({
  id: z.string().uuid(),
  albumId: z.string().uuid(),
  title: z.string(),
  durationSeconds: z.number().int(),
  orderInAlbum: z.number().int(),
  isExplicit: z.boolean(),
});

export const adminDashboardSchema = z.object({
  registeredUsers: z.number().int(),
  verifiedArtists: z.number().int(),
  pendingArtists: z.number().int(),
  monthlyPlays: z.number().int(),
  pendingSettlements: z.number().int(),
});

export const adminSongSchema = z.object({
  id: z.string().uuid(),
  title: z.string(),
  artistName: z.string(),
  albumTitle: z.string(),
  active: z.boolean(),
});

export const setActiveRequestSchema = z.object({
  active: z.boolean(),
});

export const apiErrorSchema = z.object({
  code: z.string(),
  message: z.string(),
  details: z.record(z.unknown()).optional(),
});

export type AuthResponse = z.infer<typeof authResponseSchema>;
export type UserProfile = z.infer<typeof userProfileSchema>;
export type ArtistProfile = z.infer<typeof artistProfileSchema>;
export type ArtistStats = z.infer<typeof artistStatsSchema>;
export type SongSummary = z.infer<typeof songSummarySchema>;
export type FeaturedCatalog = z.infer<typeof featuredCatalogSchema>;
export type SearchResults = z.infer<typeof searchResultsSchema>;
export type StreamUrlResponse = z.infer<typeof streamUrlResponseSchema>;
export type AdminDashboard = z.infer<typeof adminDashboardSchema>;
export type AdminSong = z.infer<typeof adminSongSchema>;
