// src/types/match.ts

import type { MatchType } from "@prisma/client";

// Participante de partido
export interface MatchParticipant {
  id: string;
  team: number; // 1 o 2
  isWinner: boolean;
  userId: string;
  matchId: string;
  user: {
    id: string;
    name: string;
    email: string;
    avatar?: string | null;
    duprRating?: number | null;
  };
}

// Partido completo con relaciones
export interface Match {
  id: string;
  matchType: MatchType;
  startTime?: string | null;
  endTime?: string | null;
  score?: string | null;
  completed: boolean;
  createdAt: string;
  updatedAt: string;
  creatorId: string;
  courtId?: string | null;
  eventId?: string | null;
  creator?: {
    id: string;
    name: string;
    email: string;
  };
  court?: {
    id: string;
    name: string;
    clubId: string;
    club?: {
      id: string;
      name: string;
    };
  } | null;
  event?: {
    id: string;
    title: string;
    clubId: string;
  } | null;
  participants: MatchParticipant[];
}

// Datos para crear participante
export interface CreateMatchParticipantData {
  userId: string;
  team: 1 | 2;
  isWinner: boolean;
}

// Datos para crear partido informal
export interface CreateMatchData {
  matchType: MatchType;
  startTime?: string;
  endTime?: string;
  score?: string;
  completed?: boolean;
  courtId?: string;
  eventId?: string;
  participants: CreateMatchParticipantData[];
}

// Datos para actualizar partido
export interface UpdateMatchData {
  matchType?: MatchType;
  startTime?: string;
  endTime?: string;
  score?: string;
  completed?: boolean;
  courtId?: string;
  participants?: CreateMatchParticipantData[];
}

// Datos para crear partido de club
export interface CreateClubMatchData {
  matchType: MatchType;
  courtId: string; // Obligatorio en partidos de club
  startTime?: string;
  endTime?: string;
  score?: string;
  completed?: boolean;
  eventId?: string;
  participants: CreateMatchParticipantData[];
}

// Respuesta del listado de partidos
export interface MatchesResponse {
  matches: Match[];
  pagination: {
    page: number;
    limit: number;
    totalCount: number;
    totalPages: number;
    hasNextPage: boolean;
    hasPreviousPage: boolean;
  };
}

// Respuesta del listado de partidos de club
export interface ClubMatchesResponse {
  club: {
    id: string;
    name: string;
  };
  matches: Match[];
  pagination: {
    page: number;
    limit: number;
    totalCount: number;
    totalPages: number;
    hasNextPage: boolean;
    hasPreviousPage: boolean;
  };
}

// Estadísticas de usuario en partidos
export interface UserMatchStats {
  totalMatches: number;
  completedMatches: number;
  wins: number;
  losses: number;
  winRate: number;
  byType: {
    SINGLES: {
      total: number;
      wins: number;
      losses: number;
      winRate: number;
    };
    DOUBLES: {
      total: number;
      wins: number;
      losses: number;
      winRate: number;
    };
  };
}

// Respuesta de historial de partidos de usuario
export interface UserMatchHistoryResponse {
  user: {
    id: string;
    name: string;
    email: string;
  };
  matches: Match[];
  stats: UserMatchStats;
  pagination: {
    page: number;
    limit: number;
    totalCount: number;
    totalPages: number;
    hasNextPage: boolean;
    hasPreviousPage: boolean;
  };
}

// Filtros para búsqueda de partidos
export interface MatchFilters {
  page?: number;
  limit?: number;
  matchType?: MatchType;
  completed?: boolean;
  userId?: string;
  courtId?: string;
  eventId?: string;
  clubId?: string;
}

// Validación de score
export function isValidScore(score: string): boolean {
  // Formato válido: "21-19" o "21-19,19-21,11-9" (1-5 sets)
  const scoreRegex = /^\d{1,2}-\d{1,2}(,\d{1,2}-\d{1,2}){0,4}$/;
  return scoreRegex.test(score);
}

// Helper para formatear score
export function formatScore(score: string): string {
  if (!score) return "No registrado";
  return score.replace(/,/g, " | ");
}

// Helper para determinar ganador del partido por score
export function determineWinnerFromScore(score: string): 1 | 2 | null {
  if (!score || !isValidScore(score)) return null;

  const sets = score.split(",");
  let team1Wins = 0;
  let team2Wins = 0;

  for (const set of sets) {
    const [score1, score2] = set.split("-").map(Number);
    if (score1 > score2) {
      team1Wins++;
    } else if (score2 > score1) {
      team2Wins++;
    }
  }

  if (team1Wins > team2Wins) return 1;
  if (team2Wins > team1Wins) return 2;
  return null;
}

// Helper para calcular duración del partido
export function calculateMatchDuration(
  startTime?: string | null,
  endTime?: string | null
): number | null {
  if (!startTime || !endTime) return null;

  const start = new Date(startTime);
  const end = new Date(endTime);
  const durationMs = end.getTime() - start.getTime();

  return Math.floor(durationMs / 60000); // Retorna minutos
}
