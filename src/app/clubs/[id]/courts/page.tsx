"use client";

import { useEffect, useState } from "react";
import { useRouter, useParams } from "next/navigation";
import { useSession } from "next-auth/react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { CourtCard } from "@/components/courts/CourtCard";
import { CourtForm } from "@/components/courts/CourtForm";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { api, ApiError } from "@/lib/api";
import { Court, CourtsResponse } from "@/types/court";
import { Club } from "@/types/club";
import { useToast } from "@/components/ui/use-toast";
import { Badge } from "@/components/ui/badge";

export default function ClubCourtsPage() {
  const params = useParams();
  const clubId = params.id as string;
  const router = useRouter();
  const { data: session, status } = useSession();
  const { addToast } = useToast();

  const [courtsData, setCourtsData] = useState<CourtsResponse | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [canManage, setCanManage] = useState(false);

  // Estados para diálogos
  const [createDialogOpen, setCreateDialogOpen] = useState(false);
  const [editDialogOpen, setEditDialogOpen] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [selectedCourt, setSelectedCourt] = useState<Court | null>(null);
  const [isDeletingCourt, setIsDeletingCourt] = useState(false);

  const fetchCourts = async () => {
    setIsLoading(true);
    setError(null);

    try {
      // Obtener las pistas
      const data = await api.get<CourtsResponse>(`/clubs/${clubId}/courts`, {
        requiresAuth: false,
      });
      setCourtsData(data);

      // Verificar si el usuario puede gestionar el club
      if (session?.user) {
        const clubResponse = await api.get<{ club: Club }>(`/clubs/${clubId}`, {
          requiresAuth: false,
        });
        const isCreator = clubResponse.club.creatorId === session.user.id;
        const isSuperAdmin = session.user.role === "SUPER_ADMIN";
        setCanManage(isCreator || isSuperAdmin);

        console.log("=== DEBUG PERMISOS ===");
        console.log("User ID:", session.user.id);
        console.log("Creator ID:", clubResponse.club.creatorId);
        console.log("Is Creator:", isCreator);
        console.log("Is Super Admin:", isSuperAdmin);
        console.log("Can Manage:", isCreator || isSuperAdmin);
      }
    } catch (err) {
      console.error("Error fetching courts:", err);
      setError(
        err instanceof ApiError ? err.message : "Error al cargar las pistas"
      );
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    // Solo ejecutar cuando la sesión esté definida o cuando no haya sesión (loading completo)
    if (status === "loading") return;

    fetchCourts();
  }, [clubId, session, status]);

  const handleEdit = (court: Court) => {
    setSelectedCourt(court);
    setEditDialogOpen(true);
  };

  const handleToggleActive = async (court: Court) => {
    try {
      await api.put(`/clubs/${clubId}/courts/${court.id}`, {
        isActive: !court.isActive,
      });

      addToast({
        title: "Estado actualizado",
        description: `La pista ha sido ${
          !court.isActive ? "activada" : "desactivada"
        }`,
        variant: "success",
      });

      fetchCourts();
    } catch (error) {
      console.error("Error toggling court status:", error);
      addToast({
        title: "Error",
        description:
          error instanceof ApiError
            ? error.message
            : "No se pudo actualizar el estado de la pista",
        variant: "destructive",
      });
    }
  };

  const handleDeleteClick = (court: Court) => {
    setSelectedCourt(court);
    setDeleteDialogOpen(true);
  };

  const handleDeleteConfirm = async () => {
    if (!selectedCourt) return;

    setIsDeletingCourt(true);

    try {
      await api.delete(`/clubs/${clubId}/courts/${selectedCourt.id}`);

      addToast({
        title: "Pista eliminada",
        description: "La pista ha sido eliminada exitosamente",
        variant: "success",
      });

      setDeleteDialogOpen(false);
      setSelectedCourt(null);
      fetchCourts();
    } catch (error) {
      console.error("Error deleting court:", error);
      addToast({
        title: "Error",
        description:
          error instanceof ApiError
            ? error.message
            : "No se pudo eliminar la pista",
        variant: "destructive",
      });
    } finally {
      setIsDeletingCourt(false);
    }
  };

  const handleFormSuccess = () => {
    setCreateDialogOpen(false);
    setEditDialogOpen(false);
    setSelectedCourt(null);
    fetchCourts();
  };

  if (status === "loading" || isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <p className="text-lg">Cargando pistas...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 p-8">
        <div className="max-w-4xl mx-auto">
          <Alert variant="destructive">
            <AlertTitle>Error</AlertTitle>
            <AlertDescription>{error}</AlertDescription>
          </Alert>
          <Button onClick={() => router.back()} className="mt-4">
            Volver
          </Button>
        </div>
      </div>
    );
  }

  const activeCourts =
    courtsData?.courts.filter((court) => court.isActive) || [];
  const inactiveCourts =
    courtsData?.courts.filter((court) => !court.isActive) || [];

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-4">
            <div className="flex items-center gap-4">
              <Button variant="ghost" onClick={() => router.back()}>
                ← Volver
              </Button>
              <div>
                <h1 className="text-2xl font-bold">
                  Pistas de {courtsData?.club.name}
                </h1>
                <p className="text-sm text-muted-foreground">
                  {canManage
                    ? "Gestiona las pistas del club"
                    : "Visualiza las pistas disponibles"}
                </p>
              </div>
            </div>
            {canManage && (
              <Button onClick={() => setCreateDialogOpen(true)}>
                + Nueva Pista
              </Button>
            )}
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                Total de Pistas
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-3xl font-bold">
                {courtsData?.courts.length || 0}
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                Pistas Activas
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-3xl font-bold text-green-600">
                {activeCourts.length}
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                Pistas Inactivas
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-3xl font-bold text-gray-400">
                {inactiveCourts.length}
              </p>
            </CardContent>
          </Card>
        </div>

        {/* Pistas Activas */}
        {activeCourts.length > 0 && (
          <div className="mb-8">
            <h2 className="text-xl font-semibold mb-4 flex items-center gap-2">
              Pistas Activas
              <Badge variant="success">{activeCourts.length}</Badge>
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {activeCourts.map((court) => (
                <CourtCard
                  key={court.id}
                  court={court}
                  clubId={clubId}
                  canManage={canManage}
                  onEdit={handleEdit}
                  onToggleActive={handleToggleActive}
                  onDelete={handleDeleteClick}
                />
              ))}
            </div>
          </div>
        )}

        {/* Pistas Inactivas */}
        {inactiveCourts.length > 0 && (
          <div>
            <h2 className="text-xl font-semibold mb-4 flex items-center gap-2">
              Pistas Inactivas
              <Badge variant="outline">{inactiveCourts.length}</Badge>
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {inactiveCourts.map((court) => (
                <CourtCard
                  key={court.id}
                  court={court}
                  clubId={clubId}
                  canManage={canManage}
                  onEdit={handleEdit}
                  onToggleActive={handleToggleActive}
                  onDelete={handleDeleteClick}
                />
              ))}
            </div>
          </div>
        )}

        {/* Empty State */}
        {courtsData?.courts.length === 0 && (
          <Card>
            <CardContent className="text-center py-12">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                width="48"
                height="48"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
                className="mx-auto mb-4 text-muted-foreground"
              >
                <rect x="3" y="3" width="18" height="18" rx="2" ry="2"></rect>
                <line x1="3" y1="9" x2="21" y2="9"></line>
                <line x1="9" y1="21" x2="9" y2="9"></line>
              </svg>
              <h3 className="text-lg font-semibold mb-2">
                No hay pistas registradas
              </h3>
              <p className="text-muted-foreground mb-4">
                {canManage
                  ? "Comienza agregando la primera pista del club"
                  : "Este club aún no tiene pistas registradas"}
              </p>
              {canManage && (
                <Button onClick={() => setCreateDialogOpen(true)}>
                  + Crear Primera Pista
                </Button>
              )}
            </CardContent>
          </Card>
        )}
      </main>

      {/* Create Dialog */}
      <Dialog open={createDialogOpen} onOpenChange={setCreateDialogOpen}>
        <DialogContent className="max-h-[85vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Crear Nueva Pista</DialogTitle>
            <DialogDescription>
              Agrega una nueva pista al club {courtsData?.club.name}
            </DialogDescription>
          </DialogHeader>
          <CourtForm
            mode="create"
            clubId={clubId}
            onSuccess={handleFormSuccess}
          />
        </DialogContent>
      </Dialog>

      {/* Edit Dialog */}
      <Dialog open={editDialogOpen} onOpenChange={setEditDialogOpen}>
        <DialogContent className="max-h-[85vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Editar Pista</DialogTitle>
            <DialogDescription>
              Modifica la información de la pista
            </DialogDescription>
          </DialogHeader>
          {selectedCourt && (
            <CourtForm
              mode="edit"
              clubId={clubId}
              court={selectedCourt}
              onSuccess={handleFormSuccess}
            />
          )}
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation Dialog */}
      <Dialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>¿Eliminar pista?</DialogTitle>
            <DialogDescription>
              Esta acción no se puede deshacer. Se eliminará permanentemente la
              pista "{selectedCourt?.name}".
              {selectedCourt?._count &&
                (selectedCourt._count.events > 0 ||
                  selectedCourt._count.matches > 0) && (
                  <Alert variant="warning" className="mt-4">
                    <AlertDescription>
                      Esta pista tiene {selectedCourt._count.events} eventos y{" "}
                      {selectedCourt._count.matches} partidos registrados.
                    </AlertDescription>
                  </Alert>
                )}
            </DialogDescription>
          </DialogHeader>
          <div className="flex gap-4 mt-4">
            <Button
              variant="outline"
              onClick={() => setDeleteDialogOpen(false)}
              disabled={isDeletingCourt}
              className="flex-1"
            >
              Cancelar
            </Button>
            <Button
              variant="destructive"
              onClick={handleDeleteConfirm}
              disabled={isDeletingCourt}
              className="flex-1"
            >
              {isDeletingCourt ? "Eliminando..." : "Eliminar"}
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
