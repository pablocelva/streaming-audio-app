import {
  authResponseSchema,
  createApiClient,
  loginRequestSchema,
  userProfileSchema,
} from "@streaming/api-client";

export const api = createApiClient({
  baseUrl: import.meta.env.VITE_API_URL ?? "/api/v1",
  getAccessToken: () => localStorage.getItem("accessToken"),
});

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
