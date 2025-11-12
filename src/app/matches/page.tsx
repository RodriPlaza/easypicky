"use client";

import { useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { MatchCard } from "@/components/matches/MatchCard";
import { api, ApiError } from "@/lib/api";
import { MatchesResponse } from "@/types/match";
import { MatchType } from "@prisma/client";
import { useSession } from "next-auth/react";

export default function MatchesPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { data: session } = useSession();

  const [matches, setMatches] = useState<MatchesResponse | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Filtros
  const [matchType, setMatchType] = useState<MatchType | "">(
    (searchParams.get("matchType") as MatchType) || ""
  );
  const [completed, setCompleted] = useState<string>(
    searchParams.get("completed") || ""
  );
  const [courtId, setCourtId] = useState(searchParams.get("courtId") || "");
  const [eventId, setEventId] = useState(searchParams.get("eventId") || "");

  const page = parseInt(searchParams.get("page") || "1");

  // Cargar partidos
  const fetchMatches = async () => {
    setIsLoading(true);
    setError(null);

    try {
      const params = new URLSearchParams();
      params.append("page", page.toString());
      params.append("limit", "12");

      if (matchType) params.append("matchType", matchType);
      if (completed) params.append("completed", completed);
      if (courtId) params.append("courtId", courtId);
      if (eventId) params.append("eventId", eventId);

      const data = await api.get<MatchesResponse>(
        `/matches?${params.toString()}`
      );
      setMatches(data);
    } catch (err) {
      console.error("Error fetching matches:", err);
      if (err instanceof ApiError) {
        setError(err.message);
      } else {
        setError("Error al cargar los partidos");
      }
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchMatches();
  }, [page, searchParams]);

  // Aplicar filtros
  const handleApplyFilters = () => {
    const params = new URLSearchParams();
    params.append("page", "1");
    if (matchType) params.append("matchType", matchType);
    if (completed) params.append("completed", completed);
    if (courtId) params.append("courtId", courtId);
    if (eventId) params.append("eventId", eventId);

    router.push(`/matches?${params.toString()}`);
  };

  // Limpiar filtros
  const handleClearFilters = () => {
    setMatchType("");
    setCompleted("");
    setCourtId("");
    setEventId("");
    router.push("/matches");
  };

  // Cambiar página
  const handlePageChange = (newPage: number) => {
    const params = new URLSearchParams(searchParams.toString());
    params.set("page", newPage.toString());
    router.push(`/matches?${params.toString()}`);
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-4">
            <div>
              <h1 className="text-2xl font-bold">Partidos</h1>
              <p className="text-sm text-muted-foreground">
                Explora partidos de pickleball de la comunidad
              </p>
            </div>
            <div className="flex gap-2">
              {session && (
                <>
                  <Button
                    variant="outline"
                    onClick={() => router.push("/my-matches")}
                  >
                    Mis Partidos
                  </Button>
                  <Button onClick={() => router.push("/matches/new")}>
                    + Registrar Partido
                  </Button>
                </>
              )}
              <Button
                variant="outline"
                onClick={() => router.push("/dashboard")}
              >
                Dashboard
              </Button>
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Filtros */}
        <Card className="mb-6">
          <CardHeader>
            <CardTitle>Filtros</CardTitle>
            <CardDescription>Refina tu búsqueda de partidos</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              {/* Tipo de Partido */}
              <div className="space-y-2">
                <Label htmlFor="matchType">Tipo de Partido</Label>
                <select
                  id="matchType"
                  value={matchType}
                  onChange={(e) =>
                    setMatchType(e.target.value as MatchType | "")
                  }
                  className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                >
                  <option value="">Todos</option>
                  <option value="SINGLES">Singles (1vs1)</option>
                  <option value="DOUBLES">Doubles (2vs2)</option>
                </select>
              </div>

              {/* Estado */}
              <div className="space-y-2">
                <Label htmlFor="completed">Estado</Label>
                <select
                  id="completed"
                  value={completed}
                  onChange={(e) => setCompleted(e.target.value)}
                  className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                >
                  <option value="">Todos</option>
                  <option value="true">Completados</option>
                  <option value="false">En progreso</option>
                </select>
              </div>

              {/* Pista ID */}
              <div className="space-y-2">
                <Label htmlFor="courtId">Pista (ID)</Label>
                <Input
                  id="courtId"
                  placeholder="ID de pista..."
                  value={courtId}
                  onChange={(e) => setCourtId(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === "Enter") handleApplyFilters();
                  }}
                />
              </div>

              {/* Evento ID */}
              <div className="space-y-2">
                <Label htmlFor="eventId">Evento (ID)</Label>
                <Input
                  id="eventId"
                  placeholder="ID de evento..."
                  value={eventId}
                  onChange={(e) => setEventId(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === "Enter") handleApplyFilters();
                  }}
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

        {/* Loading */}
        {isLoading && (
          <div className="text-center py-12">
            <p className="text-muted-foreground">Cargando partidos...</p>
          </div>
        )}

        {/* Error */}
        {error && (
          <Card className="border-red-200 bg-red-50">
            <CardContent className="pt-6">
              <p className="text-red-600">{error}</p>
            </CardContent>
          </Card>
        )}

        {/* Resultados */}
        {!isLoading && !error && matches && (
          <>
            {/* Contador */}
            <div className="mb-4">
              <p className="text-sm text-muted-foreground">
                Mostrando {matches.matches.length} de{" "}
                {matches.pagination.totalCount} partidos
              </p>
            </div>

            {/* Grid de partidos */}
            {matches.matches.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
                {matches.matches.map((match) => (
                  <MatchCard
                    key={match.id}
                    match={match}
                    showClubInfo={true}
                    showEventInfo={true}
                  />
                ))}
              </div>
            ) : (
              <Card>
                <CardContent className="pt-6 text-center">
                  <p className="text-muted-foreground mb-4">
                    No se encontraron partidos con los filtros aplicados
                  </p>
                  <Button variant="outline" onClick={handleClearFilters}>
                    Limpiar Filtros
                  </Button>
                </CardContent>
              </Card>
            )}

            {/* Paginación */}
            {matches.pagination.totalPages > 1 && (
              <div className="flex justify-center gap-2">
                <Button
                  variant="outline"
                  onClick={() => handlePageChange(page - 1)}
                  disabled={!matches.pagination.hasPreviousPage}
                >
                  Anterior
                </Button>
                <span className="flex items-center px-4">
                  Página {page} de {matches.pagination.totalPages}
                </span>
                <Button
                  variant="outline"
                  onClick={() => handlePageChange(page + 1)}
                  disabled={!matches.pagination.hasNextPage}
                >
                  Siguiente
                </Button>
              </div>
            )}
          </>
        )}
      </main>
    </div>
  );
}
