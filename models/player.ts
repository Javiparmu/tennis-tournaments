import type { PublicUser } from "./user";

export type Player = {
  id: number;
  name: string;
  external: boolean;
  user: PublicUser | null;
};
