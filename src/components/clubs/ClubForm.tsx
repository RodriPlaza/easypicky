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
import type { Club, CreateClubData, UpdateClubData } from "@/types/club";

const clubSchema = z.object({
  name: z
    .string()
    .min(1, "El nombre es requerido")
    .max(100, "Máximo 100 caracteres"),
  description: z.string().optional(),
  address: z.string().min(1, "La dirección es requerida"),
  city: z.string().min(1, "La ciudad es requerida"),
  phone: z.string().optional(),
  email: z.string().email("Email inválido").optional().or(z.literal("")),
  website: z.string().url("URL inválida").optional().or(z.literal("")),
  logo: z.string().url("URL inválida").optional().or(z.literal("")),
});

type ClubFormData = z.infer<typeof clubSchema>;

interface ClubFormProps {
  club?: Club;
  mode: "create" | "edit";
}

export function ClubForm({ club, mode }: ClubFormProps) {
  const router = useRouter();
  const { addToast } = useToast();
  const [isLoading, setIsLoading] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<ClubFormData>({
    resolver: zodResolver(clubSchema),
    defaultValues: club
      ? {
          name: club.name,
          description: club.description || "",
          address: club.address,
          city: club.city,
          phone: club.phone || "",
          email: club.email || "",
          website: club.website || "",
          logo: club.logo || "",
        }
      : undefined,
  });

  const onSubmit = async (data: ClubFormData) => {
    setIsLoading(true);

    try {
      const cleanData = {
        ...data,
        description: data.description || undefined,
        phone: data.phone || undefined,
        email: data.email || undefined,
        website: data.website || undefined,
        logo: data.logo || undefined,
      };

      if (mode === "create") {
        const response = await api.post<{ club: Club }>("/clubs", cleanData);

        addToast({
          title: "¡Éxito!",
          description: "Club creado correctamente",
          variant: "success",
        });

        router.push(`/clubs/${response.club.id}`);
      } else {
        const updateData: UpdateClubData = {};
        if (data.name !== club?.name) updateData.name = data.name;
        if (data.description !== club?.description)
          updateData.description = data.description;
        if (data.address !== club?.address) updateData.address = data.address;
        if (data.city !== club?.city) updateData.city = data.city;
        if (data.phone !== club?.phone) updateData.phone = data.phone;
        if (data.email !== club?.email) updateData.email = data.email;
        if (data.website !== club?.website) updateData.website = data.website;
        if (data.logo !== club?.logo) updateData.logo = data.logo;

        await api.put(`/clubs/${club?.id}`, updateData);

        addToast({
          title: "¡Éxito!",
          description: "Club actualizado correctamente",
          variant: "success",
        });

        router.push(`/clubs/${club?.id}`);
        router.refresh();
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
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Nombre */}
        <div className="space-y-2">
          <Label htmlFor="name">
            Nombre del Club <span className="text-red-500">*</span>
          </Label>
          <Input
            id="name"
            placeholder="Club Pickleball Madrid"
            {...register("name")}
            disabled={isLoading}
          />
          {errors.name && (
            <p className="text-sm text-red-600">{errors.name.message}</p>
          )}
        </div>

        {/* Ciudad */}
        <div className="space-y-2">
          <Label htmlFor="city">
            Ciudad <span className="text-red-500">*</span>
          </Label>
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

      {/* Dirección */}
      <div className="space-y-2">
        <Label htmlFor="address">
          Dirección <span className="text-red-500">*</span>
        </Label>
        <Input
          id="address"
          placeholder="Calle Gran Vía 1, Madrid"
          {...register("address")}
          disabled={isLoading}
        />
        {errors.address && (
          <p className="text-sm text-red-600">{errors.address.message}</p>
        )}
      </div>

      {/* Descripción */}
      <div className="space-y-2">
        <Label htmlFor="description">Descripción</Label>
        <Textarea
          id="description"
          placeholder="Describe tu club de pickleball..."
          rows={4}
          {...register("description")}
          disabled={isLoading}
        />
        {errors.description && (
          <p className="text-sm text-red-600">{errors.description.message}</p>
        )}
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

        {/* Email */}
        <div className="space-y-2">
          <Label htmlFor="email">Email</Label>
          <Input
            id="email"
            type="email"
            placeholder="info@club.com"
            {...register("email")}
            disabled={isLoading}
          />
          {errors.email && (
            <p className="text-sm text-red-600">{errors.email.message}</p>
          )}
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Website */}
        <div className="space-y-2">
          <Label htmlFor="website">Sitio Web</Label>
          <Input
            id="website"
            type="url"
            placeholder="https://tuclub.com"
            {...register("website")}
            disabled={isLoading}
          />
          {errors.website && (
            <p className="text-sm text-red-600">{errors.website.message}</p>
          )}
        </div>

        {/* Logo */}
        <div className="space-y-2">
          <Label htmlFor="logo">Logo (URL)</Label>
          <Input
            id="logo"
            type="url"
            placeholder="https://example.com/logo.png"
            {...register("logo")}
            disabled={isLoading}
          />
          {errors.logo && (
            <p className="text-sm text-red-600">{errors.logo.message}</p>
          )}
        </div>
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
          {isLoading
            ? mode === "create"
              ? "Creando..."
              : "Guardando..."
            : mode === "create"
            ? "Crear Club"
            : "Guardar Cambios"}
        </Button>
      </div>
    </form>
  );
}
