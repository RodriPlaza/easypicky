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
import { EventCard } from "@/components/events/EventCard";
import { api, ApiError } from "@/lib/api";
import { EventsResponse, EventType, EventStatus } from "@/types/event";
import { useSession } from "next-auth/react";

export default function EventsPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { data: session } = useSession();

  const [events, setEvents] = useState<EventsResponse | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Filtros
  const [search, setSearch] = useState(searchParams.get("search") || "");
  const [city, setCity] = useState(searchParams.get("city") || "");
  const [type, setType] = useState<EventType | "">(
    (searchParams.get("type") as EventType) || ""
  );
  const [status, setStatus] = useState<EventStatus | "">(
    (searchParams.get("status") as EventStatus) || ""
  );

  const page = parseInt(searchParams.get("page") || "1");

  // Cargar eventos
  const fetchEvents = async () => {
    setIsLoading(true);
    setError(null);

    try {
      const params = new URLSearchParams();
      params.append("page", page.toString());
      params.append("limit", "12");

      if (search) params.append("search", search);
      if (city) params.append("city", city);
      if (type) params.append("type", type);
      if (status) params.append("status", status);

      const data = await api.get<EventsResponse>(
        `/events?${params.toString()}`
      );
      setEvents(data);
    } catch (err) {
      console.error("Error fetching events:", err);
      if (err instanceof ApiError) {
        setError(err.message);
      } else {
        setError("Error al cargar los eventos");
      }
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchEvents();
  }, [page, searchParams]);

  // Aplicar filtros
  const handleApplyFilters = () => {
    const params = new URLSearchParams();
    params.append("page", "1");
    if (search) params.append("search", search);
    if (city) params.append("city", city);
    if (type) params.append("type", type);
    if (status) params.append("status", status);

    router.push(`/events?${params.toString()}`);
  };

  // Limpiar filtros
  const handleClearFilters = () => {
    setSearch("");
    setCity("");
    setType("");
    setStatus("");
    router.push("/events");
  };

  // Cambiar página
  const handlePageChange = (newPage: number) => {
    const params = new URLSearchParams(searchParams.toString());
    params.set("page", newPage.toString());
    router.push(`/events?${params.toString()}`);
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-4">
            <div>
              <h1 className="text-2xl font-bold">Eventos</h1>
              <p className="text-sm text-muted-foreground">
                Encuentra clases, torneos y quedadas cerca de ti
              </p>
            </div>
            <div className="flex gap-2">
              <Button
                variant="outline"
                onClick={() => router.push("/events/nearby")}
              >
                Eventos Cercanos
              </Button>
              {session && (
                <Button
                  variant="outline"
                  onClick={() => router.push("/my-events")}
                >
                  Mis Eventos
                </Button>
              )}
              <Button onClick={() => router.push("/dashboard")}>
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
            <CardDescription>Refina tu búsqueda de eventos</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              {/* Búsqueda */}
              <div className="space-y-2">
                <Label htmlFor="search">Buscar</Label>
                <Input
                  id="search"
                  placeholder="Título del evento..."
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === "Enter") handleApplyFilters();
                  }}
                />
              </div>

              {/* Ciudad */}
              <div className="space-y-2">
                <Label htmlFor="city">Ciudad</Label>
                <Input
                  id="city"
                  placeholder="Madrid, Barcelona..."
                  value={city}
                  onChange={(e) => setCity(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === "Enter") handleApplyFilters();
                  }}
                />
              </div>

              {/* Tipo */}
              <div className="space-y-2">
                <Label htmlFor="type">Tipo</Label>
                <select
                  id="type"
                  value={type}
                  onChange={(e) => setType(e.target.value as EventType | "")}
                  className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                >
                  <option value="">Todos</option>
                  <option value="CLASS">Clase</option>
                  <option value="TOURNAMENT">Torneo</option>
                  <option value="MEETUP">Quedada</option>
                </select>
              </div>

              {/* Estado */}
              <div className="space-y-2">
                <Label htmlFor="status">Estado</Label>
                <select
                  id="status"
                  value={status}
                  onChange={(e) =>
                    setStatus(e.target.value as EventStatus | "")
                  }
                  className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                >
                  <option value="">Todos</option>
                  <option value="SCHEDULED">Programado</option>
                  <option value="ONGOING">En curso</option>
                  <option value="COMPLETED">Finalizado</option>
                </select>
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
            <p className="text-muted-foreground">Cargando eventos...</p>
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
        {!isLoading && !error && events && (
          <>
            {/* Contador */}
            <div className="mb-4">
              <p className="text-sm text-muted-foreground">
                Mostrando {events.events.length} de{" "}
                {events.pagination.totalCount} eventos
              </p>
            </div>

            {/* Grid de eventos */}
            {events.events.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
                {events.events.map((event) => (
                  <EventCard
                    key={event.id}
                    event={event}
                    onJoinChange={fetchEvents}
                  />
                ))}
              </div>
            ) : (
              <Card>
                <CardContent className="pt-6 text-center">
                  <p className="text-muted-foreground mb-4">
                    No se encontraron eventos con los filtros aplicados
                  </p>
                  <Button variant="outline" onClick={handleClearFilters}>
                    Limpiar Filtros
                  </Button>
                </CardContent>
              </Card>
            )}

            {/* Paginación */}
            {events.pagination.totalPages > 1 && (
              <div className="flex justify-center gap-2">
                <Button
                  variant="outline"
                  onClick={() => handlePageChange(page - 1)}
                  disabled={!events.pagination.hasPreviousPage}
                >
                  Anterior
                </Button>
                <span className="flex items-center px-4">
                  Página {page} de {events.pagination.totalPages}
                </span>
                <Button
                  variant="outline"
                  onClick={() => handlePageChange(page + 1)}
                  disabled={!events.pagination.hasNextPage}
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
