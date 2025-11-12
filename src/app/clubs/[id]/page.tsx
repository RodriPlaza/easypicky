"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useSession } from "next-auth/react";
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
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { useToast } from "@/components/ui/use-toast";
import { api, ApiError } from "@/lib/api";
import { EventForm } from "@/components/events/EventForm";
import { EventCard } from "@/components/events/EventCard";
import { MatchCard } from "@/components/matches/MatchCard";
import type { Club } from "@/types/club";
import type { Event } from "@/types/event";
import type { Court } from "@/types/court";
import type { Match } from "@/types/match";

interface ClubDetailPageProps {
  params: Promise<{
    id: string;
  }>;
}

type TabType = "info" | "events" | "matches";

export default function ClubDetailPage({ params }: ClubDetailPageProps) {
  const router = useRouter();
  const { data: session } = useSession();
  const { addToast } = useToast();

  const [clubId, setClubId] = useState<string | null>(null);
  const [club, setClub] = useState<Club | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);

  // Estados para tabs
  const [activeTab, setActiveTab] = useState<TabType>("info");

  // Estados para eventos
  const [events, setEvents] = useState<Event[]>([]);
  const [courts, setCourts] = useState<Court[]>([]);
  const [isLoadingEvents, setIsLoadingEvents] = useState(false);
  const [isLoadingCourts, setIsLoadingCourts] = useState(false);
  const [showCreateEventDialog, setShowCreateEventDialog] = useState(false);

  // Estados para partidos
  const [matches, setMatches] = useState<Match[]>([]);
  const [isLoadingMatches, setIsLoadingMatches] = useState(false);

  const isCreator = session?.user?.id === club?.creatorId;
  const isSuperAdmin = session?.user?.role === "SUPER_ADMIN";
  const canManage = isCreator || isSuperAdmin;

  useEffect(() => {
    // Resolver los params asíncronos
    params.then((resolvedParams) => {
      setClubId(resolvedParams.id);
    });
  }, [params]);

  useEffect(() => {
    if (clubId) {
      fetchClub();
    }
  }, [clubId]);

  useEffect(() => {
    if (clubId && activeTab === "events") {
      fetchEvents();
      if (canManage) {
        fetchCourts();
      }
    }
  }, [clubId, activeTab, canManage]);

  useEffect(() => {
    if (clubId && activeTab === "matches") {
      fetchMatches();
    }
  }, [clubId, activeTab]);

  const fetchClub = async () => {
    if (!clubId) return;

    setIsLoading(true);
    try {
      const response = await api.get<{ club: Club }>(`/clubs/${clubId}`, {
        requiresAuth: false,
      });
      setClub(response.club);
    } catch (error) {
      if (error instanceof ApiError) {
        addToast({
          title: "Error",
          description: error.message,
          variant: "destructive",
        });
        router.push("/clubs");
      }
    } finally {
      setIsLoading(false);
    }
  };

  const fetchEvents = async () => {
    if (!clubId) return;

    setIsLoadingEvents(true);
    try {
      const response = await api.get<{ events: Event[] }>(
        `/events?clubId=${clubId}&status=SCHEDULED`,
        { requiresAuth: false }
      );
      setEvents(response.events);
    } catch (error) {
      console.error("Error fetching events:", error);
      setEvents([]);
    } finally {
      setIsLoadingEvents(false);
    }
  };

  const fetchCourts = async () => {
    if (!clubId) return;

    setIsLoadingCourts(true);
    try {
      const response = await api.get<{ courts: Court[] }>(
        `/clubs/${clubId}/courts?isActive=true`
      );
      setCourts(response.courts);
    } catch (error) {
      console.error("Error fetching courts:", error);
      setCourts([]);
    } finally {
      setIsLoadingCourts(false);
    }
  };

  const fetchMatches = async () => {
    if (!clubId) return;

    setIsLoadingMatches(true);
    try {
      const response = await api.get<{ matches: Match[] }>(
        `/clubs/${clubId}/matches?limit=12&completed=true`
      );
      setMatches(response.matches);
    } catch (error) {
      console.error("Error fetching matches:", error);
      setMatches([]);
    } finally {
      setIsLoadingMatches(false);
    }
  };

  const handleDelete = async () => {
    if (!clubId) return;

    setIsDeleting(true);
    try {
      await api.delete(`/clubs/${clubId}`);

      addToast({
        title: "Club eliminado",
        description: "El club ha sido eliminado correctamente",
        variant: "success",
      });

      router.push("/clubs");
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
      setShowDeleteDialog(false);
    }
  };

  const handleEventCreated = () => {
    setShowCreateEventDialog(false);
    fetchEvents();
    // Actualizar contador de eventos del club
    fetchClub();
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

  // Contar partidos (esto lo tiene el club en _count si está disponible)
  const matchesCount = matches.length; // Temporal, idealmente viene del _count del club

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-4">
            <Link href="/dashboard">
              <h1 className="text-2xl font-bold cursor-pointer">EasyPicky</h1>
            </Link>
            <div className="flex gap-2">
              <Link href="/clubs">
                <Button variant="outline">Volver a Clubes</Button>
              </Link>
              {canManage && (
                <Link href={`/clubs/${club.id}/manage`}>
                  <Button>Gestionar Club</Button>
                </Link>
              )}
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Club Header */}
        <div className="bg-white rounded-lg shadow-sm p-8 mb-6">
          <div className="flex items-start justify-between mb-4">
            <div className="flex-1">
              <h2 className="text-4xl font-bold mb-2">{club.name}</h2>
              <p className="text-xl text-muted-foreground flex items-center gap-2">
                📍 {club.city}
              </p>
            </div>
            {club.logo && (
              <img
                src={club.logo}
                alt={`Logo de ${club.name}`}
                className="w-24 h-24 rounded-lg object-cover"
              />
            )}
          </div>

          {club.description && (
            <p className="text-muted-foreground mb-6">{club.description}</p>
          )}

          <div className="flex gap-2 flex-wrap mb-6">
            {club._count && (
              <>
                <Badge variant="secondary">
                  👥 {club._count.memberships} miembros
                </Badge>
                <Badge variant="secondary">
                  🎾 {club._count.courts} pistas
                </Badge>
                <Badge variant="secondary">
                  📅 {club._count.events} eventos
                </Badge>
              </>
            )}
          </div>

          {canManage && (
            <div className="flex gap-2 flex-wrap">
              <Link href={`/clubs/${club.id}/edit`}>
                <Button variant="outline">Editar Información</Button>
              </Link>
              <Link href={`/clubs/${club.id}/courts`}>
                <Button variant="outline">Gestionar Pistas</Button>
              </Link>
              <Link href={`/clubs/${club.id}/members`}>
                <Button variant="outline">Gestionar Miembros</Button>
              </Link>
              <Button
                variant="destructive"
                onClick={() => setShowDeleteDialog(true)}
              >
                Eliminar Club
              </Button>
            </div>
          )}
        </div>

        {/* Tabs */}
        <div className="flex gap-2 mb-6">
          <Button
            variant={activeTab === "info" ? "default" : "outline"}
            onClick={() => setActiveTab("info")}
          >
            Información
          </Button>
          <Button
            variant={activeTab === "events" ? "default" : "outline"}
            onClick={() => setActiveTab("events")}
          >
            Eventos ({club._count?.events || 0})
          </Button>
          <Button
            variant={activeTab === "matches" ? "default" : "outline"}
            onClick={() => setActiveTab("matches")}
          >
            Partidos ({matchesCount})
          </Button>
        </div>

        {/* Tab Content: Info */}
        {activeTab === "info" && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Contact Information */}
            <Card>
              <CardHeader>
                <CardTitle>Información de Contacto</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div>
                  <p className="text-sm font-medium text-muted-foreground">
                    Dirección
                  </p>
                  <p>{club.address}</p>
                </div>
                {club.phone && (
                  <div>
                    <p className="text-sm font-medium text-muted-foreground">
                      Teléfono
                    </p>
                    <p>{club.phone}</p>
                  </div>
                )}
                {club.email && (
                  <div>
                    <p className="text-sm font-medium text-muted-foreground">
                      Email
                    </p>
                    <a
                      href={`mailto:${club.email}`}
                      className="text-primary hover:underline"
                    >
                      {club.email}
                    </a>
                  </div>
                )}
                {club.website && (
                  <div>
                    <p className="text-sm font-medium text-muted-foreground">
                      Sitio Web
                    </p>
                    <a
                      href={club.website}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-primary hover:underline"
                    >
                      {club.website}
                    </a>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Creator Information */}
            {club.creator && (
              <Card>
                <CardHeader>
                  <CardTitle>Información del Creador</CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  <div>
                    <p className="text-sm font-medium text-muted-foreground">
                      Nombre
                    </p>
                    <p>{club.creator.name}</p>
                  </div>
                  <div>
                    <p className="text-sm font-medium text-muted-foreground">
                      Email
                    </p>
                    <p>{club.creator.email}</p>
                  </div>
                  <div>
                    <p className="text-sm font-medium text-muted-foreground">
                      Fecha de Creación
                    </p>
                    <p>
                      {new Date(club.createdAt).toLocaleDateString("es-ES")}
                    </p>
                  </div>
                </CardContent>
              </Card>
            )}
          </div>
        )}

        {/* Tab Content: Events */}
        {activeTab === "events" && (
          <div>
            {/* Header de eventos con botón crear */}
            <div className="flex justify-between items-center mb-6">
              <div>
                <h3 className="text-2xl font-bold">Eventos Programados</h3>
                <p className="text-muted-foreground">
                  Próximas clases, torneos y quedadas
                </p>
              </div>
              {canManage && (
                <Button onClick={() => setShowCreateEventDialog(true)}>
                  + Crear Evento
                </Button>
              )}
            </div>

            {/* Loading */}
            {isLoadingEvents && (
              <div className="text-center py-12">
                <p className="text-muted-foreground">Cargando eventos...</p>
              </div>
            )}

            {/* Lista de eventos */}
            {!isLoadingEvents && events.length > 0 && (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {events.map((event) => (
                  <EventCard
                    key={event.id}
                    event={event}
                    showClubInfo={false}
                    onJoinChange={fetchEvents}
                  />
                ))}
              </div>
            )}

            {/* Empty state */}
            {!isLoadingEvents && events.length === 0 && (
              <Card>
                <CardContent className="pt-6 text-center">
                  <p className="text-muted-foreground mb-4">
                    {canManage
                      ? "Aún no has creado eventos para este club"
                      : "Este club no tiene eventos programados"}
                  </p>
                  {canManage && (
                    <Button onClick={() => setShowCreateEventDialog(true)}>
                      Crear Primer Evento
                    </Button>
                  )}
                </CardContent>
              </Card>
            )}
          </div>
        )}

        {/* Tab Content: Matches */}
        {activeTab === "matches" && (
          <div>
            {/* Header de partidos */}
            <div className="flex justify-between items-center mb-6">
              <div>
                <h3 className="text-2xl font-bold">Partidos del Club</h3>
                <p className="text-muted-foreground">
                  Partidos completados recientes
                </p>
              </div>
              <Link href={`/clubs/${club.id}/matches`}>
                <Button variant="outline">Ver Todos</Button>
              </Link>
            </div>

            {/* Loading */}
            {isLoadingMatches && (
              <div className="text-center py-12">
                <p className="text-muted-foreground">Cargando partidos...</p>
              </div>
            )}

            {/* Lista de partidos */}
            {!isLoadingMatches && matches.length > 0 && (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {matches.map((match) => (
                  <MatchCard
                    key={match.id}
                    match={match}
                    showClubInfo={false}
                    showEventInfo={true}
                    clubId={club.id}
                  />
                ))}
              </div>
            )}

            {/* Empty state */}
            {!isLoadingMatches && matches.length === 0 && (
              <Card>
                <CardContent className="pt-6 text-center">
                  <p className="text-muted-foreground mb-4">
                    {canManage
                      ? "Aún no se han registrado partidos en este club"
                      : "Este club no tiene partidos registrados"}
                  </p>
                  {canManage && (
                    <Link href={`/clubs/${club.id}/matches/new`}>
                      <Button>Registrar Primer Partido</Button>
                    </Link>
                  )}
                </CardContent>
              </Card>
            )}

            {/* Link a página completa */}
            {!isLoadingMatches && matches.length > 0 && (
              <div className="text-center mt-6">
                <Link href={`/clubs/${club.id}/matches`}>
                  <Button variant="outline">
                    Ver todos los partidos del club →
                  </Button>
                </Link>
              </div>
            )}
          </div>
        )}
      </main>

      {/* Delete Confirmation Dialog */}
      <Dialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>¿Eliminar Club?</DialogTitle>
            <DialogDescription>
              Esta acción no se puede deshacer. Se eliminarán todos los datos
              asociados: miembros, eventos, pistas y suscripciones.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setShowDeleteDialog(false)}
              disabled={isDeleting}
            >
              Cancelar
            </Button>
            <Button
              variant="destructive"
              onClick={handleDelete}
              disabled={isDeleting}
            >
              {isDeleting ? "Eliminando..." : "Eliminar Club"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Create Event Dialog */}
      <Dialog
        open={showCreateEventDialog}
        onOpenChange={setShowCreateEventDialog}
      >
        <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Crear Evento</DialogTitle>
            <DialogDescription>
              Organiza una clase, torneo o quedada en {club.name}
            </DialogDescription>
          </DialogHeader>
          <div className="py-4">
            {isLoadingCourts ? (
              <div className="text-center py-8">
                <p className="text-muted-foreground">Cargando pistas...</p>
              </div>
            ) : (
              <EventForm
                mode="create"
                clubId={club.id}
                courts={courts}
                onSuccess={handleEventCreated}
              />
            )}
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
