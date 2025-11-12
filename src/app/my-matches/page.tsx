"use client";

import { useState, useEffect } from "react";
import { useSession } from "next-auth/react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/components/ui/use-toast";
import { api, ApiError } from "@/lib/api";
import { MatchCard } from "@/components/matches/MatchCard";
import type { Match, UserMatchStats } from "@/types/match";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

export default function MyMatchesPage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const searchParams = useSearchParams();
  const { addToast } = useToast();

  const [matches, setMatches] = useState<Match[]>([]);
  const [stats, setStats] = useState<UserMatchStats | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [matchToDelete, setMatchToDelete] = useState<Match | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  // Filtros
  const [filters, setFilters] = useState({
    matchType: searchParams.get("matchType") || "",
    completed: searchParams.get("completed") || "",
  });

  useEffect(() => {
    if (status === "unauthenticated") {
      router.push("/auth/signin");
    }
  }, [status, router]);

  useEffect(() => {
    if (session) {
      fetchMatches();
    }
  }, [session, currentPage, filters]);

  const fetchMatches = async () => {
    setIsLoading(true);
    try {
      const queryParams = new URLSearchParams({
        page: currentPage.toString(),
        limit: "12",
        ...(filters.matchType && { matchType: filters.matchType }),
        ...(filters.completed && { completed: filters.completed }),
      });

      const response = await api.get<{
        matches: Match[];
        stats: UserMatchStats;
        pagination: {
          page: number;
          totalPages: number;
        };
      }>(`/matches?${queryParams}`);

      setMatches(response.matches);
      setStats(response.stats);
      setTotalPages(response.pagination.totalPages);
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
    fetchMatches();
  };

  const handleClearFilters = () => {
    setFilters({
      matchType: "",
      completed: "",
    });
    setCurrentPage(1);
  };

  const handleDeleteMatch = async () => {
    if (!matchToDelete) return;

    setIsDeleting(true);
    try {
      await api.delete(`/matches/${matchToDelete.id}`);

      addToast({
        title: "¡Éxito!",
        description: "Partido eliminado correctamente",
        variant: "success",
      });

      setDeleteDialogOpen(false);
      setMatchToDelete(null);
      fetchMatches();
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

  if (status === "loading" || isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <p className="text-lg">Cargando...</p>
      </div>
    );
  }

  if (!session) {
    return null;
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-4">
            <div>
              <h1 className="text-2xl font-bold">Mis Partidos</h1>
              <p className="text-sm text-muted-foreground">
                Historial completo de tus partidos
              </p>
            </div>
            <div className="flex gap-2">
              <Link href="/matches/new">
                <Button>+ Registrar Partido</Button>
              </Link>
              <Link href="/dashboard">
                <Button variant="outline">Dashboard</Button>
              </Link>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Estadísticas */}
        {stats && (
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-sm font-medium text-muted-foreground">
                  Total Partidos
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-3xl font-bold">{stats.totalMatches}</p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-sm font-medium text-muted-foreground">
                  Completados
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-3xl font-bold">{stats.completedMatches}</p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-sm font-medium text-muted-foreground">
                  Victorias
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-3xl font-bold text-green-600">
                  {stats.wins}
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-sm font-medium text-muted-foreground">
                  Win Rate
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-3xl font-bold">
                  {stats.winRate.toFixed(1)}%
                </p>
              </CardContent>
            </Card>
          </div>
        )}

        {/* Estadísticas por tipo */}
        {stats && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-8">
            <Card>
              <CardHeader>
                <CardTitle className="text-base">Singles</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-3 gap-4 text-center">
                  <div>
                    <p className="text-2xl font-bold">
                      {stats.byType.SINGLES.total}
                    </p>
                    <p className="text-xs text-muted-foreground">Partidos</p>
                  </div>
                  <div>
                    <p className="text-2xl font-bold text-green-600">
                      {stats.byType.SINGLES.wins}
                    </p>
                    <p className="text-xs text-muted-foreground">Victorias</p>
                  </div>
                  <div>
                    <p className="text-2xl font-bold">
                      {stats.byType.SINGLES.winRate.toFixed(1)}%
                    </p>
                    <p className="text-xs text-muted-foreground">Win Rate</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="text-base">Doubles</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-3 gap-4 text-center">
                  <div>
                    <p className="text-2xl font-bold">
                      {stats.byType.DOUBLES.total}
                    </p>
                    <p className="text-xs text-muted-foreground">Partidos</p>
                  </div>
                  <div>
                    <p className="text-2xl font-bold text-green-600">
                      {stats.byType.DOUBLES.wins}
                    </p>
                    <p className="text-xs text-muted-foreground">Victorias</p>
                  </div>
                  <div>
                    <p className="text-2xl font-bold">
                      {stats.byType.DOUBLES.winRate.toFixed(1)}%
                    </p>
                    <p className="text-xs text-muted-foreground">Win Rate</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        )}

        {/* Filtros */}
        <Card className="mb-6">
          <CardHeader>
            <CardTitle className="text-base">Filtros</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
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

              <div className="space-y-2 flex items-end">
                <div className="flex gap-2 w-full">
                  <Button onClick={handleApplyFilters} className="flex-1">
                    Aplicar
                  </Button>
                  <Button
                    variant="outline"
                    onClick={handleClearFilters}
                    className="flex-1"
                  >
                    Limpiar
                  </Button>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Listado de partidos */}
        {matches.length === 0 ? (
          <Card>
            <CardContent className="text-center py-12">
              <p className="text-muted-foreground mb-4">
                No se encontraron partidos
              </p>
              <Link href="/matches/new">
                <Button>Registrar mi primer partido</Button>
              </Link>
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
                  showClubInfo={true}
                  showEventInfo={true}
                  canManage={match.creatorId === session.user.id}
                  onEdit={(match) => router.push(`/matches/${match.id}/edit`)}
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
              permanentemente.
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
