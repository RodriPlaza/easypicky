"use client";

import { useState, useEffect } from "react";
import { useSession } from "next-auth/react";
import { useRouter, useParams } from "next/navigation";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/components/ui/use-toast";
import { api, ApiError } from "@/lib/api";
import type { Match } from "@/types/match";
import type { Club } from "@/types/club";
import { formatScore, calculateMatchDuration } from "@/types/match";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

export default function ClubMatchDetailPage() {
  const { data: session } = useSession();
  const router = useRouter();
  const params = useParams();
  const { addToast } = useToast();

  const [club, setClub] = useState<Club | null>(null);
  const [match, setMatch] = useState<Match | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);

  const clubId = params.id as string;
  const matchId = params.matchId as string;

  useEffect(() => {
    fetchData();
  }, [clubId, matchId]);

  const fetchData = async () => {
    setIsLoading(true);
    try {
      // Obtener información del club
      const clubResponse = await api.get<{ club: Club }>(`/clubs/${clubId}`);
      setClub(clubResponse.club);

      // Obtener partido
      const matchResponse = await api.get<{ match: Match }>(
        `/clubs/${clubId}/matches/${matchId}`
      );
      setMatch(matchResponse.match);
    } catch (error) {
      if (error instanceof ApiError) {
        addToast({
          title: "Error",
          description: error.message,
          variant: "destructive",
        });
        router.push(`/clubs/${clubId}/matches`);
      }
    } finally {
      setIsLoading(false);
    }
  };

  const handleDelete = async () => {
    setIsDeleting(true);
    try {
      await api.delete(`/clubs/${clubId}/matches/${matchId}`);

      addToast({
        title: "¡Éxito!",
        description: "Partido eliminado correctamente",
        variant: "success",
      });

      router.push(`/clubs/${clubId}/matches`);
    } catch (error) {
      if (error instanceof ApiError) {
        addToast({
          title: "Error",
          description: error.message,
          variant: "destructive",
        });
      }
    } finally {
      setIsDeleting(false);
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <p className="text-lg">Cargando...</p>
      </div>
    );
  }

  if (!match || !club) {
    return null;
  }

  const team1 = match.participants.filter((p) => p.team === 1);
  const team2 = match.participants.filter((p) => p.team === 2);
  const winningTeam = match.participants.find((p) => p.isWinner)?.team;
  const duration = calculateMatchDuration(match.startTime, match.endTime);
  const canManage =
    session?.user?.id === club.creatorId ||
    session?.user?.role === "SUPER_ADMIN";

  const formatDate = (dateString?: string | null) => {
    if (!dateString) return "No registrado";
    const date = new Date(dateString);
    return new Intl.DateTimeFormat("es-ES", {
      weekday: "long",
      day: "2-digit",
      month: "long",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    }).format(date);
  };

  const capitalize = (str: string) => {
    return str.charAt(0).toUpperCase() + str.slice(1);
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white border-b">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-4">
            <div>
              <div className="flex items-center gap-2 mb-1">
                <Badge variant="default">Partido de Club</Badge>
                <Badge
                  variant={match.matchType === "SINGLES" ? "info" : "secondary"}
                >
                  {match.matchType === "SINGLES" ? "Singles" : "Doubles"}
                </Badge>
                {match.completed ? (
                  <Badge variant="success">Completado</Badge>
                ) : (
                  <Badge variant="warning">En progreso</Badge>
                )}
              </div>
              <h1 className="text-2xl font-bold">{club.name}</h1>
              <p className="text-sm text-muted-foreground">
                {match.startTime
                  ? capitalize(formatDate(match.startTime))
                  : "Fecha no registrada"}
              </p>
            </div>
            <div className="flex gap-2">
              {canManage && (
                <>
                  <Button
                    variant="outline"
                    onClick={() =>
                      router.push(`/clubs/${clubId}/matches/${matchId}/edit`)
                    }
                  >
                    Editar
                  </Button>
                  <Button
                    variant="destructive"
                    onClick={() => setDeleteDialogOpen(true)}
                  >
                    Eliminar
                  </Button>
                </>
              )}
              <Button
                variant="outline"
                onClick={() => router.push(`/clubs/${clubId}/matches`)}
              >
                Volver a Partidos
              </Button>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Columna Principal */}
          <div className="lg:col-span-2 space-y-6">
            {/* Resultado */}
            <Card>
              <CardHeader>
                <CardTitle>Resultado</CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                {/* Equipo 1 */}
                <div
                  className={`p-4 rounded-lg ${
                    winningTeam === 1
                      ? "bg-green-50 border-2 border-green-300"
                      : "bg-gray-50 border"
                  }`}
                >
                  <div className="flex items-center justify-between mb-3">
                    <h3 className="text-lg font-semibold text-blue-600">
                      Equipo 1
                    </h3>
                    {winningTeam === 1 && (
                      <Badge variant="success">🏆 Ganador</Badge>
                    )}
                  </div>
                  <div className="space-y-2">
                    {team1.map((p) => (
                      <div
                        key={p.id}
                        className="flex items-center justify-between p-2 bg-white rounded"
                      >
                        <span className="font-medium">{p.user.name}</span>
                        <div className="flex items-center gap-2">
                          {p.user.duprRating && (
                            <Badge variant="outline">
                              DUPR: {p.user.duprRating}
                            </Badge>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* VS */}
                <div className="text-center">
                  <div className="inline-block px-4 py-2 bg-gray-100 rounded-full">
                    <span className="font-bold text-lg">VS</span>
                  </div>
                </div>

                {/* Equipo 2 */}
                <div
                  className={`p-4 rounded-lg ${
                    winningTeam === 2
                      ? "bg-green-50 border-2 border-green-300"
                      : "bg-gray-50 border"
                  }`}
                >
                  <div className="flex items-center justify-between mb-3">
                    <h3 className="text-lg font-semibold text-green-600">
                      Equipo 2
                    </h3>
                    {winningTeam === 2 && (
                      <Badge variant="success">🏆 Ganador</Badge>
                    )}
                  </div>
                  <div className="space-y-2">
                    {team2.map((p) => (
                      <div
                        key={p.id}
                        className="flex items-center justify-between p-2 bg-white rounded"
                      >
                        <span className="font-medium">{p.user.name}</span>
                        <div className="flex items-center gap-2">
                          {p.user.duprRating && (
                            <Badge variant="outline">
                              DUPR: {p.user.duprRating}
                            </Badge>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Score */}
                {match.score && (
                  <div className="text-center p-4 bg-blue-50 rounded-lg">
                    <p className="text-sm text-muted-foreground mb-2">
                      Marcador Final
                    </p>
                    <p className="font-mono text-2xl font-bold">
                      {formatScore(match.score)}
                    </p>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Información del Club */}
            <Card>
              <CardHeader>
                <CardTitle className="text-base">Club</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    {club.logo && (
                      <img
                        src={club.logo}
                        alt={club.name}
                        className="w-12 h-12 rounded-lg object-cover"
                      />
                    )}
                    <div>
                      <Link
                        href={`/clubs/${club.id}`}
                        className="font-medium text-blue-600 hover:underline"
                      >
                        {club.name}
                      </Link>
                      <p className="text-sm text-muted-foreground">
                        {club.city}
                      </p>
                    </div>
                  </div>
                  <Link href={`/clubs/${clubId}`}>
                    <Button variant="outline" size="sm">
                      Ver Club
                    </Button>
                  </Link>
                </div>
              </CardContent>
            </Card>

            {/* Creador */}
            <Card>
              <CardHeader>
                <CardTitle className="text-base">Registrado por</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center">
                    <span className="font-semibold text-blue-600">
                      {match.creator?.name.charAt(0).toUpperCase()}
                    </span>
                  </div>
                  <div>
                    <p className="font-medium">{match.creator?.name}</p>
                    <p className="text-sm text-muted-foreground">
                      {match.creator?.email}
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Columna Lateral */}
          <div className="space-y-6">
            {/* Información del Partido */}
            <Card>
              <CardHeader>
                <CardTitle className="text-base">Información</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <p className="text-sm text-muted-foreground mb-1">
                    Fecha de Inicio
                  </p>
                  <p className="font-medium">
                    {match.startTime
                      ? capitalize(formatDate(match.startTime))
                      : "No registrado"}
                  </p>
                </div>

                {match.endTime && (
                  <div>
                    <p className="text-sm text-muted-foreground mb-1">
                      Fecha de Fin
                    </p>
                    <p className="font-medium">
                      {capitalize(formatDate(match.endTime))}
                    </p>
                  </div>
                )}

                {duration && (
                  <div>
                    <p className="text-sm text-muted-foreground mb-1">
                      Duración
                    </p>
                    <p className="font-medium">{duration} minutos</p>
                  </div>
                )}

                {match.court && (
                  <div>
                    <p className="text-sm text-muted-foreground mb-1">Pista</p>
                    <p className="font-medium">{match.court.name}</p>
                  </div>
                )}

                {match.event && (
                  <div>
                    <p className="text-sm text-muted-foreground mb-1">Evento</p>
                    <Link
                      href={`/events/${match.event.id}`}
                      className="font-medium text-blue-600 hover:underline"
                    >
                      {match.event.title}
                    </Link>
                  </div>
                )}

                <div>
                  <p className="text-sm text-muted-foreground mb-1">
                    Fecha de Registro
                  </p>
                  <p className="font-medium text-sm">
                    {new Date(match.createdAt).toLocaleDateString("es-ES", {
                      day: "2-digit",
                      month: "short",
                      year: "numeric",
                    })}
                  </p>
                </div>
              </CardContent>
            </Card>

            {/* Acciones rápidas */}
            <Card>
              <CardHeader>
                <CardTitle className="text-base">Acciones</CardTitle>
              </CardHeader>
              <CardContent className="space-y-2">
                <Link href={`/clubs/${clubId}/matches`}>
                  <Button variant="outline" className="w-full">
                    Ver todos los partidos
                  </Button>
                </Link>
                <Link href={`/clubs/${clubId}`}>
                  <Button variant="outline" className="w-full">
                    Ir al club
                  </Button>
                </Link>
                {match.event && (
                  <Link href={`/events/${match.event.id}`}>
                    <Button variant="outline" className="w-full">
                      Ir al evento
                    </Button>
                  </Link>
                )}
              </CardContent>
            </Card>
          </div>
        </div>
      </main>

      {/* Dialog de confirmación */}
      <Dialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>¿Eliminar partido?</DialogTitle>
            <DialogDescription>
              Esta acción no se puede deshacer. El partido será eliminado
              permanentemente del club.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setDeleteDialogOpen(false)}
              disabled={isDeleting}
            >
              Cancelar
            </Button>
            <Button
              variant="destructive"
              onClick={handleDelete}
              disabled={isDeleting}
            >
              {isDeleting ? "Eliminando..." : "Eliminar"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
