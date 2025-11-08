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
import type { Event } from "@/types/event";
import type { Court } from "@/types/court";

interface EventManagePageProps {
  params: Promise<{
    id: string;
  }>;
}

export default function EventManagePage({ params }: EventManagePageProps) {
  const router = useRouter();
  const { data: session, status } = useSession();
  const { addToast } = useToast();

  const [eventId, setEventId] = useState<string | null>(null);
  const [event, setEvent] = useState<Event | null>(null);
  const [courts, setCourts] = useState<Court[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isLoadingCourts, setIsLoadingCourts] = useState(false);
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);

  useEffect(() => {
    if (status === "unauthenticated") {
      router.push("/auth/signin");
    }
  }, [status, router]);

  useEffect(() => {
    params.then((resolvedParams) => {
      setEventId(resolvedParams.id);
    });
  }, [params]);

  useEffect(() => {
    if (eventId && status === "authenticated") {
      fetchEvent();
    }
  }, [eventId, status]);

  const fetchEvent = async () => {
    if (!eventId) return;

    setIsLoading(true);
    try {
      const response = await api.get<{ event: Event }>(`/events/${eventId}`);
      setEvent(response.event);

      // Cargar pistas del club
      fetchCourts(response.event.clubId);

      // Verificar permisos
      const isClubCreator =
        session?.user?.id === response.event.club?.creatorId;
      const isSuperAdmin = session?.user?.role === "SUPER_ADMIN";

      if (!isClubCreator && !isSuperAdmin) {
        addToast({
          title: "Acceso denegado",
          description: "No tienes permisos para gestionar este evento.",
          variant: "destructive",
        });
        router.push(`/events/${eventId}`);
      }
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

  const fetchCourts = async (clubId: string) => {
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

  const handleDelete = async () => {
    if (!eventId) return;

    setIsDeleting(true);
    try {
      await api.delete(`/events/${eventId}`);

      addToast({
        title: "Evento eliminado",
        description: "El evento ha sido eliminado correctamente.",
        variant: "success",
      });

      router.push(`/clubs/${event?.clubId}`);
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

  const handleUpdateSuccess = (updatedEvent: Event) => {
    setEvent(updatedEvent);
    addToast({
      title: "¡Evento actualizado!",
      description: "Los cambios se han guardado correctamente.",
      variant: "success",
    });
    router.push(`/events/${updatedEvent.id}`);
  };

  if (status === "loading" || isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <p className="text-lg">Cargando...</p>
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
              <Link href={`/events/${event.id}`}>
                <Button variant="outline">Volver al Evento</Button>
              </Link>
              <Link href={`/events/${event.id}/participants`}>
                <Button variant="outline">
                  Ver Participantes ({event._count?.participants || 0})
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Page Header */}
        <div className="mb-8">
          <h2 className="text-3xl font-bold mb-2">Gestionar Evento</h2>
          <p className="text-muted-foreground">
            Edita la información del evento o elimínalo si es necesario
          </p>
        </div>

        {/* Edit Form */}
        <Card className="mb-6">
          <CardHeader>
            <CardTitle>Editar Información</CardTitle>
            <CardDescription>
              Modifica los detalles del evento. Los cambios se guardarán
              inmediatamente.
            </CardDescription>
          </CardHeader>
          <CardContent>
            {isLoadingCourts ? (
              <div className="text-center py-8">
                <p className="text-muted-foreground">Cargando pistas...</p>
              </div>
            ) : (
              <EventForm
                mode="edit"
                clubId={event.clubId}
                event={event}
                courts={courts}
                onSuccess={handleUpdateSuccess}
              />
            )}
          </CardContent>
        </Card>

        {/* Danger Zone */}
        <Card className="border-red-200">
          <CardHeader>
            <CardTitle className="text-red-600">Zona de Peligro</CardTitle>
            <CardDescription>
              Acciones irreversibles. Ten cuidado con estas opciones.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex items-center justify-between">
              <div>
                <p className="font-semibold">Eliminar Evento</p>
                <p className="text-sm text-muted-foreground">
                  Esta acción no se puede deshacer. Se eliminarán todos los
                  datos asociados.
                </p>
              </div>
              <Button
                variant="destructive"
                onClick={() => setShowDeleteDialog(true)}
              >
                Eliminar Evento
              </Button>
            </div>
          </CardContent>
        </Card>
      </main>

      {/* Delete Confirmation Dialog */}
      <Dialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>¿Eliminar evento?</DialogTitle>
            <DialogDescription>
              Esta acción no se puede deshacer. Se eliminarán todos los datos
              asociados: inscripciones, partidos y estadísticas.
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
              {isDeleting ? "Eliminando..." : "Eliminar Evento"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
