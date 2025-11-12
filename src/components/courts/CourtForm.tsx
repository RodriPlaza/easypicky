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
import type { Court, UpdateCourtData } from "@/types/court";

const courtSchema = z.object({
  name: z
    .string()
    .min(1, "El nombre es requerido")
    .max(100, "Máximo 100 caracteres"),
  description: z.string().optional(),
  isActive: z.boolean(),
  openTime: z
    .string()
    .regex(/^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/, "Formato HH:mm"),
  closeTime: z
    .string()
    .regex(/^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/, "Formato HH:mm"),
  slotDuration: z
    .number()
    .min(15, "Mínimo 15 minutos")
    .max(240, "Máximo 4 horas"),
});

type CourtFormData = z.infer<typeof courtSchema>;

interface CourtFormProps {
  court?: Court;
  mode: "create" | "edit";
  clubId: string;
  onSuccess?: () => void;
}

export function CourtForm({ court, mode, clubId, onSuccess }: CourtFormProps) {
  const router = useRouter();
  const { addToast } = useToast();
  const [isLoading, setIsLoading] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<CourtFormData>({
    resolver: zodResolver(courtSchema),
    defaultValues: {
      name: court?.name || "",
      description: court?.description || "",
      isActive: court?.isActive ?? true,
      openTime: court?.openTime || "08:00",
      closeTime: court?.closeTime || "23:00",
      slotDuration: court?.slotDuration || 90,
    },
  });

  const onSubmit = async (data: CourtFormData) => {
    setIsLoading(true);

    try {
      const cleanData = {
        ...data,
        description: data.description || undefined,
        openTime: data.openTime,
        closeTime: data.closeTime,
        slotDuration: data.slotDuration,
      };

      if (mode === "create") {
        const response = await api.post<{ court: Court }>(
          `/clubs/${clubId}/courts`,
          cleanData
        );

        addToast({
          title: "¡Éxito!",
          description: "Pista creada correctamente",
          variant: "success",
        });

        if (onSuccess) {
          onSuccess();
        } else {
          router.push(`/clubs/${clubId}/courts`);
          router.refresh();
        }
      } else {
        // Para edición, solo enviar campos que cambiaron
        const updateData: UpdateCourtData = {};
        if (data.name !== court?.name) updateData.name = data.name;
        if (data.description !== court?.description)
          updateData.description = data.description;
        if (data.isActive !== court?.isActive)
          updateData.isActive = data.isActive;
        if (data.openTime !== court?.openTime)
          updateData.openTime = data.openTime;
        if (data.closeTime !== court?.closeTime)
          updateData.closeTime = data.closeTime;
        if (data.slotDuration !== court?.slotDuration)
          updateData.slotDuration = data.slotDuration;

        await api.put(`/clubs/${clubId}/courts/${court?.id}`, updateData);

        addToast({
          title: "¡Éxito!",
          description: "Pista actualizada correctamente",
          variant: "success",
        });

        if (onSuccess) {
          onSuccess();
        } else {
          router.push(`/clubs/${clubId}/courts`);
          router.refresh();
        }
      }
    } catch (error) {
      if (error instanceof ApiError) {
        addToast({
          title: "Error",
          description: error.message,
          variant: "destructive",
        });
      } else {
        addToast({
          title: "Error",
          description: "Ocurrió un error inesperado",
          variant: "destructive",
        });
      }
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
      {/* Nombre */}
      <div className="space-y-2">
        <Label htmlFor="name">
          Nombre de la Pista <span className="text-red-500">*</span>
        </Label>
        <Input
          id="name"
          placeholder="Ej: Pista 1, Pista Central, Pista Exterior..."
          {...register("name")}
          disabled={isLoading}
        />
        {errors.name && (
          <p className="text-sm text-red-600">{errors.name.message}</p>
        )}
      </div>
      {/* Descripción */}
      <div className="space-y-2">
        <Label htmlFor="description">Descripción</Label>
        <Textarea
          id="description"
          placeholder="Características especiales, superficie, iluminación, etc."
          rows={4}
          {...register("description")}
          disabled={isLoading}
        />
        {errors.description && (
          <p className="text-sm text-red-600">{errors.description.message}</p>
        )}
        <p className="text-xs text-muted-foreground">
          Opcional - Información adicional sobre la pista
        </p>
      </div>

      {/* Horario de apertura */}
      <div className="space-y-2">
        <Label htmlFor="openTime">
          Hora de Apertura <span className="text-red-500">*</span>
        </Label>
        <Input
          id="openTime"
          type="time"
          {...register("openTime")}
          disabled={isLoading}
        />
        {errors.openTime && (
          <p className="text-sm text-red-600">{errors.openTime.message}</p>
        )}
      </div>
      {/* Horario de cierre */}
      <div className="space-y-2">
        <Label htmlFor="closeTime">
          Hora de Cierre <span className="text-red-500">*</span>
        </Label>
        <Input
          id="closeTime"
          type="time"
          {...register("closeTime")}
          disabled={isLoading}
        />
        {errors.closeTime && (
          <p className="text-sm text-red-600">{errors.closeTime.message}</p>
        )}
      </div>
      {/* Duración de slots */}
      <div className="space-y-2">
        <Label htmlFor="slotDuration">
          Duración de Reserva (minutos) <span className="text-red-500">*</span>
        </Label>
        <Input
          id="slotDuration"
          type="number"
          min="15"
          max="240"
          step="15"
          {...register("slotDuration", { valueAsNumber: true })}
          disabled={isLoading}
        />
        {errors.slotDuration && (
          <p className="text-sm text-red-600">{errors.slotDuration.message}</p>
        )}
        <p className="text-xs text-muted-foreground">
          Define cada cuánto tiempo se puede reservar esta pista (15-240
          minutos)
        </p>
      </div>

      {/* Estado activo */}
      <div className="flex items-center space-x-2">
        <input
          type="checkbox"
          id="isActive"
          {...register("isActive")}
          disabled={isLoading}
          className="h-4 w-4 rounded border-gray-300 text-primary focus:ring-primary"
        />
        <Label htmlFor="isActive" className="font-normal cursor-pointer">
          Pista activa (disponible para reservas y eventos)
        </Label>
      </div>
      {/* Botones */}
      <div className="flex gap-4">
        <Button
          type="button"
          variant="outline"
          onClick={() => {
            if (onSuccess) {
              // Si hay onSuccess, simplemente no hacer submit
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
            ? "Crear Pista"
            : "Guardar Cambios"}
        </Button>
      </div>
    </form>
  );
}
