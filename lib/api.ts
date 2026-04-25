import type {
  Achievement,
  ApiResponse,
  RacketSummary,
  Tournament,
  User,
  UserMatchActivityItem,
  UserMatchActivityResponse,
} from "./types";

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

const mockAchievements: Achievement[] = [
  {
    id: 1,
    key: "tournament_winner",
    name: "Tournament Winner",
    description: "Awarded for winning at least one tournament.",
  },
  {
    id: 2,
    key: "match_hardened",
    name: "Match Hardened",
    description: "Played enough matches to show real consistency.",
  },
];

const mockUser: User = {
  id: 1,
  username: "rising.player",
  email: "rising.player@example.com",
  authProvider: "clerk",
  authSubject: "mock-subject",
  createdAt: "2026-04-01T10:00:00.000Z",
  updatedAt: "2026-04-20T10:00:00.000Z",
  achievements: mockAchievements,
};

const mockMatches: UserMatchActivityItem[] = [
  {
    matchId: 101,
    completedAt: "2026-04-05T17:00:00.000Z",
    status: "COMPLETED",
    result: "WIN",
    score: {
      sets: [
        { player1Games: 6, player2Games: 4, tiebreak: null },
        { player1Games: 6, player2Games: 3, tiebreak: null },
      ],
    },
    court: "Court 2",
    tournament: { id: 7, name: "Madrid Spring Open" },
    phase: { id: 18, phaseOrder: 1, format: "KNOCKOUT", round: 1 },
    opponent: { id: 11, name: "Lucia Ramos", userId: 2 },
  },
  {
    matchId: 102,
    completedAt: "2026-04-12T10:30:00.000Z",
    status: "COMPLETED",
    result: "LOSS",
    score: {
      sets: [
        { player1Games: 4, player2Games: 6, tiebreak: null },
        { player1Games: 4, player2Games: 6, tiebreak: null },
      ],
    },
    court: "Court 1",
    tournament: { id: 7, name: "Madrid Spring Open" },
    phase: { id: 18, phaseOrder: 1, format: "KNOCKOUT", round: 2 },
    opponent: { id: 12, name: "Marta Gil", userId: 3 },
  },
  {
    matchId: 103,
    completedAt: "2026-04-18T09:00:00.000Z",
    status: "WALKOVER",
    result: "WIN",
    score: null,
    court: null,
    tournament: { id: 9, name: "Valencia Weekend Cup" },
    phase: { id: 21, phaseOrder: 1, format: "SWISS", round: 2 },
    opponent: { id: 13, name: "Bye", userId: null },
  },
];

const mockPublicRackets: RacketSummary[] = [
  {
    id: 1,
    displayName: "Blade 98",
    brand: "Wilson",
    model: "V9",
    stringPattern: "16x19",
    visibility: "PUBLIC",
    latestStringing: {
      id: 100,
      stringingDate: "2026-04-10",
      mainsTensionKg: 22,
      crossesTensionKg: 21,
      mainStringType: "Alu Power",
      crossStringType: "Alu Power",
      performanceNotes: "Firm but controlled.",
      createdAt: "2026-04-10T09:00:00.000Z",
      updatedAt: null,
    },
    createdAt: "2026-03-01T09:00:00.000Z",
    updatedAt: "2026-04-10T09:00:00.000Z",
  },
];

const mockMyRackets: RacketSummary[] = [
  ...mockPublicRackets,
  {
    id: 2,
    displayName: "Prestige Tour",
    brand: "Head",
    model: "2025",
    stringPattern: "18x20",
    visibility: "PRIVATE",
    latestStringing: {
      id: 101,
      stringingDate: "2026-04-14",
      mainsTensionKg: 21.5,
      crossesTensionKg: 20.5,
      mainStringType: "Lynx Tour",
      crossStringType: "Velocity",
      performanceNotes: "Match-day setup.",
      createdAt: "2026-04-14T11:00:00.000Z",
      updatedAt: null,
    },
    createdAt: "2026-02-18T08:00:00.000Z",
    updatedAt: "2026-04-14T11:00:00.000Z",
  },
];

function buildMockUser(userId: number): User {
  return {
    ...mockUser,
    id: userId,
    username: userId === mockUser.id ? mockUser.username : `player.${userId}`,
  };
}

function buildMockActivity(userId: number, from: string, to: string): UserMatchActivityResponse {
  const fromDate = new Date(from);
  const toDate = new Date(to);
  const matches = mockMatches.filter((match) => {
    const completedAt = new Date(match.completedAt);
    return completedAt >= fromDate && completedAt <= toDate;
  });

  return {
    userId,
    playerId: userId,
    playerName: "Rising Baseline Player",
    from,
    to,
    matches,
  };
}

async function request<T>(path: string, init?: RequestInit): Promise<T> {
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
    const json = (await response.json()) as ApiResponse<T>;
    if (json.status !== "SUCCESS" || !json.data) {
      throw new Error(json.message ?? "Backend returned an error response.");
    }
    return json.data;
  } finally {
    clearTimeout(timeout);
  }
}

function buildRequestInit(init?: RequestInit, token?: string | null): RequestInit {
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

export async function getUser(userId: number): Promise<User> {
  if (useMockData) {
    return buildMockUser(userId);
  }

  return request<User>(`/users/${userId}`);
}

export async function getMe(token: string | null | undefined): Promise<User> {
  if (useMockData) {
    return mockUser;
  }

  if (!token) {
    throw new Error("Authentication token is required.");
  }

  return request<User>("/users/me", buildRequestInit(undefined, token));
}

export async function getUserMatchActivity(
  userId: number,
  from: string,
  to: string,
): Promise<UserMatchActivityResponse> {
  if (useMockData) {
    return buildMockActivity(userId, from, to);
  }

  const query = new URLSearchParams({ from, to }).toString();
  return request<UserMatchActivityResponse>(`/users/${userId}/matches?${query}`);
}

export async function getPublicRackets(userId: number): Promise<RacketSummary[]> {
  if (useMockData) {
    return mockPublicRackets;
  }

  return request<RacketSummary[]>(`/users/${userId}/rackets`);
}

export async function getMyRackets(token: string | null | undefined): Promise<RacketSummary[]> {
  if (useMockData) {
    return mockMyRackets;
  }

  if (!token) {
    throw new Error("Authentication token is required.");
  }

  return request<RacketSummary[]>("/users/me/rackets", buildRequestInit(undefined, token));
}
