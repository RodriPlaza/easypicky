"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import * as z from "zod";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/components/ui/use-toast";
import { api, ApiError } from "@/lib/api";
import type { Event, CreateEventData, UpdateEventData } from "@/types/event";

// Schema de validación
const eventSchema = z
  .object({
    title: z.string().min(3, "El título debe tener al menos 3 caracteres"),
    description: z.string().optional(),
    type: z.enum(["CLASS", "TOURNAMENT", "MEETUP"]),
    visibility: z.enum(["OPEN", "MEMBERS_ONLY", "PRIVATE"]),
    status: z
      .enum(["SCHEDULED", "ONGOING", "COMPLETED", "CANCELLED"])
      .optional(),
    startDateTime: z.string().min(1, "La fecha de inicio es obligatoria"),
    endDateTime: z.string().min(1, "La fecha de fin es obligatoria"),
    maxParticipants: z
      .union([
        z.string().transform((val) => (val === "" ? undefined : Number(val))),
        z.number().int().positive("Debe ser un número positivo"),
      ])
      .optional(),
    price: z
      .union([
        z.string().transform((val) => (val === "" ? undefined : Number(val))),
        z.number().min(0, "El precio no puede ser negativo"),
      ])
      .optional(),
    courtId: z.string().optional(),
  })
  .refine((data) => new Date(data.endDateTime) > new Date(data.startDateTime), {
    message: "La fecha de fin debe ser posterior a la fecha de inicio",
    path: ["endDateTime"],
  });

type EventFormData = z.infer<typeof eventSchema>;

interface EventFormProps {
  mode: "create" | "edit";
  clubId: string;
  event?: Event;
  courts?: Array<{ id: string; name: string; isActive: boolean }>;
  onSuccess?: (event: Event) => void;
}

export function EventForm({
  mode,
  clubId,
  event,
  courts = [],
  onSuccess,
}: EventFormProps) {
  const { addToast } = useToast();
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);

  // Valores por defecto para edición
  const defaultValues: Partial<EventFormData> = event
    ? {
        title: event.title,
        description: event.description || "",
        type: event.type,
        visibility: event.visibility,
        status: event.status,
        startDateTime: new Date(event.startDateTime).toISOString().slice(0, 16),
        endDateTime: new Date(event.endDateTime).toISOString().slice(0, 16),
        maxParticipants: event.maxParticipants || undefined,
        price: event.price || undefined,
        courtId: event.courtId || "",
      }
    : {
        type: "MEETUP",
        visibility: "MEMBERS_ONLY",
        maxParticipants: undefined,
        price: undefined,
      };

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<EventFormData>({
    resolver: zodResolver(eventSchema) as any,
    defaultValues,
  });

  const onSubmit = async (data: EventFormData) => {
    setIsLoading(true);

    try {
      // Preparar datos
      const eventData: CreateEventData | UpdateEventData = {
        title: data.title,
        description: data.description || undefined,
        type: data.type,
        visibility: data.visibility,
        startDateTime: new Date(data.startDateTime).toISOString(),
        endDateTime: new Date(data.endDateTime).toISOString(),
        maxParticipants: data.maxParticipants,
        price: data.price,
        courtId: data.courtId || undefined,
      };

      let result: Event;

      if (mode === "create") {
        // Crear evento
        const response = await api.post<{ message: string; event: Event }>(
          "/events",
          { ...eventData, clubId }
        );
        result = response.event;

        addToast({
          title: "¡Evento creado!",
          description: "El evento se ha creado correctamente.",
          variant: "success",
        });

        // Redirigir al detalle del evento
        if (onSuccess) {
          onSuccess(result);
        } else {
          router.push(`/events/${result.id}`);
        }
      } else {
        // Actualizar evento - solo enviar campos que cambiaron
        const updateData: UpdateEventData = {};

        if (data.title !== event?.title) updateData.title = data.title;
        if (data.description !== event?.description)
          updateData.description = data.description || undefined;
        if (data.type !== event?.type) updateData.type = data.type;
        if (data.visibility !== event?.visibility)
          updateData.visibility = data.visibility;
        if (data.status && data.status !== event?.status)
          updateData.status = data.status;
        if (
          data.startDateTime !==
          new Date(event?.startDateTime || "").toISOString().slice(0, 16)
        )
          updateData.startDateTime = data.startDateTime;
        if (
          data.endDateTime !==
          new Date(event?.endDateTime || "").toISOString().slice(0, 16)
        )
          updateData.endDateTime = data.endDateTime;
        if (data.maxParticipants !== event?.maxParticipants)
          updateData.maxParticipants = data.maxParticipants;
        if (data.price !== event?.price) updateData.price = data.price;
        if (data.courtId !== (event?.courtId || ""))
          updateData.courtId = data.courtId || undefined;

        const response = await api.put<{ message: string; event: Event }>(
          `/events/${event!.id}`,
          updateData
        );
        result = response.event;

        addToast({
          title: "¡Evento actualizado!",
          description: "Los cambios se han guardado correctamente.",
          variant: "success",
        });

        if (onSuccess) {
          onSuccess(result);
        } else {
          router.push(`/events/${result.id}`);
        }
      }
    } catch (error) {
      console.error("Error saving event:", error);

      if (error instanceof ApiError) {
        addToast({
          title: "Error",
          description: error.message || "No se pudo guardar el evento.",
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
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
      {/* Título */}
      <div className="space-y-2">
        <Label htmlFor="title">
          Título <span className="text-red-500">*</span>
        </Label>
        <Input
          id="title"
          {...register("title")}
          placeholder="Ej: Clase de iniciación"
          disabled={isLoading}
        />
        {errors.title && (
          <p className="text-sm text-red-600">{errors.title.message}</p>
        )}
      </div>

      {/* Descripción */}
      <div className="space-y-2">
        <Label htmlFor="description">Descripción</Label>
        <Textarea
          id="description"
          {...register("description")}
          placeholder="Describe el evento..."
          rows={4}
          disabled={isLoading}
        />
        {errors.description && (
          <p className="text-sm text-red-600">{errors.description.message}</p>
        )}
      </div>

      {/* Tipo y Visibilidad */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="type">
            Tipo <span className="text-red-500">*</span>
          </Label>
          <select
            id="type"
            {...register("type")}
            className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring disabled:cursor-not-allowed disabled:opacity-50"
            disabled={isLoading}
          >
            <option value="CLASS">Clase</option>
            <option value="TOURNAMENT">Torneo</option>
            <option value="MEETUP">Quedada</option>
          </select>
          {errors.type && (
            <p className="text-sm text-red-600">{errors.type.message}</p>
          )}
        </div>

        <div className="space-y-2">
          <Label htmlFor="visibility">
            Visibilidad <span className="text-red-500">*</span>
          </Label>
          <select
            id="visibility"
            {...register("visibility")}
            className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring disabled:cursor-not-allowed disabled:opacity-50"
            disabled={isLoading}
          >
            <option value="OPEN">Abierto a todos</option>
            <option value="MEMBERS_ONLY">Solo miembros</option>
            <option value="PRIVATE">Privado</option>
          </select>
          {errors.visibility && (
            <p className="text-sm text-red-600">{errors.visibility.message}</p>
          )}
        </div>
      </div>

      {/* Estado (solo en edición) */}
      {mode === "edit" && (
        <div className="space-y-2">
          <Label htmlFor="status">Estado</Label>
          <select
            id="status"
            {...register("status")}
            className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring disabled:cursor-not-allowed disabled:opacity-50"
            disabled={isLoading}
          >
            <option value="SCHEDULED">Programado</option>
            <option value="ONGOING">En curso</option>
            <option value="COMPLETED">Completado</option>
            <option value="CANCELLED">Cancelado</option>
          </select>
          {errors.status && (
            <p className="text-sm text-red-600">{errors.status.message}</p>
          )}
        </div>
      )}

      {/* Fechas */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="startDateTime">
            Fecha y hora de inicio <span className="text-red-500">*</span>
          </Label>
          <Input
            id="startDateTime"
            type="datetime-local"
            {...register("startDateTime")}
            disabled={isLoading}
          />
          {errors.startDateTime && (
            <p className="text-sm text-red-600">
              {errors.startDateTime.message}
            </p>
          )}
        </div>

        <div className="space-y-2">
          <Label htmlFor="endDateTime">
            Fecha y hora de fin <span className="text-red-500">*</span>
          </Label>
          <Input
            id="endDateTime"
            type="datetime-local"
            {...register("endDateTime")}
            disabled={isLoading}
          />
          {errors.endDateTime && (
            <p className="text-sm text-red-600">{errors.endDateTime.message}</p>
          )}
        </div>
      </div>

      {/* Pista */}
      {courts.length > 0 && (
        <div className="space-y-2">
          <Label htmlFor="courtId">Pista (opcional)</Label>
          <select
            id="courtId"
            {...register("courtId")}
            className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring disabled:cursor-not-allowed disabled:opacity-50"
            disabled={isLoading}
          >
            <option value="">Sin pista asignada</option>
            {courts
              .filter((court) => court.isActive)
              .map((court) => (
                <option key={court.id} value={court.id}>
                  {court.name}
                </option>
              ))}
          </select>
          {errors.courtId && (
            <p className="text-sm text-red-600">{errors.courtId.message}</p>
          )}
        </div>
      )}

      {/* Máximo de participantes y precio */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="maxParticipants">
            Máximo de participantes (opcional)
          </Label>
          <Input
            id="maxParticipants"
            type="number"
            min="1"
            {...register("maxParticipants")}
            placeholder="Sin límite"
            disabled={isLoading}
          />
          {errors.maxParticipants && (
            <p className="text-sm text-red-600">
              {errors.maxParticipants.message}
            </p>
          )}
        </div>

        <div className="space-y-2">
          <Label htmlFor="price">Precio en € (opcional)</Label>
          <Input
            id="price"
            type="number"
            min="0"
            step="0.01"
            {...register("price")}
            placeholder="Gratis"
            disabled={isLoading}
          />
          {errors.price && (
            <p className="text-sm text-red-600">{errors.price.message}</p>
          )}
        </div>
      </div>

      {/* Botones */}
      <div className="flex gap-4">
        <Button
          type="button"
          variant="outline"
          onClick={() => {
            if (onSuccess) {
              // Si hay onSuccess, no hacer nada (modal se cierra)
              return;
            }
            router.back();
          }}
          disabled={isLoading}
        >
          Cancelar
        </Button>
        <Button type="submit" disabled={isLoading}>
          {isLoading
            ? mode === "create"
              ? "Creando..."
              : "Guardando..."
            : mode === "create"
            ? "Crear Evento"
            : "Guardar Cambios"}
        </Button>
      </div>
    </form>
  );
}
