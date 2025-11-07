"use client";

import { useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { useSession } from "next-auth/react";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { EventCard } from "@/components/events/EventCard";
import { api, ApiError } from "@/lib/api";
import { EventsResponse } from "@/types/event";

type TabType = "upcoming" | "past" | "all";

export default function MyEventsPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { data: session, status } = useSession();

  const [events, setEvents] = useState<EventsResponse | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const tab = (searchParams.get("tab") as TabType) || "upcoming";
  const page = parseInt(searchParams.get("page") || "1");

  // Redireccionar si no hay sesión
  useEffect(() => {
    if (status === "unauthenticated") {
      router.push("/auth/signin");
    }
  }, [status, router]);

  // Cargar eventos del usuario
  const fetchMyEvents = async () => {
    if (!session?.user) return;

    setIsLoading(true);
    setError(null);

    try {
      const params = new URLSearchParams();
      params.append("page", page.toString());
      params.append("limit", "12");
      params.append("userId", session.user.id);

      // Filtrar por fechas según el tab
      const now = new Date().toISOString();
      if (tab === "upcoming") {
        params.append("startDate", now);
        params.append("status", "SCHEDULED");
      } else if (tab === "past") {
        params.append("endDate", now);
      }

      const data = await api.get<EventsResponse>(
        `/events?${params.toString()}`
      );
      setEvents(data);
    } catch (err) {
      console.error("Error fetching my events:", err);
      if (err instanceof ApiError) {
        setError(err.message);
      } else {
        setError("Error al cargar tus eventos");
      }
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (session?.user) {
      fetchMyEvents();
    }
  }, [page, tab, session]);

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

  // Cambiar tab
  const handleTabChange = (newTab: TabType) => {
    router.push(`/my-events?tab=${newTab}`);
  };

  // Cambiar página
  const handlePageChange = (newPage: number) => {
    const params = new URLSearchParams(searchParams.toString());
    params.set("page", newPage.toString());
    router.push(`/my-events?${params.toString()}`);
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-4">
            <div>
              <h1 className="text-2xl font-bold">Mis Eventos</h1>
              <p className="text-sm text-muted-foreground">
                Eventos en los que estás inscrito
              </p>
            </div>
            <div className="flex gap-2">
              <Button
                variant="outline"
                onClick={() => router.push("/events/nearby")}
              >
                Eventos Cercanos
              </Button>
              <Button onClick={() => router.push("/dashboard")}>
                Dashboard
              </Button>
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Tabs */}
        <div className="flex gap-2 mb-6">
          <Button
            variant={tab === "upcoming" ? "default" : "outline"}
            onClick={() => handleTabChange("upcoming")}
          >
            Próximos
          </Button>
          <Button
            variant={tab === "past" ? "default" : "outline"}
            onClick={() => handleTabChange("past")}
          >
            Pasados
          </Button>
          <Button
            variant={tab === "all" ? "default" : "outline"}
            onClick={() => handleTabChange("all")}
          >
            Todos
          </Button>
        </div>

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
                {events.pagination.totalCount}{" "}
                {tab === "upcoming"
                  ? "eventos próximos"
                  : tab === "past"
                  ? "eventos pasados"
                  : "eventos totales"}
              </p>
            </div>

            {/* Grid de eventos */}
            {events.events.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
                {events.events.map((event) => (
                  <EventCard
                    key={event.id}
                    event={event}
                    onJoinChange={fetchMyEvents}
                  />
                ))}
              </div>
            ) : (
              <Card>
                <CardContent className="pt-6 text-center">
                  <p className="text-muted-foreground mb-4">
                    {tab === "upcoming"
                      ? "No tienes eventos próximos"
                      : tab === "past"
                      ? "No has participado en eventos pasados"
                      : "No estás inscrito en ningún evento"}
                  </p>
                  <Button
                    variant="outline"
                    onClick={() => router.push("/events/nearby")}
                  >
                    Buscar Eventos
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
