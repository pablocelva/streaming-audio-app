import { z } from "zod";
import { apiErrorSchema } from "./schemas/index";

export class ApiClientError extends Error {
  constructor(
    public readonly code: string,
    message: string,
    public readonly details?: Record<string, unknown>,
  ) {
    super(message);
    this.name = "ApiClientError";
  }
}

export type ApiClientOptions = {
  baseUrl?: string;
  getAccessToken?: () => string | null;
};

export function createApiClient(options: ApiClientOptions = {}) {
  const baseUrl = options.baseUrl ?? "http://localhost:8080/api/v1";

  async function request<T>(
    path: string,
    init: RequestInit,
    schema: z.ZodType<T>,
  ): Promise<T> {
    const headers = new Headers(init.headers);
    if (!headers.has("Content-Type") && !(init.body instanceof FormData)) {
      headers.set("Content-Type", "application/json");
    }

    const token = options.getAccessToken?.();
    if (token) {
      headers.set("Authorization", `Bearer ${token}`);
    }

    const response = await fetch(`${baseUrl}${path}`, { ...init, headers });
    const text = await response.text();
    const json = text ? JSON.parse(text) : null;

    if (!response.ok) {
      const parsed = apiErrorSchema.safeParse(json);
      if (parsed.success) {
        throw new ApiClientError(
          parsed.data.code,
          parsed.data.message,
          parsed.data.details,
        );
      }
      throw new ApiClientError("UNKNOWN", "Error de API");
    }

    return schema.parse(json);
  }

  return { request, baseUrl };
}

export type ApiClient = ReturnType<typeof createApiClient>;
