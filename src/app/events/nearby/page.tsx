"use client";

import { useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { useSession } from "next-auth/react";
import { Button } from "@/components/ui/button";
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
import { NearbyEventsResponse, EventType } from "@/types/event";

export default function NearbyEventsPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { data: session, status } = useSession();

  const [events, setEvents] = useState<NearbyEventsResponse | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Filtros
  const [type, setType] = useState<EventType | "">(
    (searchParams.get("type") as EventType) || ""
  );
  const [daysAhead, setDaysAhead] = useState(
    searchParams.get("daysAhead") || "7"
  );
  const [openOnly, setOpenOnly] = useState(
    searchParams.get("openOnly") === "true"
  );

  const page = parseInt(searchParams.get("page") || "1");

  // Redireccionar si no hay sesión
  useEffect(() => {
    if (status === "unauthenticated") {
      router.push("/auth/signin");
    }
  }, [status, router]);

  // Cargar eventos cercanos
  const fetchNearbyEvents = async () => {
    if (!session?.user) return;

    setIsLoading(true);
    setError(null);

    try {
      const userProfile = await api.get<{ user: { city?: string } }>(
        "/users/profile"
      );

      if (!userProfile.user.city) {
        setError(
          "No tienes una ciudad configurada en tu perfil. Por favor actualiza tu información."
        );
        setIsLoading(false);
        return;
      }

      const params = new URLSearchParams();
      params.append("city", userProfile.user.city);
      params.append("page", page.toString());
      params.append("limit", "12");
      params.append("daysAhead", daysAhead);
      if (type) params.append("type", type);
      if (openOnly) params.append("openOnly", "true");

      const data = await api.get<NearbyEventsResponse>(
        `/events/nearby?${params.toString()}`
      );
      setEvents(data);
    } catch (err) {
      console.error("Error fetching nearby events:", err);
      if (err instanceof ApiError) {
        setError(err.message);
      } else {
        setError("Error al cargar los eventos cercanos");
      }
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (session?.user) {
      fetchNearbyEvents();
    }
  }, [page, searchParams, session]);

  if (status === "loading") {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <p className="text-lg">Cargando...</p>
      </div>
    );
  }

  if (!session) {
    return null;
  }

  // Aplicar filtros
  const handleApplyFilters = () => {
    const params = new URLSearchParams();
    params.append("page", "1");
    params.append("daysAhead", daysAhead);
    if (type) params.append("type", type);
    if (openOnly) params.append("openOnly", "true");

    router.push(`/events/nearby?${params.toString()}`);
  };

  // Limpiar filtros
  const handleClearFilters = () => {
    setType("");
    setDaysAhead("7");
    setOpenOnly(false);
    router.push("/events/nearby");
  };

  // Cambiar página
  const handlePageChange = (newPage: number) => {
    const params = new URLSearchParams(searchParams.toString());
    params.set("page", newPage.toString());
    router.push(`/events/nearby?${params.toString()}`);
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-4">
            <div>
              <h1 className="text-2xl font-bold">Eventos Cercanos</h1>
              <p className="text-sm text-muted-foreground">
                {events?.city
                  ? `Eventos en ${events.city}`
                  : "Eventos en tu ciudad"}
              </p>
            </div>
            <div className="flex gap-2">
              <Button variant="outline" onClick={() => router.push("/events")}>
                Todos los Eventos
              </Button>
              <Button
                variant="outline"
                onClick={() => router.push("/my-events")}
              >
                Mis Eventos
              </Button>
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
            <CardDescription>
              Personaliza tu búsqueda de eventos cercanos
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {/* Tipo */}
              <div className="space-y-2">
                <Label htmlFor="type">Tipo de evento</Label>
                <select
                  id="type"
                  value={type}
                  onChange={(e) => setType(e.target.value as EventType | "")}
                  className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                >
                  <option value="">Todos</option>
                  <option value="CLASS">Clases</option>
                  <option value="TOURNAMENT">Torneos</option>
                  <option value="MEETUP">Quedadas</option>
                </select>
              </div>

              {/* Días adelante */}
              <div className="space-y-2">
                <Label htmlFor="daysAhead">Próximos días</Label>
                <select
                  id="daysAhead"
                  value={daysAhead}
                  onChange={(e) => setDaysAhead(e.target.value)}
                  className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                >
                  <option value="1">Hoy</option>
                  <option value="3">3 días</option>
                  <option value="7">7 días</option>
                  <option value="14">14 días</option>
                  <option value="30">30 días</option>
                </select>
              </div>

              {/* Solo abiertos */}
              <div className="space-y-2">
                <Label htmlFor="openOnly">Visibilidad</Label>
                <div className="flex items-center h-10">
                  <input
                    type="checkbox"
                    id="openOnly"
                    checked={openOnly}
                    onChange={(e) => setOpenOnly(e.target.checked)}
                    className="mr-2"
                  />
                  <label htmlFor="openOnly" className="text-sm">
                    Solo eventos abiertos a todos
                  </label>
                </div>
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
            <p className="text-muted-foreground">
              Buscando eventos cercanos...
            </p>
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
                Encontrados {events.pagination.totalCount} eventos en{" "}
                {events.city}
              </p>
            </div>

            {/* Grid de eventos */}
            {events.events.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
                {events.events.map((event) => (
                  <EventCard
                    key={event.id}
                    event={event}
                    onJoinChange={fetchNearbyEvents}
                  />
                ))}
              </div>
            ) : (
              <Card>
                <CardContent className="pt-6 text-center">
                  <p className="text-muted-foreground mb-4">
                    No se encontraron eventos cercanos en los próximos{" "}
                    {daysAhead} días
                  </p>
                  <Button variant="outline" onClick={handleClearFilters}>
                    Ver Todos los Eventos
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
