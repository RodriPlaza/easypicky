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
import { MatchCard } from "@/components/matches/MatchCard";
import type { Match } from "@/types/match";
import type { Club } from "@/types/club";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

export default function ClubMatchesPage() {
  const { data: session } = useSession();
  const router = useRouter();
  const params = useParams();
  const { addToast } = useToast();

  const [club, setClub] = useState<Club | null>(null);
  const [matches, setMatches] = useState<Match[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [matchToDelete, setMatchToDelete] = useState<Match | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  // Filtros
  const [filters, setFilters] = useState({
    matchType: "",
    completed: "",
    courtId: "",
    eventId: "",
  });

  const clubId = params.id as string;

  useEffect(() => {
    fetchClubAndMatches();
  }, [clubId, currentPage, filters]);

  const fetchClubAndMatches = async () => {
    setIsLoading(true);
    try {
      // Obtener información del club
      const clubResponse = await api.get<{ club: Club }>(`/clubs/${clubId}`);
      setClub(clubResponse.club);

      // Obtener partidos del club
      const queryParams = new URLSearchParams({
        page: currentPage.toString(),
        limit: "12",
        ...(filters.matchType && { matchType: filters.matchType }),
        ...(filters.completed && { completed: filters.completed }),
        ...(filters.courtId && { courtId: filters.courtId }),
        ...(filters.eventId && { eventId: filters.eventId }),
      });

      const matchesResponse = await api.get<{
        club: { id: string; name: string };
        matches: Match[];
        pagination: {
          page: number;
          totalPages: number;
        };
      }>(`/clubs/${clubId}/matches?${queryParams}`);

      setMatches(matchesResponse.matches);
      setTotalPages(matchesResponse.pagination.totalPages);
    } catch (error) {
      if (error instanceof ApiError) {
        addToast({
          title: "Error",
          description: error.message,
          variant: "destructive",
        });
      }
    } finally {
      setIsLoading(false);
    }
  };

  const handleApplyFilters = () => {
    setCurrentPage(1);
    fetchClubAndMatches();
  };

  const handleClearFilters = () => {
    setFilters({
      matchType: "",
      completed: "",
      courtId: "",
      eventId: "",
    });
    setCurrentPage(1);
  };

  const handleDeleteMatch = async () => {
    if (!matchToDelete) return;

    setIsDeleting(true);
    try {
      await api.delete(`/clubs/${clubId}/matches/${matchToDelete.id}`);

      addToast({
        title: "¡Éxito!",
        description: "Partido eliminado correctamente",
        variant: "success",
      });

      setDeleteDialogOpen(false);
      setMatchToDelete(null);
      fetchClubAndMatches();
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

  if (!club) {
    return null;
  }

  const canManage =
    session?.user?.id === club.creatorId ||
    session?.user?.role === "SUPER_ADMIN";

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-4">
            <div>
              <h1 className="text-2xl font-bold">{club.name}</h1>
              <p className="text-sm text-muted-foreground">Partidos del club</p>
            </div>
            <div className="flex gap-2">
              {canManage && (
                <Link href={`/clubs/${clubId}/matches/new`}>
                  <Button>+ Registrar Partido</Button>
                </Link>
              )}
              <Link href={`/clubs/${clubId}`}>
                <Button variant="outline">Volver al Club</Button>
              </Link>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Filtros */}
        <Card className="mb-6">
          <CardHeader>
            <CardTitle className="text-base">Filtros</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <div className="space-y-2">
                <label className="text-sm font-medium">Tipo de Partido</label>
                <select
                  value={filters.matchType}
                  onChange={(e) =>
                    setFilters((prev) => ({
                      ...prev,
                      matchType: e.target.value,
                    }))
                  }
                  className="w-full px-3 py-2 border rounded-md"
                >
                  <option value="">Todos</option>
                  <option value="SINGLES">Singles</option>
                  <option value="DOUBLES">Doubles</option>
                </select>
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium">Estado</label>
                <select
                  value={filters.completed}
                  onChange={(e) =>
                    setFilters((prev) => ({
                      ...prev,
                      completed: e.target.value,
                    }))
                  }
                  className="w-full px-3 py-2 border rounded-md"
                >
                  <option value="">Todos</option>
                  <option value="true">Completados</option>
                  <option value="false">En progreso</option>
                </select>
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium">Pista (ID)</label>
                <input
                  type="text"
                  value={filters.courtId}
                  onChange={(e) =>
                    setFilters((prev) => ({ ...prev, courtId: e.target.value }))
                  }
                  placeholder="ID de pista"
                  className="w-full px-3 py-2 border rounded-md"
                />
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium">Evento (ID)</label>
                <input
                  type="text"
                  value={filters.eventId}
                  onChange={(e) =>
                    setFilters((prev) => ({ ...prev, eventId: e.target.value }))
                  }
                  placeholder="ID de evento"
                  className="w-full px-3 py-2 border rounded-md"
                />
              </div>
            </div>

            <div className="flex gap-2 mt-4">
              <Button onClick={handleApplyFilters}>Aplicar Filtros</Button>
              <Button variant="outline" onClick={handleClearFilters}>
                Limpiar
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Listado de partidos */}
        {matches.length === 0 ? (
          <Card>
            <CardContent className="text-center py-12">
              <p className="text-muted-foreground mb-4">
                No se encontraron partidos en este club
              </p>
              {canManage && (
                <Link href={`/clubs/${clubId}/matches/new`}>
                  <Button>Registrar primer partido</Button>
                </Link>
              )}
            </CardContent>
          </Card>
        ) : (
          <>
            <div className="mb-4">
              <p className="text-sm text-muted-foreground">
                Mostrando {matches.length} partidos
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {matches.map((match) => (
                <MatchCard
                  key={match.id}
                  match={match}
                  showClubInfo={false}
                  showEventInfo={true}
                  canManage={canManage}
                  clubId={clubId}
                  onEdit={(match) =>
                    router.push(`/clubs/${clubId}/matches/${match.id}/edit`)
                  }
                  onDelete={(match) => {
                    setMatchToDelete(match);
                    setDeleteDialogOpen(true);
                  }}
                />
              ))}
            </div>

            {/* Paginación */}
            {totalPages > 1 && (
              <div className="flex justify-center items-center gap-4 mt-8">
                <Button
                  variant="outline"
                  onClick={() =>
                    setCurrentPage((prev) => Math.max(1, prev - 1))
                  }
                  disabled={currentPage === 1}
                >
                  Anterior
                </Button>
                <span className="text-sm">
                  Página {currentPage} de {totalPages}
                </span>
                <Button
                  variant="outline"
                  onClick={() =>
                    setCurrentPage((prev) => Math.min(totalPages, prev + 1))
                  }
                  disabled={currentPage === totalPages}
                >
                  Siguiente
                </Button>
              </div>
            )}
          </>
        )}
      </main>

      {/* Dialog de confirmación de eliminación */}
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
              onClick={() => {
                setDeleteDialogOpen(false);
                setMatchToDelete(null);
              }}
              disabled={isDeleting}
            >
              Cancelar
            </Button>
            <Button
              variant="destructive"
              onClick={handleDeleteMatch}
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
