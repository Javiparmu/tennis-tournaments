import type { ApiResponse } from "@/models";

const apiBaseUrl = process.env.NEXT_PUBLIC_API_BASE_URL;

function resolveTimeoutMs(): number {
  const parsed = Number(process.env.NEXT_PUBLIC_API_TIMEOUT_MS ?? 8000);
  return Number.isFinite(parsed) && parsed > 0 ? parsed : 8000;
}

const requestTimeoutMs = resolveTimeoutMs();

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

export async function request<T>(path: string, init?: RequestInit): Promise<T> {
  if (!apiBaseUrl) {
    throw new Error("NEXT_PUBLIC_API_BASE_URL is not configured.");
  }

  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), requestTimeoutMs);
  const base = apiBaseUrl.replace(/\/+$/, "");

  try {
    const headers = new Headers(init?.headers);
    headers.set("Content-Type", "application/json");

    const response = await fetch(`${base}${path}`, {
      ...init,
      signal: controller.signal,
      cache: "no-store",
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
