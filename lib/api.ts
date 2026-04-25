import type {
  Achievement,
  ApiResponse,
  CreateTrainingRequest,
  ProfileCalendarDay,
  ProfileCalendarEvent,
  ProfileCalendarResponse,
  RacketSummary,
  Tournament,
  User,
  UserProfileMatchEntry,
  UserMatchActivityItem,
  UserMatchActivityResponse,
  UserTrainingEntry,
  UserTrainingRangeResponse,
  UpdateTrainingRequest,
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

const mockProfileMatches: UserProfileMatchEntry[] = [
  {
    matchId: 101,
    status: "COMPLETED",
    result: "WIN",
    scheduledTime: "2026-04-05T15:30:00.000Z",
    completedAt: "2026-04-05T17:00:00.000Z",
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
    status: "COMPLETED",
    result: "LOSS",
    scheduledTime: "2026-04-12T09:30:00.000Z",
    completedAt: "2026-04-12T10:30:00.000Z",
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
    status: "WALKOVER",
    result: "WIN",
    scheduledTime: null,
    completedAt: "2026-04-18T09:00:00.000Z",
    score: null,
    court: null,
    tournament: { id: 9, name: "Valencia Weekend Cup" },
    phase: { id: 21, phaseOrder: 1, format: "SWISS", round: 2 },
    opponent: { id: 13, name: "Bye", userId: null },
  },
  {
    matchId: 104,
    status: "SCHEDULED",
    result: null,
    scheduledTime: "2026-04-26T10:00:00.000Z",
    completedAt: null,
    score: null,
    court: "Court 4",
    tournament: { id: 11, name: "Barcelona Sunday Clash" },
    phase: { id: 27, phaseOrder: 1, format: "GROUP", round: 3 },
    opponent: { id: 14, name: "Nadia Costa", userId: 8 },
  },
  {
    matchId: 105,
    status: "LIVE",
    result: null,
    scheduledTime: "2026-04-27T18:30:00.000Z",
    completedAt: null,
    score: {
      sets: [{ player1Games: 6, player2Games: 4, tiebreak: null }],
    },
    court: "Center Court",
    tournament: { id: 12, name: "Bilbao Twilight Open" },
    phase: { id: 28, phaseOrder: 2, format: "SWISS", round: 4 },
    opponent: { id: 15, name: "Irene Santos", userId: 9 },
  },
];

const mockTrainings: UserTrainingEntry[] = [
  {
    id: 1,
    trainingDate: "2026-04-06",
    durationMinutes: 90,
    notes: "Cross-court forehands and serve rhythm.",
    visibility: "PUBLIC",
    createdAt: "2026-04-06T08:00:00.000Z",
    updatedAt: null,
  },
  {
    id: 2,
    trainingDate: "2026-04-12",
    durationMinutes: 60,
    notes: "Private fitness block and recovery work.",
    visibility: "PRIVATE",
    createdAt: "2026-04-12T18:00:00.000Z",
    updatedAt: "2026-04-12T20:00:00.000Z",
  },
  {
    id: 3,
    trainingDate: "2026-04-26",
    durationMinutes: 75,
    notes: "Match-prep serves and return patterns.",
    visibility: "PUBLIC",
    createdAt: "2026-04-26T07:30:00.000Z",
    updatedAt: null,
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

function getNextMockTrainingId() {
  return Math.max(0, ...mockTrainings.map((training) => training.id)) + 1;
}

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

function toIsoDateInTimezone(value: string, timezone: string) {
  const formatter = new Intl.DateTimeFormat("en-CA", {
    timeZone: timezone,
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  });

  return formatter.format(new Date(value));
}

function isDateWithinRange(value: string, from: string, to: string) {
  return value >= from && value <= to;
}

function buildMockTrainingRange(
  userId: number,
  from: string,
  to: string,
  includePrivate: boolean,
): UserTrainingRangeResponse {
  const trainings = mockTrainings.filter(
    (training) =>
      isDateWithinRange(training.trainingDate, from, to) &&
      (includePrivate || training.visibility === "PUBLIC"),
  );

  const calendarDays = Array.from(
    trainings.reduce((acc, training) => {
      acc.set(training.trainingDate, (acc.get(training.trainingDate) ?? 0) + 1);
      return acc;
    }, new Map<string, number>()),
  )
    .sort(([left], [right]) => left.localeCompare(right))
    .map(([date, trainingCount]) => ({ date, trainingCount }));

  return {
    userId,
    from,
    to,
    calendarDays,
    trainings,
  };
}

function buildMockProfileCalendar(
  userId: number,
  from: string,
  to: string,
  timezone: string,
  includePrivateTrainings: boolean,
): ProfileCalendarResponse {
  const matchEvents: ProfileCalendarEvent[] = mockProfileMatches
    .map((match) => {
      const referenceTime = match.completedAt ?? match.scheduledTime;
      if (!referenceTime) return null;

      const date = toIsoDateInTimezone(referenceTime, timezone);
      if (!isDateWithinRange(date, from, to)) return null;

      return {
        eventId: `match-${match.matchId}`,
        eventType: "MATCH",
        date,
        sortTime: referenceTime,
        match,
        training: null,
      } satisfies ProfileCalendarEvent;
    })
    .filter((event): event is ProfileCalendarEvent => event != null);

  const trainingEvents: ProfileCalendarEvent[] = mockTrainings
    .filter(
      (training) =>
        isDateWithinRange(training.trainingDate, from, to) &&
        (includePrivateTrainings || training.visibility === "PUBLIC"),
    )
    .map((training) => ({
      eventId: `training-${training.id}`,
      eventType: "TRAINING",
      date: training.trainingDate,
      sortTime: null,
      match: null,
      training,
    }));

  const events = [...matchEvents, ...trainingEvents].sort((left, right) => {
    if (left.date !== right.date) return left.date.localeCompare(right.date);
    if (left.sortTime == null && right.sortTime == null) return left.eventId.localeCompare(right.eventId);
    if (left.sortTime == null) return 1;
    if (right.sortTime == null) return -1;
    return left.sortTime.localeCompare(right.sortTime) || left.eventId.localeCompare(right.eventId);
  });

  const calendarDays = Array.from(
    events.reduce((acc, event) => {
      const current =
        acc.get(event.date) ??
        ({
          date: event.date,
          totalCount: 0,
          scheduledMatchCount: 0,
          liveMatchCount: 0,
          completedMatchCount: 0,
          walkoverMatchCount: 0,
          trainingCount: 0,
        } satisfies ProfileCalendarDay);

      current.totalCount += 1;
      if (event.eventType === "TRAINING") {
        current.trainingCount += 1;
      } else if (event.match) {
        switch (event.match.status) {
          case "SCHEDULED":
            current.scheduledMatchCount += 1;
            break;
          case "LIVE":
            current.liveMatchCount += 1;
            break;
          case "COMPLETED":
            current.completedMatchCount += 1;
            break;
          case "WALKOVER":
            current.walkoverMatchCount += 1;
            break;
        }
      }

      acc.set(event.date, current);
      return acc;
    }, new Map<string, ProfileCalendarDay>()),
  )
    .map(([, day]) => day)
    .sort((left, right) => left.date.localeCompare(right.date));

  return {
    userId,
    from,
    to,
    calendarDays,
    events,
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

    if (response.status === 204) {
      return undefined as T;
    }

    const rawText = await response.text();
    if (!rawText) {
      return undefined as T;
    }

    const json = JSON.parse(rawText) as ApiResponse<T>;
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

export async function getUserProfileCalendar(
  userId: number,
  from: string,
  to: string,
  timezone: string,
): Promise<ProfileCalendarResponse> {
  if (useMockData) {
    return buildMockProfileCalendar(userId, from, to, timezone, false);
  }

  const query = new URLSearchParams({ from, to, timezone }).toString();
  return request<ProfileCalendarResponse>(`/users/${userId}/profile-calendar?${query}`);
}

export async function getMyProfileCalendar(
  token: string | null | undefined,
  from: string,
  to: string,
  timezone: string,
): Promise<ProfileCalendarResponse> {
  if (useMockData) {
    return buildMockProfileCalendar(mockUser.id, from, to, timezone, true);
  }

  if (!token) {
    throw new Error("Authentication token is required.");
  }

  const query = new URLSearchParams({ from, to, timezone }).toString();
  return request<ProfileCalendarResponse>(`/users/me/profile-calendar?${query}`, buildRequestInit(undefined, token));
}

export async function getPublicTrainings(userId: number, from: string, to: string): Promise<UserTrainingRangeResponse> {
  if (useMockData) {
    return buildMockTrainingRange(userId, from, to, false);
  }

  const query = new URLSearchParams({ from, to }).toString();
  return request<UserTrainingRangeResponse>(`/users/${userId}/trainings?${query}`);
}

export async function getMyTrainings(
  token: string | null | undefined,
  from: string,
  to: string,
): Promise<UserTrainingRangeResponse> {
  if (useMockData) {
    return buildMockTrainingRange(mockUser.id, from, to, true);
  }

  if (!token) {
    throw new Error("Authentication token is required.");
  }

  const query = new URLSearchParams({ from, to }).toString();
  return request<UserTrainingRangeResponse>(`/users/me/trainings?${query}`, buildRequestInit(undefined, token));
}

export async function createTraining(
  token: string | null | undefined,
  payload: CreateTrainingRequest,
): Promise<UserTrainingEntry> {
  if (useMockData) {
    const createdTraining: UserTrainingEntry = {
      id: getNextMockTrainingId(),
      createdAt: new Date().toISOString(),
      updatedAt: null,
      ...payload,
      durationMinutes: payload.durationMinutes ?? null,
      notes: payload.notes ?? null,
    };

    mockTrainings.push(createdTraining);
    return createdTraining;
  }

  if (!token) {
    throw new Error("Authentication token is required.");
  }

  return request<UserTrainingEntry>(
    "/users/me/trainings",
    buildRequestInit({ method: "POST", body: JSON.stringify(payload) }, token),
  );
}

export async function updateTraining(
  token: string | null | undefined,
  trainingId: number,
  payload: UpdateTrainingRequest,
): Promise<UserTrainingEntry> {
  if (useMockData) {
    const existingIndex = mockTrainings.findIndex((training) => training.id === trainingId);
    const existing = existingIndex >= 0 ? mockTrainings[existingIndex] : undefined;
    if (!existing) {
      throw new Error("Training not found.");
    }

    const updatedTraining: UserTrainingEntry = {
      ...existing,
      ...payload,
      updatedAt: new Date().toISOString(),
      durationMinutes: payload.durationMinutes !== undefined ? payload.durationMinutes : existing.durationMinutes,
      notes: payload.notes !== undefined ? payload.notes : existing.notes,
      visibility: payload.visibility !== undefined ? payload.visibility : existing.visibility,
      trainingDate: payload.trainingDate !== undefined ? payload.trainingDate : existing.trainingDate,
    };

    mockTrainings[existingIndex] = updatedTraining;
    return updatedTraining;
  }

  if (!token) {
    throw new Error("Authentication token is required.");
  }

  return request<UserTrainingEntry>(
    `/users/me/trainings/${trainingId}`,
    buildRequestInit({ method: "PUT", body: JSON.stringify(payload) }, token),
  );
}

export async function deleteTraining(token: string | null | undefined, trainingId: number): Promise<void> {
  if (useMockData) {
    const existingIndex = mockTrainings.findIndex((training) => training.id === trainingId);
    if (existingIndex < 0) {
      throw new Error("Training not found.");
    }

    mockTrainings.splice(existingIndex, 1);
    return;
  }

  if (!token) {
    throw new Error("Authentication token is required.");
  }

  return request<void>(`/users/me/trainings/${trainingId}`, buildRequestInit({ method: "DELETE" }, token));
}
