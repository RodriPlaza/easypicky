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
import type { Event } from "@/types/event";

interface EventDetailPageProps {
  params: Promise<{
    id: string;
  }>;
}

export default function EventDetailPage({ params }: EventDetailPageProps) {
  const router = useRouter();
  const { data: session } = useSession();
  const { addToast } = useToast();

  const [eventId, setEventId] = useState<string | null>(null);
  const [event, setEvent] = useState<
    | (Event & {
        isParticipant?: boolean;
        isCheckedIn?: boolean;
        canCheckIn?: boolean;
      })
    | null
  >(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isActionLoading, setIsActionLoading] = useState(false);
  const [showCancelDialog, setShowCancelDialog] = useState(false);

  // Permisos
  const isClubCreator = session?.user?.id === event?.club?.creatorId;
  const isSuperAdmin = session?.user?.role === "SUPER_ADMIN";
  const canManage = isClubCreator || isSuperAdmin;

  useEffect(() => {
    params.then((resolvedParams) => {
      setEventId(resolvedParams.id);
    });
  }, [params]);

  useEffect(() => {
    if (eventId) {
      fetchEvent();
    }
  }, [eventId]);

  const fetchEvent = async () => {
    if (!eventId) return;

    setIsLoading(true);
    try {
      const response = await api.get<{
        event: Event & {
          isParticipant?: boolean;
          isCheckedIn?: boolean;
          canCheckIn?: boolean;
        };
      }>(`/events/${eventId}`, { requiresAuth: false });
      setEvent(response.event);
    } catch (error) {
      if (error instanceof ApiError) {
        addToast({
          title: "Error",
          description: error.message,
          variant: "destructive",
        });
        router.push("/events");
      }
    } finally {
      setIsLoading(false);
    }
  };

  const handleJoin = async () => {
    if (!eventId) return;

    setIsActionLoading(true);
    try {
      await api.post(`/events/${eventId}/join`, {});

      addToast({
        title: "¡Inscrito!",
        description: "Te has inscrito correctamente al evento.",
        variant: "success",
      });

      fetchEvent();
    } catch (error) {
      if (error instanceof ApiError) {
        addToast({
          title: "Error",
          description: error.message,
          variant: "destructive",
        });
      }
    } finally {
      setIsActionLoading(false);
    }
  };

  const handleLeave = async () => {
    if (!eventId) return;

    setIsActionLoading(true);
    try {
      await api.delete(`/events/${eventId}/join`, {});

      addToast({
        title: "Inscripción cancelada",
        description: "Has cancelado tu inscripción al evento.",
        variant: "success",
      });

      setShowCancelDialog(false);
      fetchEvent();
    } catch (error) {
      if (error instanceof ApiError) {
        addToast({
          title: "Error",
          description: error.message,
          variant: "destructive",
        });
      }
    } finally {
      setIsActionLoading(false);
    }
  };

  const handleCheckIn = async () => {
    if (!eventId) return;

    setIsActionLoading(true);
    try {
      await api.post(`/events/${eventId}/checkin`, {});

      addToast({
        title: "¡Check-in realizado!",
        description: "Has hecho check-in correctamente.",
        variant: "success",
      });

      fetchEvent();
    } catch (error) {
      if (error instanceof ApiError) {
        addToast({
          title: "Error",
          description: error.message,
          variant: "destructive",
        });
      }
    } finally {
      setIsActionLoading(false);
    }
  };

  // Badges helpers
  const getTypeBadge = () => {
    if (!event) return null;
    const variants = {
      CLASS: "default" as const,
      TOURNAMENT: "destructive" as const,
      MEETUP: "secondary" as const,
    };

    const labels = {
      CLASS: "Clase",
      TOURNAMENT: "Torneo",
      MEETUP: "Quedada",
    };

    return <Badge variant={variants[event.type]}>{labels[event.type]}</Badge>;
  };

  const getVisibilityBadge = () => {
    if (!event) return null;
    const variants = {
      OPEN: "success" as const,
      MEMBERS_ONLY: "warning" as const,
      PRIVATE: "outline" as const,
    };

    const labels = {
      OPEN: "Abierto",
      MEMBERS_ONLY: "Solo miembros",
      PRIVATE: "Privado",
    };

    return (
      <Badge variant={variants[event.visibility]}>
        {labels[event.visibility]}
      </Badge>
    );
  };

  const getStatusBadge = () => {
    if (!event) return null;
    const variants = {
      SCHEDULED: "info" as const,
      ONGOING: "warning" as const,
      COMPLETED: "secondary" as const,
      CANCELLED: "destructive" as const,
    };

    const labels = {
      SCHEDULED: "Programado",
      ONGOING: "En curso",
      COMPLETED: "Finalizado",
      CANCELLED: "Cancelado",
    };

    return (
      <Badge variant={variants[event.status]}>{labels[event.status]}</Badge>
    );
  };

  const formatDateTime = (date: string | Date) => {
    return new Date(date).toLocaleDateString("es-ES", {
      weekday: "long",
      day: "numeric",
      month: "long",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <p className="text-lg">Cargando evento...</p>
      </div>
    );
  }

  if (!event) {
    return null;
  }

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
              <Link href="/events">
                <Button variant="outline">Volver a Eventos</Button>
              </Link>
              {canManage && (
                <Link href={`/events/${event.id}/manage`}>
                  <Button>Gestionar Evento</Button>
                </Link>
              )}
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Event Header */}
        <div className="bg-white rounded-lg shadow-sm p-8 mb-6">
          <div className="flex flex-wrap gap-2 mb-4">
            {getTypeBadge()}
            {getVisibilityBadge()}
            {getStatusBadge()}
            {event.isParticipant && <Badge variant="success">Inscrito</Badge>}
            {event.isCheckedIn && (
              <Badge variant="info">Check-in realizado</Badge>
            )}
          </div>

          <h2 className="text-4xl font-bold mb-4">{event.title}</h2>

          {event.description && (
            <p className="text-lg text-muted-foreground mb-6 whitespace-pre-wrap">
              {event.description}
            </p>
          )}

          {/* Action Buttons */}
          {session && event.status === "SCHEDULED" && (
            <div className="flex gap-2 flex-wrap">
              {event.isParticipant ? (
                <>
                  {event.canCheckIn && !event.isCheckedIn && (
                    <Button onClick={handleCheckIn} disabled={isActionLoading}>
                      {isActionLoading ? "Procesando..." : "Hacer Check-in"}
                    </Button>
                  )}
                  <Button
                    variant="destructive"
                    onClick={() => setShowCancelDialog(true)}
                    disabled={isActionLoading}
                  >
                    Cancelar Inscripción
                  </Button>
                </>
              ) : (
                <Button
                  onClick={handleJoin}
                  disabled={isActionLoading}
                  size="lg"
                >
                  {isActionLoading
                    ? "Inscribiendo..."
                    : "Inscribirse al Evento"}
                </Button>
              )}

              {canManage && (
                <Link href={`/events/${event.id}/participants`}>
                  <Button variant="outline">
                    Ver Participantes ({event._count?.participants || 0})
                  </Button>
                </Link>
              )}
            </div>
          )}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Event Details */}
          <div className="lg:col-span-2 space-y-6">
            {/* Date & Time */}
            <Card>
              <CardHeader>
                <CardTitle>Fecha y Hora</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div>
                  <p className="text-sm font-medium text-muted-foreground">
                    Inicio
                  </p>
                  <p className="text-lg capitalize">
                    {formatDateTime(event.startDateTime)}
                  </p>
                </div>
                <div>
                  <p className="text-sm font-medium text-muted-foreground">
                    Fin
                  </p>
                  <p className="text-lg capitalize">
                    {formatDateTime(event.endDateTime)}
                  </p>
                </div>
                <div>
                  <p className="text-sm font-medium text-muted-foreground">
                    Duración
                  </p>
                  <p className="text-lg">
                    {Math.round(
                      (new Date(event.endDateTime).getTime() -
                        new Date(event.startDateTime).getTime()) /
                        (1000 * 60)
                    )}{" "}
                    minutos
                  </p>
                </div>
              </CardContent>
            </Card>

            {/* Club & Location */}
            <Card>
              <CardHeader>
                <CardTitle>Ubicación</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div>
                  <p className="text-sm font-medium text-muted-foreground">
                    Club
                  </p>
                  <Link href={`/clubs/${event.club.id}`}>
                    <p className="text-lg text-primary hover:underline cursor-pointer">
                      {event.club.name}
                    </p>
                  </Link>
                </div>
                <div>
                  <p className="text-sm font-medium text-muted-foreground">
                    Ciudad
                  </p>
                  <p className="text-lg">{event.club.city}</p>
                </div>
                {event.court && (
                  <div>
                    <p className="text-sm font-medium text-muted-foreground">
                      Pista
                    </p>
                    <p className="text-lg">{event.court.name}</p>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Participants Info */}
            <Card>
              <CardHeader>
                <CardTitle>Participantes</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  <div>
                    <p className="text-sm text-muted-foreground">Inscritos</p>
                    <p className="text-3xl font-bold">
                      {event._count?.participants || 0}
                      {event.maxParticipants && ` / ${event.maxParticipants}`}
                    </p>
                  </div>
                  {event.maxParticipants && (
                    <div className="w-full bg-gray-200 rounded-full h-2">
                      <div
                        className="bg-primary h-2 rounded-full transition-all"
                        style={{
                          width: `${Math.min(
                            ((event._count?.participants || 0) /
                              event.maxParticipants) *
                              100,
                            100
                          )}%`,
                        }}
                      />
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>

            {/* Price */}
            {event.price !== null && event.price !== undefined && (
              <Card>
                <CardHeader>
                  <CardTitle>Precio</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-3xl font-bold">
                    {event.price > 0 ? `${event.price}€` : "Gratis"}
                  </p>
                </CardContent>
              </Card>
            )}

            {/* Matches */}
            {event._count?.matches && event._count.matches > 0 && (
              <Card>
                <CardHeader>
                  <CardTitle>Partidos</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-3xl font-bold">{event._count.matches}</p>
                  <p className="text-sm text-muted-foreground mt-1">
                    Partidos registrados
                  </p>
                </CardContent>
              </Card>
            )}
          </div>
        </div>
      </main>

      {/* Cancel Confirmation Dialog */}
      <Dialog open={showCancelDialog} onOpenChange={setShowCancelDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>¿Cancelar inscripción?</DialogTitle>
            <DialogDescription>
              ¿Estás seguro de que quieres cancelar tu inscripción a este
              evento? Esta acción no se puede deshacer.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setShowCancelDialog(false)}
              disabled={isActionLoading}
            >
              No, mantener inscripción
            </Button>
            <Button
              variant="destructive"
              onClick={handleLeave}
              disabled={isActionLoading}
            >
              {isActionLoading ? "Cancelando..." : "Sí, cancelar inscripción"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
