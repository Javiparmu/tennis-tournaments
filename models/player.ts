import type { PublicUser } from "./user";

export type Player = {
  id: number;
  name: string;
  external: boolean;
  seed?: number | null;
  user: PublicUser | null;
};

export type CreatePlayerRequest = {
  name: string;
};

export type UpdatePlayerRequest = {
  id: number;
  name?: string | null;
};
