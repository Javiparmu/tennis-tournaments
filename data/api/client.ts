import type { ApiResponse } from "@/models";

const apiBaseUrl = process.env.NEXT_PUBLIC_API_BASE_URL;
const requestTimeoutMs = Number(process.env.NEXT_PUBLIC_API_TIMEOUT_MS ?? 8000);

export async function request<T>(path: string, init?: RequestInit): Promise<T> {
  if (!apiBaseUrl) {
    throw new Error("NEXT_PUBLIC_API_BASE_URL is not configured.");
  }

  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), requestTimeoutMs);

  try {
    const headers = new Headers(init?.headers);
    headers.set("Content-Type", "application/json");

    const response = await fetch(`${apiBaseUrl}${path}`, {
      ...init,
      signal: controller.signal,
      cache: "no-store",
      headers,
    });

    if (!response.ok) {
      throw new Error(`API request failed with status ${response.status}`);
    }

    if (response.status === 204) {
      return undefined as T;
    }

    const rawText = await response.text();
    if (!rawText) {
      return undefined as T;
    }

    const json = JSON.parse(rawText) as ApiResponse<T>;
    if (json.status !== "SUCCESS" || json.data == null) {
      throw new Error(json.message ?? "Backend returned an error response.");
    }

    return json.data;
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
