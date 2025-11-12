"use client";

import Link from "next/link";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import type { Match } from "@/types/match";
import { formatScore, calculateMatchDuration } from "@/types/match";

interface MatchCardProps {
  match: Match;
  showClubInfo?: boolean;
  showEventInfo?: boolean;
  canManage?: boolean;
  clubId?: string; // Si está presente, usar rutas de club
  onEdit?: (match: Match) => void;
  onDelete?: (match: Match) => void;
}

export function MatchCard({
  match,
  showClubInfo = false,
  showEventInfo = false,
  canManage = false,
  clubId,
  onEdit,
  onDelete,
}: MatchCardProps) {
  // Obtener participantes por equipo
  const team1 = match.participants.filter((p) => p.team === 1);
  const team2 = match.participants.filter((p) => p.team === 2);

  // Determinar equipo ganador
  const winningTeam = match.participants.find((p) => p.isWinner)?.team;

  // Calcular duración
  const duration = calculateMatchDuration(match.startTime, match.endTime);

  // Determinar la URL de detalle según el contexto
  const detailUrl = clubId
    ? `/clubs/${clubId}/matches/${match.id}`
    : `/matches/${match.id}`;

  // Formatear fecha
  const formatDate = (dateString?: string | null) => {
    if (!dateString) return null;
    const date = new Date(dateString);
    return new Intl.DateTimeFormat("es-ES", {
      day: "2-digit",
      month: "short",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    }).format(date);
  };

  return (
    <Card className={!match.completed ? "border-yellow-300" : undefined}>
      <CardHeader>
        <div className="flex items-start justify-between">
          <div className="space-y-1">
            <div className="flex items-center gap-2 flex-wrap">
              <Badge
                variant={match.matchType === "SINGLES" ? "info" : "default"}
              >
                {match.matchType === "SINGLES" ? "Singles" : "Doubles"}
              </Badge>
              {match.completed ? (
                <Badge variant="success">Completado</Badge>
              ) : (
                <Badge variant="warning">En progreso</Badge>
              )}
            </div>
            <CardTitle className="text-lg">
              {match.matchType === "SINGLES"
                ? "Partido Singles"
                : "Partido Doubles"}
            </CardTitle>
            {match.startTime && (
              <CardDescription>{formatDate(match.startTime)}</CardDescription>
            )}
          </div>
        </div>
      </CardHeader>

      <CardContent className="space-y-4">
        {/* Equipos y resultado */}
        <div className="space-y-3">
          {/* Equipo 1 */}
          <div
            className={`flex items-center justify-between p-3 rounded-lg ${
              winningTeam === 1
                ? "bg-green-50 border border-green-200"
                : "bg-gray-50"
            }`}
          >
            <div className="flex-1">
              <div className="flex items-center gap-2 mb-1">
                <span className="font-semibold text-blue-600">Equipo 1</span>
                {winningTeam === 1 && (
                  <Badge variant="success" className="text-xs">
                    Ganador
                  </Badge>
                )}
              </div>
              <div className="text-sm space-y-1">
                {team1.map((p) => (
                  <div key={p.id} className="flex items-center gap-2">
                    <span>{p.user.name}</span>
                    {p.user.duprRating && (
                      <Badge variant="outline" className="text-xs">
                        {p.user.duprRating}
                      </Badge>
                    )}
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* VS */}
          <div className="text-center text-sm font-semibold text-muted-foreground">
            VS
          </div>

          {/* Equipo 2 */}
          <div
            className={`flex items-center justify-between p-3 rounded-lg ${
              winningTeam === 2
                ? "bg-green-50 border border-green-200"
                : "bg-gray-50"
            }`}
          >
            <div className="flex-1">
              <div className="flex items-center gap-2 mb-1">
                <span className="font-semibold text-green-600">Equipo 2</span>
                {winningTeam === 2 && (
                  <Badge variant="success" className="text-xs">
                    Ganador
                  </Badge>
                )}
              </div>
              <div className="text-sm space-y-1">
                {team2.map((p) => (
                  <div key={p.id} className="flex items-center gap-2">
                    <span>{p.user.name}</span>
                    {p.user.duprRating && (
                      <Badge variant="outline" className="text-xs">
                        {p.user.duprRating}
                      </Badge>
                    )}
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Score */}
        {match.score && (
          <div className="text-center p-3 bg-gray-50 rounded-lg">
            <p className="text-sm text-muted-foreground mb-1">Resultado</p>
            <p className="font-mono text-lg font-semibold">
              {formatScore(match.score)}
            </p>
          </div>
        )}

        {/* Información adicional */}
        <div className="flex flex-wrap gap-4 text-sm text-muted-foreground">
          {duration && (
            <div>
              <span className="font-semibold">{duration}</span> minutos
            </div>
          )}
          {match.court && (
            <div>
              Pista: <span className="font-semibold">{match.court.name}</span>
            </div>
          )}
        </div>

        {/* Info del club */}
        {showClubInfo && match.court?.club && (
          <div className="text-sm">
            <span className="text-muted-foreground">Club: </span>
            <Link
              href={`/clubs/${match.court.club.id}`}
              className="font-semibold hover:underline"
            >
              {match.court.club.name}
            </Link>
          </div>
        )}

        {/* Info del evento */}
        {showEventInfo && match.event && (
          <div className="text-sm">
            <span className="text-muted-foreground">Evento: </span>
            <Link
              href={`/events/${match.event.id}`}
              className="font-semibold hover:underline"
            >
              {match.event.title}
            </Link>
          </div>
        )}

        {/* Acciones */}
        <div className="flex gap-2 pt-2">
          <Link href={detailUrl} className="flex-1">
            <Button variant="outline" className="w-full">
              Ver Detalles
            </Button>
          </Link>

          {canManage && (
            <>
              <Button
                variant="outline"
                size="sm"
                onClick={() => onEdit?.(match)}
              >
                Editar
              </Button>
              <Button
                variant="destructive"
                size="sm"
                onClick={() => onDelete?.(match)}
              >
                Eliminar
              </Button>
            </>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
