"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import * as z from "zod";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from "@/components/ui/use-toast";
import { api, ApiError } from "@/lib/api";
import type { User, UpdateProfileData } from "@/types/user";

const profileSchema = z.object({
  name: z.string().min(2, "El nombre debe tener al menos 2 caracteres"),
  phone: z.string().optional(),
  city: z.string().optional(),
  avatar: z.string().url("URL inválida").optional().or(z.literal("")),
  duprId: z.string().optional(),
});

type ProfileFormData = z.infer<typeof profileSchema>;

interface ProfileFormProps {
  user: User;
  onUpdate?: (user: User) => void;
}

export function ProfileForm({ user, onUpdate }: ProfileFormProps) {
  const router = useRouter();
  const { addToast } = useToast();
  const [isLoading, setIsLoading] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<ProfileFormData>({
    resolver: zodResolver(profileSchema),
    defaultValues: {
      name: user.name,
      phone: user.phone || "",
      city: user.city || "",
      avatar: user.avatar || "",
      duprId: user.duprId || "",
    },
  });

  const onSubmit = async (data: ProfileFormData) => {
    setIsLoading(true);

    try {
      const updateData: UpdateProfileData = {};

      if (data.name !== user.name) updateData.name = data.name;
      if (data.phone !== user.phone) updateData.phone = data.phone || undefined;
      if (data.city !== user.city) updateData.city = data.city || undefined;
      if (data.avatar !== user.avatar)
        updateData.avatar = data.avatar || undefined;
      if (data.duprId !== user.duprId)
        updateData.duprId = data.duprId || undefined;

      // Solo hacer la petición si hay cambios
      if (Object.keys(updateData).length === 0) {
        addToast({
          title: "Sin cambios",
          description: "No hay cambios para guardar",
          variant: "info",
        });
        return;
      }

      const response = await api.put<{ user: User }>(
        "/users/profile",
        updateData
      );

      addToast({
        title: "¡Éxito!",
        description: "Perfil actualizado correctamente",
        variant: "success",
      });

      if (onUpdate) {
        onUpdate(response.user);
      }

      router.refresh();
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
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Nombre */}
        <div className="space-y-2">
          <Label htmlFor="name">
            Nombre <span className="text-red-500">*</span>
          </Label>
          <Input
            id="name"
            placeholder="Tu nombre"
            {...register("name")}
            disabled={isLoading}
          />
          {errors.name && (
            <p className="text-sm text-red-600">{errors.name.message}</p>
          )}
        </div>

        {/* Email (solo lectura) */}
        <div className="space-y-2">
          <Label htmlFor="email">Email</Label>
          <Input
            id="email"
            type="email"
            value={user.email}
            disabled
            className="bg-gray-100"
          />
          <p className="text-xs text-muted-foreground">
            El email no se puede modificar
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Teléfono */}
        <div className="space-y-2">
          <Label htmlFor="phone">Teléfono</Label>
          <Input
            id="phone"
            type="tel"
            placeholder="+34 666 123 456"
            {...register("phone")}
            disabled={isLoading}
          />
          {errors.phone && (
            <p className="text-sm text-red-600">{errors.phone.message}</p>
          )}
        </div>

        {/* Ciudad */}
        <div className="space-y-2">
          <Label htmlFor="city">Ciudad</Label>
          <Input
            id="city"
            placeholder="Madrid"
            {...register("city")}
            disabled={isLoading}
          />
          {errors.city && (
            <p className="text-sm text-red-600">{errors.city.message}</p>
          )}
        </div>
      </div>

      {/* Avatar */}
      <div className="space-y-2">
        <Label htmlFor="avatar">Avatar (URL)</Label>
        <Input
          id="avatar"
          type="url"
          placeholder="https://example.com/avatar.jpg"
          {...register("avatar")}
          disabled={isLoading}
        />
        {errors.avatar && (
          <p className="text-sm text-red-600">{errors.avatar.message}</p>
        )}
        <p className="text-xs text-muted-foreground">
          Ingresa la URL de tu foto de perfil
        </p>
      </div>

      {/* DUPR ID */}
      <div className="space-y-2">
        <Label htmlFor="duprId">DUPR ID</Label>
        <Input
          id="duprId"
          placeholder="Tu ID de DUPR"
          {...register("duprId")}
          disabled={isLoading}
        />
        {errors.duprId && (
          <p className="text-sm text-red-600">{errors.duprId.message}</p>
        )}
        <p className="text-xs text-muted-foreground">
          Conecta tu cuenta de DUPR para mostrar tu rating
        </p>
        {user.duprRating && (
          <p className="text-sm text-green-600">
            Rating actual: {user.duprRating}
          </p>
        )}
      </div>

      <div className="flex gap-4">
        <Button
          type="button"
          variant="outline"
          onClick={() => router.back()}
          disabled={isLoading}
        >
          Cancelar
        </Button>
        <Button type="submit" disabled={isLoading}>
          {isLoading ? "Guardando..." : "Guardar Cambios"}
        </Button>
      </div>
    </form>
  );
}
