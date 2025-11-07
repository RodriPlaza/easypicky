"use client";

import { useState } from "react";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import * as z from "zod";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from "@/components/ui/use-toast";
import { api, ApiError } from "@/lib/api";

const passwordSchema = z
  .object({
    currentPassword: z.string().min(1, "La contraseña actual es requerida"),
    newPassword: z
      .string()
      .min(6, "La contraseña debe tener al menos 6 caracteres"),
    confirmPassword: z.string().min(1, "Confirma la nueva contraseña"),
  })
  .refine((data) => data.newPassword === data.confirmPassword, {
    message: "Las contraseñas no coinciden",
    path: ["confirmPassword"],
  });

type PasswordFormData = z.infer<typeof passwordSchema>;

export function ChangePasswordForm() {
  const { addToast } = useToast();
  const [isLoading, setIsLoading] = useState(false);

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<PasswordFormData>({
    resolver: zodResolver(passwordSchema),
  });

  const onSubmit = async (data: PasswordFormData) => {
    setIsLoading(true);

    try {
      await api.put("/users/profile", {
        currentPassword: data.currentPassword,
        newPassword: data.newPassword,
      });

      addToast({
        title: "¡Éxito!",
        description: "Contraseña cambiada correctamente",
        variant: "success",
      });

      reset();
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
      {/* Contraseña actual */}
      <div className="space-y-2">
        <Label htmlFor="currentPassword">
          Contraseña Actual <span className="text-red-500">*</span>
        </Label>
        <Input
          id="currentPassword"
          type="password"
          placeholder="••••••••"
          {...register("currentPassword")}
          disabled={isLoading}
        />
        {errors.currentPassword && (
          <p className="text-sm text-red-600">
            {errors.currentPassword.message}
          </p>
        )}
      </div>

      {/* Nueva contraseña */}
      <div className="space-y-2">
        <Label htmlFor="newPassword">
          Nueva Contraseña <span className="text-red-500">*</span>
        </Label>
        <Input
          id="newPassword"
          type="password"
          placeholder="••••••••"
          {...register("newPassword")}
          disabled={isLoading}
        />
        {errors.newPassword && (
          <p className="text-sm text-red-600">{errors.newPassword.message}</p>
        )}
        <p className="text-xs text-muted-foreground">Mínimo 6 caracteres</p>
      </div>

      {/* Confirmar contraseña */}
      <div className="space-y-2">
        <Label htmlFor="confirmPassword">
          Confirmar Nueva Contraseña <span className="text-red-500">*</span>
        </Label>
        <Input
          id="confirmPassword"
          type="password"
          placeholder="••••••••"
          {...register("confirmPassword")}
          disabled={isLoading}
        />
        {errors.confirmPassword && (
          <p className="text-sm text-red-600">
            {errors.confirmPassword.message}
          </p>
        )}
      </div>

      <Button type="submit" disabled={isLoading}>
        {isLoading ? "Cambiando..." : "Cambiar Contraseña"}
      </Button>
    </form>
  );
}
