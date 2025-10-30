export interface Club {
  id: string;
  name: string;
  description?: string | null;
  address: string;
  city: string;
  phone?: string | null;
  email?: string | null;
  website?: string | null;
  logo?: string | null;
  stripeAccountId?: string | null;
  createdAt: string;
  updatedAt: string;
  creatorId: string;
  creator?: {
    id: string;
    name: string;
    email: string;
  };
  _count?: {
    memberships: number;
    events: number;
    courts: number;
  };
}

export interface ClubMembership {
  id: string;
  status: "ACTIVE" | "INACTIVE" | "PENDING" | "CANCELLED";
  joinedAt: string;
  expiresAt?: string | null;
  userId: string;
  clubId: string;
  user: {
    id: string;
    name: string;
    email: string;
    phone?: string | null;
    city?: string | null;
    avatar?: string | null;
    duprRating?: number | null;
  };
}

export interface CreateClubData {
  name: string;
  description?: string;
  address: string;
  city: string;
  phone?: string;
  email?: string;
  website?: string;
  logo?: string;
}

export interface UpdateClubData {
  name?: string;
  description?: string;
  address?: string;
  city?: string;
  phone?: string;
  email?: string;
  website?: string;
  logo?: string;
}

export interface AddMemberData {
  userId: string;
  status?: "ACTIVE" | "PENDING";
  expiresAt?: string;
}

export interface UpdateMembershipData {
  status: "ACTIVE" | "INACTIVE" | "PENDING" | "CANCELLED";
  expiresAt?: string;
}

export interface ClubsResponse {
  clubs: Club[];
  pagination: {
    page: number;
    limit: number;
    totalCount: number;
    totalPages: number;
    hasNextPage: boolean;
    hasPreviousPage: boolean;
  };
}

export interface MembersResponse {
  club: {
    id: string;
    name: string;
  };
  members: ClubMembership[];
  pagination: {
    page: number;
    limit: number;
    totalCount: number;
    totalPages: number;
    hasNextPage: boolean;
    hasPreviousPage: boolean;
  };
}
