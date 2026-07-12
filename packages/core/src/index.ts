// Barrel entry for @courtrank/core. The mobile app imports from here; the web app
// imports the granular subpaths (@courtrank/core/api/*, /queries/*, /lib/*,
// /models) declared in package.json "exports".

// Domain types
export type * from "./models";

// Pure domain logic
export * from "./lib/format";
export * from "./lib/score";
export * from "./lib/standings";
export * from "./lib/search";
export * from "./lib/labels";
export * from "./lib/contact";
export * from "./lib/errors";
export * from "./lib/surface";

// API client + config (setApiConfig/getApiConfig re-exported by ./api/client)
export * from "./api/client";

// API domain modules
export * from "./api/admin";
export * from "./api/clubs";
export * from "./api/matches";
export * from "./api/players";
export * from "./api/rackets";
export * from "./api/tournaments";
export * from "./api/trainings";
export * from "./api/users";

// React Query keys + optimistic mutation wiring
export * from "./queries/keys";
export * from "./queries/optimistic";
