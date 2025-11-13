// src/types/court.ts

export interface Court {
  id: string;
  name: string;
  description?: string | null;
  isActive: boolean;
  isReservable: boolean;
  openTime: string; // Formato "HH:mm"
  closeTime: string; // Formato "HH:mm"
  slotDuration: number; // Duración en minutos
  clubId: string;
  club?: {
    id: string;
    name: string;
  };
  _count?: {
    events: number;
    matches: number;
    reservations?: number;
  };
}

export interface CreateCourtData {
  name: string;
  description?: string;
  isActive?: boolean;
  isReservable?: boolean;
  openTime?: string;
  closeTime?: string;
  slotDuration?: number;
}

export interface UpdateCourtData {
  name?: string;
  description?: string;
  isActive?: boolean;
  isReservable?: boolean;
  openTime?: string;
  closeTime?: string;
  slotDuration?: number;
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

// Tipos para reservaciones
export interface CourtReservation {
  id: string;
  startTime: string;
  endTime: string;
  courtId: string;
  userId: string;
  eventId?: string | null;
  matchId?: string | null;
  createdAt: string;
  updatedAt: string;
  user?: {
    id: string;
    name: string;
    email: string;
  };
  event?: {
    id: string;
    title: string;
  };
  match?: {
    id: string;
    matchType: string;
  };
}

export interface TimeSlot {
  time: string; // Formato "HH:mm"
  isAvailable: boolean;
  reservation?: CourtReservation;
}

export interface CourtScheduleResponse {
  court: Court;
  date: string;
  slots: TimeSlot[];
}

export interface CreateReservationData {
  courtId: string;
  startTime: string; // ISO DateTime
  endTime: string; // ISO DateTime
}
