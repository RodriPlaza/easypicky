import { getSession } from "next-auth/react";

const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:3000/api";

interface FetchOptions extends RequestInit {
  requiresAuth?: boolean;
}

export class ApiError extends Error {
  constructor(
    public status: number,
    public statusText: string,
    public data: any
  ) {
    super(data?.error || statusText);
    this.name = "ApiError";
  }
}

// Cache del token para evitar múltiples peticiones
let cachedToken: string | null = null;
let tokenExpiry: number = 0;

async function getAuthToken(): Promise<string | null> {
  // Si el token está en cache y no ha expirado, usarlo
  if (cachedToken && Date.now() < tokenExpiry) {
    return cachedToken;
  }

  try {
    // Obtener token desde el endpoint
    const response = await fetch(`${API_URL}/auth/token`, {
      credentials: "include",
    });

    if (!response.ok) {
      cachedToken = null;
      return null;
    }

    const data = await response.json();
    cachedToken = data.token;

    // El token expira en 7 días, pero refrescamos el cache cada 6 días
    tokenExpiry = Date.now() + 6 * 24 * 60 * 60 * 1000;

    return cachedToken;
  } catch (error) {
    console.error("Error getting auth token:", error);
    cachedToken = null;
    return null;
  }
}

export async function apiFetch<T = any>(
  endpoint: string,
  options: FetchOptions = {}
): Promise<T> {
  const { requiresAuth = true, headers = {}, ...fetchOptions } = options;

  const requestHeaders: Record<string, string> = {
    "Content-Type": "application/json",
    ...(headers as Record<string, string>),
  };

  // Si requiere autenticación, agregar el token
  if (requiresAuth) {
    const session = await getSession();

    if (!session?.user) {
      throw new ApiError(401, "Unauthorized", { error: "No active session" });
    }

    const token = await getAuthToken();

    if (!token) {
      throw new ApiError(401, "Unauthorized", {
        error: "Could not obtain auth token",
      });
    }

    requestHeaders["Authorization"] = `Bearer ${token}`;
  }

  const url = `${API_URL}${endpoint}`;

  try {
    const response = await fetch(url, {
      ...fetchOptions,
      headers: requestHeaders,
      credentials: "include",
    });

    // Intentar parsear el JSON de la respuesta
    let data;
    try {
      data = await response.json();
    } catch (e) {
      data = null;
    }

    if (!response.ok) {
      throw new ApiError(response.status, response.statusText, data);
    }

    return data as T;
  } catch (error) {
    if (error instanceof ApiError) {
      throw error;
    }
    throw new Error("Error de red. Por favor verifica tu conexión.");
  }
}

// Helper functions para métodos HTTP comunes
export const api = {
  get: <T = any>(endpoint: string, options?: FetchOptions) =>
    apiFetch<T>(endpoint, { ...options, method: "GET" }),

  post: <T = any>(endpoint: string, data?: any, options?: FetchOptions) =>
    apiFetch<T>(endpoint, {
      ...options,
      method: "POST",
      body: data ? JSON.stringify(data) : undefined,
    }),

  put: <T = any>(endpoint: string, data?: any, options?: FetchOptions) =>
    apiFetch<T>(endpoint, {
      ...options,
      method: "PUT",
      body: data ? JSON.stringify(data) : undefined,
    }),

  delete: <T = any>(endpoint: string, options?: FetchOptions) =>
    apiFetch<T>(endpoint, { ...options, method: "DELETE" }),
};

// Función para limpiar el cache del token (útil al hacer logout)
export function clearAuthTokenCache() {
  cachedToken = null;
  tokenExpiry = 0;
}
