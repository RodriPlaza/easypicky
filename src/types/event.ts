// src/types/event.ts

import {
  EventType,
  EventVisibility,
  EventStatus,
  Event as PrismaEvent,
} from "@prisma/client";

export type { EventType, EventVisibility, EventStatus };

// Event completo con relaciones
export interface Event extends PrismaEvent {
  club: {
    id: string;
    name: string;
    city: string;
    logo?: string | null;
    creatorId: string; // ✅ AGREGADO
  };
  court?: {
    id: string;
    name: string;
  } | null;
  _count?: {
    participants: number;
    matches: number;
  };
}

// Event con información del usuario participante
export interface EventWithParticipation extends Event {
  isParticipant: boolean;
  isCheckedIn: boolean;
  canCheckIn: boolean;
}

// Datos para crear evento
export interface CreateEventData {
  title: string;
  description?: string;
  type: EventType;
  visibility: EventVisibility;
  startDateTime: string;
  endDateTime: string;
  maxParticipants?: number;
  price?: number;
  clubId: string;
  courtId?: string;
}

// Datos para actualizar evento
export interface UpdateEventData {
  title?: string;
  description?: string;
  type?: EventType;
  visibility?: EventVisibility;
  status?: EventStatus;
  startDateTime?: string;
  endDateTime?: string;
  maxParticipants?: number;
  price?: number;
  courtId?: string;
}

// Respuesta del listado de eventos
export interface EventsResponse {
  events: Event[];
  pagination: {
    page: number;
    limit: number;
    totalCount: number;
    totalPages: number;
    hasNextPage: boolean;
    hasPreviousPage: boolean;
  };
}

// Respuesta de eventos cercanos
export interface NearbyEventsResponse {
  events: Event[];
  city: string;
  pagination: {
    page: number;
    limit: number;
    totalCount: number;
    totalPages: number;
    hasNextPage: boolean;
    hasPreviousPage: boolean;
  };
}

// Participante de evento
export interface EventParticipant {
  id: string;
  userId: string;
  eventId: string;
  registeredAt: string;
  checkedIn: boolean;
  checkedInAt: string | null;
  user: {
    id: string;
    name: string;
    email: string;
    avatar?: string | null;
    city?: string | null;
    duprRating?: number | null;
  };
}

// Respuesta del listado de participantes
export interface ParticipantsResponse {
  participants: EventParticipant[];
  event: {
    id: string;
    title: string;
    maxParticipants?: number | null;
  };
  stats: {
    total: number;
    checkedIn: number;
    notCheckedIn: number;
  };
  pagination: {
    page: number;
    limit: number;
    totalCount: number;
    totalPages: number;
    hasNextPage: boolean;
    hasPreviousPage: boolean;
  };
}

// Filtros para búsqueda de eventos
export interface EventFilters {
  page?: number;
  limit?: number;
  clubId?: string;
  type?: EventType;
  status?: EventStatus;
  city?: string;
  startDate?: string;
  endDate?: string;
  upcoming?: boolean;
}

// Filtros para eventos cercanos
export interface NearbyEventFilters {
  page?: number;
  limit?: number;
  type?: EventType;
  daysAhead?: number;
  openOnly?: boolean;
}
