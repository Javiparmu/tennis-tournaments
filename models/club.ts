import type { PublicUser } from "./user";

export type Club = {
  id: number;
  name: string;
  phoneNumber: string | null;
  address: string | null;
  user: PublicUser;
};

export type CreateClubRequest = {
  name: string;
  phoneNumber?: string | null;
  address?: string | null;
};

export type UpdateClubRequest = {
  id: number;
  name?: string | null;
  phoneNumber?: string | null;
  address?: string | null;
};
