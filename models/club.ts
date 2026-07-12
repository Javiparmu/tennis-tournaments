import type { PublicUser } from "./user";

export type Club = {
  id: number;
  name: string;
  phoneNumber: string | null;
  address: string | null;
  user: PublicUser;
};

// Contact-form submission from a club that wants to join; the operator reviews
// it and provisions the club manually.
export type ClubContactRequestPayload = {
  clubName: string;
  contactName: string;
  email: string;
  phone?: string | null;
  message?: string | null;
  // Handle of the signed-in user submitting the request; they become the club
  // owner on provisioning. Taken from /users/me (read-only in the form) so the
  // admin never has to look it up or retype it. See club-contact-modal.tsx.
  ownerUsername: string;
};

// A stored inquiry, as listed on the /admin review queue.
export type ClubContactRequest = {
  id: number;
  clubName: string;
  contactName: string;
  email: string;
  phone: string | null;
  message: string | null;
  createdAt: string;
  // Handle of the requester (the future club owner). Optional so responses from
  // an older backend — or requests captured before this field existed — still
  // parse; the admin provision modal falls back to a manual input when absent.
  ownerUsername?: string | null;
};

// Platform-admin club provisioning (/admin): the club is created on behalf of
// an existing user, who becomes its owner.
export type CreateClubRequest = {
  name: string;
  phoneNumber?: string | null;
  address?: string | null;
  ownerUserId: number;
};

export type UpdateClubRequest = {
  id: number;
  name?: string | null;
  phoneNumber?: string | null;
  address?: string | null;
};
