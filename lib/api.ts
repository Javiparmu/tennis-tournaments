import type { ApiResponse, Player, PlayerProfileView, Tournament } from "./types";

const apiBaseUrl = process.env.NEXT_PUBLIC_API_BASE_URL;
const requestTimeoutMs = Number(process.env.NEXT_PUBLIC_API_TIMEOUT_MS ?? 8000);
const useMockData = process.env.NEXT_PUBLIC_USE_MOCK_DATA === "true";

const mockTournaments: Tournament[] = [
  {
    id: 1,
    name: "Madrid Spring Open",
    description: "Open draw tournament on clay courts.",
    surface: "CLAY",
    clubId: 10,
    startDate: "2026-04-18T09:00:00.000Z",
    endDate: "2026-04-20T20:00:00.000Z",
    createdAt: "2026-04-01T10:00:00.000Z",
    updatedAt: "2026-04-01T10:00:00.000Z",
    players: [],
    phases: [],
  },
  {
    id: 2,
    name: "Valencia Weekend Cup",
    description: "Fast hard-court event with knockout bracket.",
    surface: "HARD",
    clubId: 11,
    startDate: "2026-04-25T08:00:00.000Z",
    endDate: "2026-04-26T18:00:00.000Z",
    createdAt: "2026-04-02T10:00:00.000Z",
    updatedAt: "2026-04-02T10:00:00.000Z",
    players: [],
    phases: [],
  },
  {
    id: 3,
    name: "Bilbao Night Series",
    description: "Evening matches with mixed phase formats.",
    surface: "GRASS",
    clubId: 12,
    startDate: "2026-05-02T17:30:00.000Z",
    endDate: "2026-05-03T22:00:00.000Z",
    createdAt: "2026-04-03T10:00:00.000Z",
    updatedAt: "2026-04-03T10:00:00.000Z",
    players: [],
    phases: [],
  },
];

const mockPlayers: Player[] = [
  { id: 1, name: "Rising Baseline Player", external: false, user: { id: 1, username: "rising.player" } },
];

function getMockProfile(): PlayerProfileView {
  return {
    displayName: "Rising Baseline Player",
    elo: 1420,
    points: 980,
    achievements: ["Top 8 Finish", "5 Match Win Streak", "Clay Specialist"],
    favoriteSurface: "CLAY",
    bio: "Competing every weekend and improving one tournament at a time.",
  };
}

async function request<T>(path: string, init?: RequestInit): Promise<T> {
  if (!apiBaseUrl) {
    throw new Error("NEXT_PUBLIC_API_BASE_URL is not configured.");
  }

  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), requestTimeoutMs);

  try {
    const response = await fetch(`${apiBaseUrl}${path}`, {
      ...init,
      signal: controller.signal,
      cache: "no-store",
      headers: {
        "Content-Type": "application/json",
        ...(init?.headers ?? {}),
      },
    });

    if (!response.ok) {
      throw new Error(`API request failed with status ${response.status}`);
    }
    const json = (await response.json()) as ApiResponse<T>;
    if (json.status !== "SUCCESS" || !json.data) {
      throw new Error(json.message ?? "Backend returned an error response.");
    }
    return json.data;
  } finally {
    clearTimeout(timeout);
  }
}

export async function getTournaments(): Promise<Tournament[]> {
  if (useMockData) return mockTournaments;

  try {
    return await request<Tournament[]>("/tournaments");
  } catch {
    return mockTournaments;
  }
}

export async function getUpcomingCalendar(limit = 4): Promise<Tournament[]> {
  const tournaments = await getTournaments();
  return tournaments
    .sort((a, b) => +new Date(a.startDate) - +new Date(b.startDate))
    .slice(0, limit);
}

export async function getPlayers(): Promise<Player[]> {
  if (useMockData) return mockPlayers;

  try {
    return await request<Player[]>("/players");
  } catch {
    return mockPlayers;
  }
}

export async function getCurrentPlayerProfile(username?: string): Promise<PlayerProfileView | null> {
  if (useMockData) return getMockProfile();

  try {
    const players = await getPlayers();
    const current =
      players.find((player) => player.user?.username === username) ??
      players.find((player) => !player.external) ??
      players[0];
    if (!current) return null;
    return {
      displayName: current.name,
      elo: 1400,
      points: 0,
      achievements: [],
      favoriteSurface: null,
      bio: "Your profile is linked from Clerk and hydrated by backend data.",
    };
  } catch {
    return getMockProfile();
  }
}
