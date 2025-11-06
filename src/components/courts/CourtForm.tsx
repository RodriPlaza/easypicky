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
    },
  });

  const onSubmit = async (data: CourtFormData) => {
    setIsLoading(true);

    try {
      const cleanData = {
        ...data,
        description: data.description || undefined,
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
