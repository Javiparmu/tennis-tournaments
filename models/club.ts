import type { PublicUser } from "./user";

export type Club = {
  id: number;
  name: string;
  phoneNumber: string | null;
  address: string | null;
  user: PublicUser;
};
