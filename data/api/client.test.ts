import { afterEach, describe, expect, it, vi } from "vitest";

// client.ts reads NEXT_PUBLIC_API_BASE_URL and NEXT_PUBLIC_API_TIMEOUT_MS at
// module-load time, so env-dependent behavior must be exercised through a fresh
// dynamic import after stubbing the environment.
async function loadClient(env: { baseUrl?: string; timeout?: string } = {}) {
  vi.resetModules();
  vi.stubEnv("NEXT_PUBLIC_API_BASE_URL", env.baseUrl ?? "http://api.test");
  vi.stubEnv("NEXT_PUBLIC_API_TIMEOUT_MS", env.timeout ?? "8000");
  return import("./client");
}

type FakeResponse = { ok: boolean; status: number; text: () => Promise<string> };

function fakeResponse(body: string | null, status = 200): FakeResponse {
  return {
    ok: status >= 200 && status < 300,
    status,
    text: async () => body ?? "",
  };
}

function mockFetch(response: FakeResponse | (() => never)) {
  const fn = vi.fn(async () => {
    if (typeof response === "function") response();
    return response;
  });
  vi.stubGlobal("fetch", fn);
  return fn;
}

afterEach(() => {
  vi.unstubAllGlobals();
  vi.unstubAllEnvs();
  vi.restoreAllMocks();
});

describe("request", () => {
  it("unwraps a SUCCESS envelope and returns its data", async () => {
    const { request } = await loadClient();
    mockFetch(fakeResponse(JSON.stringify({ status: "SUCCESS", data: { id: 7 }, message: null })));

    await expect(request<{ id: number }>("/tournaments/7")).resolves.toEqual({ id: 7 });
  });

  it("throws an ApiError with the server message and status on a non-2xx envelope", async () => {
    const { request, ApiError } = await loadClient();
    mockFetch(fakeResponse(JSON.stringify({ status: "FAILURE", data: null, message: "Torneo no encontrado" }), 404));

    try {
      await request("/tournaments/999");
      expect.unreachable("request should have thrown");
    } catch (error) {
      expect(error).toBeInstanceOf(ApiError);
      expect((error as InstanceType<typeof ApiError>).message).toBe("Torneo no encontrado");
      expect((error as InstanceType<typeof ApiError>).status).toBe(404);
    }
  });

  it("falls back to `Error <status>` when a non-2xx body is not a JSON envelope", async () => {
    const { request, ApiError } = await loadClient();
    mockFetch(fakeResponse("<html>Internal Server Error</html>", 500));

    try {
      await request("/tournaments");
      expect.unreachable("request should have thrown");
    } catch (error) {
      expect(error).toBeInstanceOf(ApiError);
      expect((error as InstanceType<typeof ApiError>).message).toBe("Error 500");
      expect((error as InstanceType<typeof ApiError>).status).toBe(500);
    }
  });

  it("rejects a 2xx body that is not an envelope with a Spanish message", async () => {
    const { request, ApiError } = await loadClient();
    mockFetch(fakeResponse(JSON.stringify({ unexpected: true })));

    try {
      await request("/tournaments");
      expect.unreachable("request should have thrown");
    } catch (error) {
      expect(error).toBeInstanceOf(ApiError);
      expect((error as InstanceType<typeof ApiError>).message).toBe("Respuesta inesperada del servidor.");
    }
  });

  it("returns undefined for a 204 No Content response", async () => {
    const { request } = await loadClient();
    mockFetch(fakeResponse(null, 204));

    await expect(request("/tournaments/1")).resolves.toBeUndefined();
  });

  it("returns undefined for an empty 2xx body", async () => {
    const { request } = await loadClient();
    mockFetch(fakeResponse("", 200));

    await expect(request("/tournaments/1")).resolves.toBeUndefined();
  });

  it("maps an AbortError to the Spanish timeout message", async () => {
    const { request, ApiError } = await loadClient();
    mockFetch(() => {
      const err = new Error("The operation was aborted");
      err.name = "AbortError";
      throw err;
    });

    try {
      await request("/tournaments");
      expect.unreachable("request should have thrown");
    } catch (error) {
      expect(error).toBeInstanceOf(ApiError);
      expect((error as InstanceType<typeof ApiError>).message).toBe(
        "La solicitud ha tardado demasiado. Inténtalo de nuevo.",
      );
    }
  });
});

describe("module-load-time configuration", () => {
  it("falls back to an 8000ms timeout when NEXT_PUBLIC_API_TIMEOUT_MS is not a number", async () => {
    const setTimeoutSpy = vi.spyOn(globalThis, "setTimeout");
    const { request } = await loadClient({ timeout: "abc" });
    mockFetch(fakeResponse(JSON.stringify({ status: "SUCCESS", data: {}, message: null })));

    await request("/tournaments");

    // The abort timer is armed with the resolved timeout; NaN falls back to 8000.
    const armedDelays = setTimeoutSpy.mock.calls.map((call) => call[1]);
    expect(armedDelays).toContain(8000);
  });

  it("joins a trailing-slash base URL without producing a double slash", async () => {
    const { request } = await loadClient({ baseUrl: "http://api.test/" });
    const fetchMock = mockFetch(fakeResponse(JSON.stringify({ status: "SUCCESS", data: {}, message: null })));

    await request("/tournaments");

    expect(fetchMock.mock.calls[0][0]).toBe("http://api.test/tournaments");
  });
});
