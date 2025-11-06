// src/types/court.ts

export interface Court {
  id: string;
  name: string;
  description?: string | null;
  isActive: boolean;
  clubId: string;
  club?: {
    id: string;
    name: string;
  };
  _count?: {
    events: number;
    matches: number;
  };
}

export interface CreateCourtData {
  name: string;
  description?: string;
  isActive?: boolean;
}

export interface UpdateCourtData {
  name?: string;
  description?: string;
  isActive?: boolean;
}

export interface CourtsResponse {
  club: {
    id: string;
    name: string;
  };
  courts: Court[];
  pagination?: {
    page: number;
    limit: number;
    totalCount: number;
    totalPages: number;
    hasNextPage: boolean;
    hasPreviousPage: boolean;
  };
}
