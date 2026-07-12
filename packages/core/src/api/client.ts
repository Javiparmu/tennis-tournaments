import type { ApiResponse } from "../models";
import { getApiConfig } from "./config";

export { getApiConfig, setApiConfig } from "./config";
export type { ApiConfig } from "./config";

export class ApiError extends Error {
  status?: number;

  constructor(message: string, status?: number) {
    super(message);
    this.name = "ApiError";
    this.status = status;
  }
}

function isApiEnvelope(value: unknown): value is ApiResponse<unknown> {
  return (
    typeof value === "object" &&
    value !== null &&
    typeof (value as Record<string, unknown>).status === "string" &&
    "data" in value
  );
}

function extractErrorMessage(rawText: string): string | undefined {
  try {
    const parsed = JSON.parse(rawText) as unknown;
    if (isApiEnvelope(parsed) && typeof parsed.message === "string") {
      return parsed.message;
    }
  } catch {
    // Body is not a JSON envelope; fall through to the default message.
  }
  return undefined;
}

function resolveTimeoutMs(timeoutMs: number | undefined): number {
  return Number.isFinite(timeoutMs) && (timeoutMs as number) > 0 ? (timeoutMs as number) : 8000;
}

// App data always bypasses the fetch cache (React Query owns freshness);
// metadata fetches opt into a short server-side revalidation window instead.
type CachingStrategy = { cache: "no-store" } | { next: { revalidate: number } };

async function requestWithCaching<T>(
  path: string,
  init: RequestInit | undefined,
  caching: CachingStrategy,
): Promise<T> {
  const { baseUrl, timeoutMs } = getApiConfig();
  if (!baseUrl) {
    throw new Error("CourtRank API base URL is not configured.");
  }

  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), resolveTimeoutMs(timeoutMs));
  const base = baseUrl.replace(/\/+$/, "");

  try {
    const headers = new Headers(init?.headers);
    headers.set("Content-Type", "application/json");

    const response = await fetch(`${base}${path}`, {
      ...init,
      signal: controller.signal,
      ...caching,
      headers,
    });

    if (!response.ok) {
      const rawError = await response.text();
      const message = extractErrorMessage(rawError);
      throw new ApiError(message ?? `Error ${response.status}`, response.status);
    }

    if (response.status === 204) {
      return undefined as T;
    }

    const rawText = await response.text();
    if (!rawText) {
      return undefined as T;
    }

    const json = JSON.parse(rawText) as unknown;
    if (!isApiEnvelope(json)) {
      throw new ApiError("Respuesta inesperada del servidor.");
    }

    if (json.status !== "SUCCESS" || json.data == null) {
      throw new ApiError(json.message ?? "Backend returned an error response.");
    }

    return json.data as T;
  } catch (error) {
    if (error instanceof Error && error.name === "AbortError") {
      throw new ApiError("La solicitud ha tardado demasiado. Inténtalo de nuevo.");
    }
    throw error;
  } finally {
    clearTimeout(timeout);
  }
}

export async function request<T>(path: string, init?: RequestInit): Promise<T> {
  return requestWithCaching<T>(path, init, { cache: "no-store" });
}

// generateMetadata-only variant for public GETs (no token). A short server-side
// revalidation window keeps crawler/navigation bursts from hammering the backend.
// The `next` init key is a Next.js extension; other runtimes (React Native) ignore
// it, and only the web app calls this.
export async function requestForMetadata<T>(path: string): Promise<T> {
  return requestWithCaching<T>(path, undefined, { next: { revalidate: 300 } });
}

export function buildRequestInit(init?: RequestInit, token?: string | null): RequestInit {
  const headers = new Headers(init?.headers);
  headers.set("Content-Type", "application/json");
  if (token) {
    headers.set("Authorization", `Bearer ${token}`);
  }

  return {
    ...init,
    headers,
  };
}

export function requireToken(token: string | null | undefined) {
  if (!token) {
    throw new Error("Authentication token is required.");
  }

  return token;
}

// Thin per-method wrappers so the domain modules stay one-liners. Authed call
// sites keep `requireToken(token)` at the boundary and pass the validated
// string; public calls simply omit the token (no Authorization header).
function methodInit(method: string, body?: unknown, token?: string): RequestInit {
  return buildRequestInit({ method, ...(body !== undefined && { body: JSON.stringify(body) }) }, token);
}

export function apiGet<T>(path: string, token?: string): Promise<T> {
  return token ? request<T>(path, buildRequestInit(undefined, token)) : request<T>(path);
}

export function apiPost<T>(path: string, body?: unknown, token?: string): Promise<T> {
  return request<T>(path, methodInit("POST", body, token));
}

export function apiPut<T>(path: string, body?: unknown, token?: string): Promise<T> {
  return request<T>(path, methodInit("PUT", body, token));
}

export function apiPatch<T>(path: string, body?: unknown, token?: string): Promise<T> {
  return request<T>(path, methodInit("PATCH", body, token));
}

export function apiDelete<T>(path: string, token?: string): Promise<T> {
  return request<T>(path, methodInit("DELETE", undefined, token));
}
