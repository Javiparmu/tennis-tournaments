export type PublicUser = {
  id: number;
  username: string;
};

export type User = {
  id: number;
  username: string;
  // Projected from our DB (synced from Clerk). Null until the backend supports them.
  name: string | null;
  imageUrl: string | null;
  email: string | null;
  authProvider: string | null;
  authSubject: string | null;
  createdAt: string | null;
  updatedAt: string | null;
  achievements: Achievement[];
};

export type UpdateUserRequest = {
  name?: string | null;
  imageUrl?: string | null;
};

export type Achievement = {
  id: number;
  key: string;
  name: string;
  description: string | null;
};
