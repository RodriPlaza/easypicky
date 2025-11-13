"use client";

import { useState, useEffect } from "react";
import { Court, TimeSlot, CourtScheduleResponse } from "@/types/court";
import { api, ApiError } from "@/lib/api";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/components/ui/use-toast";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

interface CourtScheduleProps {
  court: Court;
  isOpen: boolean;
  onClose: () => void;
  canReserve?: boolean;
}

export function CourtSchedule({
  court,
  isOpen,
  onClose,
  canReserve = false,
}: CourtScheduleProps) {
  const { addToast } = useToast();
  const [selectedDate, setSelectedDate] = useState<string>(
    new Date().toISOString().split("T")[0]
  );
  const [slots, setSlots] = useState<TimeSlot[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [selectedSlot, setSelectedSlot] = useState<TimeSlot | null>(null);

  if (!court.isReservable) {
    return (
      <Dialog open={isOpen} onOpenChange={onClose}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Pista No Reservable</DialogTitle>
            <DialogDescription>
              Esta pista no acepta reservas públicas. Solo está disponible para
              eventos programados por el club.
            </DialogDescription>
          </DialogHeader>
          <div className="flex justify-end mt-4">
            <Button onClick={onClose}>Cerrar</Button>
          </div>
        </DialogContent>
      </Dialog>
    );
  }

  useEffect(() => {
    if (isOpen) {
      loadSchedule();
    }
  }, [isOpen, selectedDate, court.id]);

  const loadSchedule = async () => {
    setIsLoading(true);
    try {
      const response = await api.get<CourtScheduleResponse>(
        `/courts/${court.id}/schedule?date=${selectedDate}`
      );
      setSlots(response.slots);
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

  const handleReserve = async (slot: TimeSlot) => {
    if (!canReserve || !slot.isAvailable) return;

    try {
      // Construir el datetime completo
      const startDateTime = new Date(`${selectedDate}T${slot.time}:00`);
      const endDateTime = new Date(
        startDateTime.getTime() + court.slotDuration * 60000
      );

      await api.post(`/courts/${court.id}/reservations`, {
        startTime: startDateTime.toISOString(),
        endTime: endDateTime.toISOString(),
      });

      addToast({
        title: "¡Éxito!",
        description: "Reserva creada correctamente",
        variant: "success",
      });

      loadSchedule(); // Recargar horario
    } catch (error) {
      if (error instanceof ApiError) {
        addToast({
          title: "Error",
          description: error.message,
          variant: "destructive",
        });
      }
    }
  };

  const handleCancelReservation = async (reservationId: string) => {
    try {
      await api.delete(`/courts/${court.id}/reservations/${reservationId}`);

      addToast({
        title: "¡Éxito!",
        description: "Reserva cancelada correctamente",
        variant: "success",
      });

      loadSchedule(); // Recargar horario
    } catch (error) {
      if (error instanceof ApiError) {
        addToast({
          title: "Error",
          description: error.message,
          variant: "destructive",
        });
      }
    }
  };

  const changeDate = (days: number) => {
    const current = new Date(selectedDate);
    current.setDate(current.getDate() + days);
    setSelectedDate(current.toISOString().split("T")[0]);
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString("es-ES", {
      weekday: "long",
      year: "numeric",
      month: "long",
      day: "numeric",
    });
  };

  const capitalizeFirst = (str: string) => {
    return str.charAt(0).toUpperCase() + str.slice(1);
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-3xl max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Horario de {court.name}</DialogTitle>
          <DialogDescription>
            Horario: {court.openTime} - {court.closeTime} | Duración:{" "}
            {court.slotDuration} minutos
          </DialogDescription>
        </DialogHeader>

        {/* Selector de fecha */}
        <div className="flex items-center justify-between gap-4 py-4 border-b">
          <Button
            variant="outline"
            size="sm"
            onClick={() => changeDate(-1)}
            disabled={isLoading}
          >
            ← Anterior
          </Button>
          <div className="text-center">
            <p className="text-lg font-semibold">
              {capitalizeFirst(formatDate(selectedDate))}
            </p>
          </div>
          <Button
            variant="outline"
            size="sm"
            onClick={() => changeDate(1)}
            disabled={isLoading}
          >
            Siguiente →
          </Button>
        </div>

        {/* Grid de horarios */}
        {isLoading ? (
          <div className="flex justify-center py-8">
            <p className="text-muted-foreground">Cargando horario...</p>
          </div>
        ) : slots.length === 0 ? (
          <div className="text-center py-8">
            <p className="text-muted-foreground">
              No hay horarios disponibles para este día
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
            {slots.map((slot, index) => (
              <div
                key={index}
                className={`
                  p-3 rounded-lg border-2 transition-all
                  ${
                    slot.isAvailable
                      ? "border-green-200 bg-green-50 hover:border-green-400 cursor-pointer"
                      : "border-red-200 bg-red-50 cursor-not-allowed"
                  }
                  ${selectedSlot === slot ? "ring-2 ring-primary" : ""}
                `}
                onClick={() => {
                  if (slot.isAvailable && canReserve) {
                    setSelectedSlot(slot);
                  } else if (!slot.isAvailable) {
                    setSelectedSlot(slot);
                  }
                }}
              >
                <div className="flex flex-col gap-2">
                  <div className="flex items-center justify-between">
                    <span className="font-semibold">{slot.time}</span>
                    {slot.isAvailable ? (
                      <Badge variant="success" className="text-xs">
                        Libre
                      </Badge>
                    ) : (
                      <Badge variant="destructive" className="text-xs">
                        Ocupado
                      </Badge>
                    )}
                  </div>

                  {!slot.isAvailable && slot.reservation && (
                    <div className="text-xs text-muted-foreground">
                      {slot.reservation.event && (
                        <p>Evento: {slot.reservation.event.title}</p>
                      )}
                      {slot.reservation.match && (
                        <p>Partido: {slot.reservation.match.matchType}</p>
                      )}
                      {slot.reservation.user && (
                        <p>Por: {slot.reservation.user.name}</p>
                      )}
                    </div>
                  )}

                  {slot.isAvailable && canReserve && (
                    <Button
                      size="sm"
                      className="w-full mt-1"
                      onClick={(e) => {
                        e.stopPropagation();
                        handleReserve(slot);
                      }}
                    >
                      Reservar
                    </Button>
                  )}

                  {!slot.isAvailable &&
                    slot.reservation &&
                    canReserve &&
                    slot.reservation.user && (
                      <Button
                        size="sm"
                        variant="destructive"
                        className="w-full mt-1"
                        onClick={(e) => {
                          e.stopPropagation();
                          handleCancelReservation(slot.reservation!.id);
                        }}
                      >
                        Cancelar
                      </Button>
                    )}
                </div>
              </div>
            ))}
          </div>
        )}

        <div className="mt-4 flex justify-end">
          <Button variant="outline" onClick={onClose}>
            Cerrar
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
