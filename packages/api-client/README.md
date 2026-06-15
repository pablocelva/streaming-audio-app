# @streaming/api-client

Cliente HTTP compartido y **schemas Zod** para web y mobile.

## Uso

```ts
import {
  createApiClient,
  authResponseSchema,
  loginRequestSchema,
} from "@streaming/api-client";

const api = createApiClient({
  baseUrl: import.meta.env.VITE_API_URL,
  getAccessToken: () => localStorage.getItem("accessToken"),
});

const body = loginRequestSchema.parse({ email, password });
const auth = await api.request("/auth/login", {
  method: "POST",
  body: JSON.stringify(body),
}, authResponseSchema);
```

## Regla

Todo DTO que cruce el límite frontend ↔ backend debe tener schema Zod aquí.
