"use client";

import { useState, useEffect } from "react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ProfileForm } from "@/components/profile/ProfileForm";
import { ChangePasswordForm } from "@/components/profile/ChangePasswordForm";
import { api, ApiError } from "@/lib/api";
import type { User } from "@/types/user";

export default function ProfilePage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (status === "unauthenticated") {
      router.push("/auth/signin");
      return;
    }

    if (status === "authenticated") {
      fetchProfile();
    }
  }, [status, router]);

  const fetchProfile = async () => {
    try {
      setIsLoading(true);
      const response = await api.get<{ user: User }>("/users/profile");
      setUser(response.user);
      setError(null);
    } catch (error) {
      if (error instanceof ApiError) {
        setError(error.message);
      } else {
        setError("Error al cargar el perfil");
      }
    } finally {
      setIsLoading(false);
    }
  };

  if (status === "loading" || isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <p className="text-lg">Cargando perfil...</p>
      </div>
    );
  }

  if (!session || !user) {
    return null;
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 p-8">
        <div className="max-w-4xl mx-auto">
          <Card>
            <CardHeader>
              <CardTitle>Error</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-red-600">{error}</p>
              <Button onClick={fetchProfile} className="mt-4">
                Reintentar
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-4">
            <div>
              <h1 className="text-2xl font-bold">Mi Perfil</h1>
              <p className="text-sm text-muted-foreground">
                Gestiona tu información personal
              </p>
            </div>
            <Button variant="outline" onClick={() => router.push("/dashboard")}>
              Volver al Dashboard
            </Button>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="space-y-6">
          {/* Información General */}
          <Card>
            <CardHeader>
              <div className="flex items-start justify-between">
                <div>
                  <CardTitle>Información del Perfil</CardTitle>
                  <CardDescription>
                    Actualiza tu información personal y preferencias
                  </CardDescription>
                </div>
                <Badge
                  variant={
                    user.role === "SUPER_ADMIN" ? "default" : "secondary"
                  }
                >
                  {user.role}
                </Badge>
              </div>
            </CardHeader>
            <CardContent>
              <ProfileForm user={user} onUpdate={setUser} />
            </CardContent>
          </Card>

          {/* Seguridad - Cambiar Contraseña */}
          <Card>
            <CardHeader>
              <CardTitle>Seguridad</CardTitle>
              <CardDescription>
                Cambia tu contraseña para mantener tu cuenta segura
              </CardDescription>
            </CardHeader>
            <CardContent>
              <ChangePasswordForm />
            </CardContent>
          </Card>

          {/* Información de la Cuenta */}
          <Card>
            <CardHeader>
              <CardTitle>Información de la Cuenta</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2 text-sm">
                <div className="flex justify-between py-2 border-b">
                  <span className="text-muted-foreground">ID de Usuario:</span>
                  <span className="font-mono text-xs">{user.id}</span>
                </div>
                <div className="flex justify-between py-2 border-b">
                  <span className="text-muted-foreground">Cuenta creada:</span>
                  <span>
                    {new Date(user.createdAt).toLocaleDateString("es-ES")}
                  </span>
                </div>
                <div className="flex justify-between py-2">
                  <span className="text-muted-foreground">
                    Última actualización:
                  </span>
                  <span>
                    {new Date(user.updatedAt).toLocaleDateString("es-ES")}
                  </span>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </main>
    </div>
  );
}
