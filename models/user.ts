export type PublicUser = {
  id: number;
  username: string;
};

export type User = {
  id: number;
  username: string;
  email: string | null;
  authProvider: string | null;
  authSubject: string | null;
  createdAt: string | null;
  updatedAt: string | null;
  achievements: Achievement[];
};

export type Achievement = {
  id: number;
  key: string;
  name: string;
  description: string | null;
};
