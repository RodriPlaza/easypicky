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
import { Badge } from "@/components/ui/badge";
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
import type { Club } from "@/types/club";

interface ClubDetailPageProps {
  params: {
    id: string;
  };
}

export default function ClubDetailPage({ params }: ClubDetailPageProps) {
  const router = useRouter();
  const { data: session } = useSession();
  const { addToast } = useToast();

  const [club, setClub] = useState<Club | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);

  const isCreator = session?.user?.id === club?.creatorId;
  const isSuperAdmin = session?.user?.role === "SUPER_ADMIN";
  const canManage = isCreator || isSuperAdmin;

  useEffect(() => {
    fetchClub();
  }, [params.id]);

  const fetchClub = async () => {
    setIsLoading(true);
    try {
      const response = await api.get<{ club: Club }>(`/clubs/${params.id}`, {
        requiresAuth: false,
      });
      setClub(response.club);
    } catch (error) {
      if (error instanceof ApiError) {
        addToast({
          title: "Error",
          description: error.message,
          variant: "destructive",
        });
        router.push("/clubs");
      }
    } finally {
      setIsLoading(false);
    }
  };

  const handleDelete = async () => {
    setIsDeleting(true);
    try {
      await api.delete(`/clubs/${params.id}`);

      addToast({
        title: "Club eliminado",
        description: "El club ha sido eliminado correctamente",
        variant: "success",
      });

      router.push("/clubs");
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

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <p className="text-lg">Cargando...</p>
      </div>
    );
  }

  if (!club) {
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
              <Link href="/clubs">
                <Button variant="outline">Volver a Clubes</Button>
              </Link>
              {canManage && (
                <Link href={`/clubs/${club.id}/manage`}>
                  <Button>Gestionar Club</Button>
                </Link>
              )}
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Club Header */}
        <div className="bg-white rounded-lg shadow-sm p-8 mb-6">
          <div className="flex items-start justify-between mb-4">
            <div className="flex-1">
              <h2 className="text-4xl font-bold mb-2">{club.name}</h2>
              <p className="text-xl text-muted-foreground flex items-center gap-2">
                📍 {club.city}
              </p>
            </div>
            {club.logo && (
              <img
                src={club.logo}
                alt={`Logo de ${club.name}`}
                className="w-24 h-24 rounded-lg object-cover"
              />
            )}
          </div>

          {club.description && (
            <p className="text-muted-foreground mb-6">{club.description}</p>
          )}

          <div className="flex gap-2 flex-wrap mb-6">
            {club._count && (
              <>
                <Badge variant="secondary">
                  👥 {club._count.memberships} miembros
                </Badge>
                <Badge variant="secondary">
                  🎾 {club._count.courts} pistas
                </Badge>
                <Badge variant="secondary">
                  📅 {club._count.events} eventos
                </Badge>
              </>
            )}
          </div>

          {canManage && (
            <div className="flex gap-2">
              <Link href={`/clubs/${club.id}/edit`}>
                <Button variant="outline">Editar Información</Button>
              </Link>
              <Link href={`/clubs/${club.id}/members`}>
                <Button variant="outline">Gestionar Miembros</Button>
              </Link>
              <Button
                variant="destructive"
                onClick={() => setShowDeleteDialog(true)}
              >
                Eliminar Club
              </Button>
            </div>
          )}
        </div>

        {/* Information Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Contact Information */}
          <Card>
            <CardHeader>
              <CardTitle>Información de Contacto</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div>
                <p className="text-sm font-medium text-muted-foreground">
                  Dirección
                </p>
                <p>{club.address}</p>
              </div>
              {club.phone && (
                <div>
                  <p className="text-sm font-medium text-muted-foreground">
                    Teléfono
                  </p>
                  <p>{club.phone}</p>
                </div>
              )}
              {club.email && (
                <div>
                  <p className="text-sm font-medium text-muted-foreground">
                    Email
                  </p>
                  <a
                    href={`mailto:${club.email}`}
                    className="text-primary hover:underline"
                  >
                    {club.email}
                  </a>
                </div>
              )}
              {club.website && (
                <div>
                  <p className="text-sm font-medium text-muted-foreground">
                    Sitio Web
                  </p>
                  <a
                    href={club.website}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-primary hover:underline"
                  >
                    {club.website}
                  </a>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Creator Information */}
          {club.creator && (
            <Card>
              <CardHeader>
                <CardTitle>Información del Creador</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div>
                  <p className="text-sm font-medium text-muted-foreground">
                    Nombre
                  </p>
                  <p>{club.creator.name}</p>
                </div>
                <div>
                  <p className="text-sm font-medium text-muted-foreground">
                    Email
                  </p>
                  <p>{club.creator.email}</p>
                </div>
                <div>
                  <p className="text-sm font-medium text-muted-foreground">
                    Fecha de Creación
                  </p>
                  <p>{new Date(club.createdAt).toLocaleDateString("es-ES")}</p>
                </div>
              </CardContent>
            </Card>
          )}
        </div>
      </main>

      {/* Delete Confirmation Dialog */}
      <Dialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>¿Eliminar Club?</DialogTitle>
            <DialogDescription>
              Esta acción no se puede deshacer. Se eliminarán todos los datos
              asociados: miembros, eventos, pistas y suscripciones.
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
              {isDeleting ? "Eliminando..." : "Eliminar Club"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
