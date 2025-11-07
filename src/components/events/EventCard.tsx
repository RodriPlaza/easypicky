"use client";

import { useState } from "react";
import { Event } from "@/types/event";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { useRouter } from "next/navigation";
import { api, ApiError } from "@/lib/api";
import { useToast } from "@/components/ui/use-toast";

interface EventCardProps {
  event: Event & {
    isParticipant?: boolean;
    isCheckedIn?: boolean;
    canCheckIn?: boolean;
  };
  showClubInfo?: boolean;
  onJoinChange?: () => void;
}

export function EventCard({
  event,
  showClubInfo = true,
  onJoinChange,
}: EventCardProps) {
  const router = useRouter();
  const { addToast } = useToast();
  const [isLoading, setIsLoading] = useState(false);

  // Badges de tipo
  const getTypeBadge = () => {
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

  // Badge de visibilidad
  const getVisibilityBadge = () => {
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

  // Badge de estado
  const getStatusBadge = () => {
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

  // Formatear fecha
  const formatDate = (date: string | Date) => {
    return new Date(date).toLocaleDateString("es-ES", {
      day: "numeric",
      month: "short",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  // Manejar unirse al evento
  const handleJoin = async () => {
    setIsLoading(true);
    try {
      await api.post(`/events/${event.id}/join`, {});

      addToast({
        title: "¡Te has inscrito!",
        description: "Te has inscrito correctamente al evento.",
        variant: "success",
      });

      if (onJoinChange) {
        onJoinChange();
      }
    } catch (error) {
      console.error("Error joining event:", error);

      if (error instanceof ApiError) {
        addToast({
          title: "Error",
          description: error.message || "No se pudo inscribir al evento.",
          variant: "destructive",
        });
      } else {
        addToast({
          title: "Error",
          description: "Ocurrió un error inesperado.",
          variant: "destructive",
        });
      }
    } finally {
      setIsLoading(false);
    }
  };

  // Manejar salir del evento
  const handleLeave = async () => {
    if (!confirm("¿Estás seguro de que quieres cancelar tu inscripción?")) {
      return;
    }

    setIsLoading(true);
    try {
      await api.delete(`/events/${event.id}/join`, {});

      addToast({
        title: "Inscripción cancelada",
        description: "Has cancelado tu inscripción al evento.",
        variant: "success",
      });

      if (onJoinChange) {
        onJoinChange();
      }
    } catch (error) {
      console.error("Error leaving event:", error);

      if (error instanceof ApiError) {
        addToast({
          title: "Error",
          description: error.message || "No se pudo cancelar la inscripción.",
          variant: "destructive",
        });
      } else {
        addToast({
          title: "Error",
          description: "Ocurrió un error inesperado.",
          variant: "destructive",
        });
      }
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Card className="h-full flex flex-col">
      <CardHeader>
        <div className="flex items-start justify-between gap-2 mb-2">
          <div className="flex flex-wrap gap-2">
            {getTypeBadge()}
            {getVisibilityBadge()}
            {getStatusBadge()}
          </div>
        </div>
        <CardTitle className="line-clamp-2">{event.title}</CardTitle>
        {showClubInfo && (
          <CardDescription>
            {event.club.name} • {event.club.city}
          </CardDescription>
        )}
      </CardHeader>

      <CardContent className="flex-1">
        {event.description && (
          <p className="text-sm text-muted-foreground line-clamp-3 mb-4">
            {event.description}
          </p>
        )}

        <div className="space-y-2 text-sm">
          <div className="flex items-center gap-2">
            <span className="font-semibold">Inicio:</span>
            <span className="text-muted-foreground">
              {formatDate(event.startDateTime)}
            </span>
          </div>
          <div className="flex items-center gap-2">
            <span className="font-semibold">Fin:</span>
            <span className="text-muted-foreground">
              {formatDate(event.endDateTime)}
            </span>
          </div>

          {event.court && (
            <div className="flex items-center gap-2">
              <span className="font-semibold">Pista:</span>
              <span className="text-muted-foreground">{event.court.name}</span>
            </div>
          )}

          {event.maxParticipants && (
            <div className="flex items-center gap-2">
              <span className="font-semibold">Plazas:</span>
              <span className="text-muted-foreground">
                {event._count?.participants || 0} / {event.maxParticipants}
              </span>
            </div>
          )}

          {event.price && event.price > 0 && (
            <div className="flex items-center gap-2">
              <span className="font-semibold">Precio:</span>
              <span className="text-muted-foreground">{event.price}€</span>
            </div>
          )}
        </div>
      </CardContent>

      <CardFooter className="flex gap-2">
        <Button
          variant="outline"
          className="flex-1"
          onClick={() => router.push(`/events/${event.id}`)}
        >
          Ver Detalles
        </Button>

        {event.status === "SCHEDULED" && (
          <>
            {event.isParticipant ? (
              <Button
                variant="destructive"
                className="flex-1"
                onClick={handleLeave}
                disabled={isLoading}
              >
                {isLoading ? "Cancelando..." : "Cancelar"}
              </Button>
            ) : (
              <Button
                className="flex-1"
                onClick={handleJoin}
                disabled={isLoading}
              >
                {isLoading ? "Inscribiendo..." : "Inscribirse"}
              </Button>
            )}
          </>
        )}
      </CardFooter>
    </Card>
  );
}
