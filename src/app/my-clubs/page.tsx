"use client";

import { useState, useEffect } from "react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
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

interface ClubMembership {
  id: string;
  status: "ACTIVE" | "INACTIVE" | "PENDING" | "CANCELLED";
  joinedAt: string;
  expiresAt?: string | null;
  club: {
    id: string;
    name: string;
    description?: string | null;
    city: string;
    logo?: string | null;
    _count: {
      memberships: number;
      events: number;
      courts: number;
    };
  };
}

interface MembershipsResponse {
  memberships: ClubMembership[];
  pagination: {
    page: number;
    limit: number;
    totalCount: number;
    totalPages: number;
    hasNextPage: boolean;
    hasPreviousPage: boolean;
  };
}

export default function MyClubsPage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const { addToast } = useToast();

  const [memberships, setMemberships] = useState<ClubMembership[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedTab, setSelectedTab] = useState<"ACTIVE" | "PENDING" | "ALL">(
    "ACTIVE"
  );
  const [leaveDialogOpen, setLeaveDialogOpen] = useState(false);
  const [selectedClub, setSelectedClub] = useState<ClubMembership | null>(null);
  const [isLeaving, setIsLeaving] = useState(false);

  useEffect(() => {
    if (status === "unauthenticated") {
      router.push("/auth/signin");
      return;
    }

    if (status === "authenticated") {
      fetchMemberships();
    }
  }, [status, router]);

  const fetchMemberships = async () => {
    try {
      setIsLoading(true);
      const response = await api.get<MembershipsResponse>("/users/memberships");
      setMemberships(response.memberships);
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

  const handleLeaveClub = async () => {
    if (!selectedClub) return;

    setIsLeaving(true);
    try {
      await api.delete(`/clubs/${selectedClub.club.id}/join`);

      addToast({
        title: "Éxito",
        description:
          selectedClub.status === "PENDING"
            ? "Solicitud cancelada correctamente"
            : "Has salido del club correctamente",
        variant: "success",
      });

      setLeaveDialogOpen(false);
      setSelectedClub(null);
      fetchMemberships();
    } catch (error) {
      if (error instanceof ApiError) {
        addToast({
          title: "Error",
          description: error.message,
          variant: "destructive",
        });
      }
    } finally {
      setIsLeaving(false);
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "ACTIVE":
        return <Badge variant="success">Activo</Badge>;
      case "PENDING":
        return <Badge variant="warning">Pendiente</Badge>;
      case "INACTIVE":
        return <Badge variant="outline">Inactivo</Badge>;
      case "CANCELLED":
        return <Badge variant="destructive">Cancelado</Badge>;
      default:
        return <Badge>{status}</Badge>;
    }
  };

  const filteredMemberships = memberships.filter((m) =>
    selectedTab === "ALL" ? true : m.status === selectedTab
  );

  if (status === "loading" || isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <p className="text-lg">Cargando...</p>
      </div>
    );
  }

  if (!session) {
    return null;
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-4">
            <div>
              <h1 className="text-2xl font-bold">Mis Clubes</h1>
              <p className="text-sm text-muted-foreground">
                Gestiona tus membresías de clubes
              </p>
            </div>
            <div className="flex gap-2">
              <Button variant="outline" onClick={() => router.push("/clubs")}>
                Explorar Clubes
              </Button>
              <Button
                variant="outline"
                onClick={() => router.push("/dashboard")}
              >
                Dashboard
              </Button>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Tabs */}
        <div className="flex gap-2 mb-6">
          <Button
            variant={selectedTab === "ACTIVE" ? "default" : "outline"}
            onClick={() => setSelectedTab("ACTIVE")}
          >
            Activos ({memberships.filter((m) => m.status === "ACTIVE").length})
          </Button>
          <Button
            variant={selectedTab === "PENDING" ? "default" : "outline"}
            onClick={() => setSelectedTab("PENDING")}
          >
            Pendientes (
            {memberships.filter((m) => m.status === "PENDING").length})
          </Button>
          <Button
            variant={selectedTab === "ALL" ? "default" : "outline"}
            onClick={() => setSelectedTab("ALL")}
          >
            Todos ({memberships.length})
          </Button>
        </div>

        {/* Lista de Membresías */}
        {filteredMemberships.length === 0 ? (
          <Card>
            <CardContent className="py-12 text-center">
              <p className="text-muted-foreground mb-4">
                {selectedTab === "ACTIVE"
                  ? "No tienes membresías activas"
                  : selectedTab === "PENDING"
                  ? "No tienes solicitudes pendientes"
                  : "No tienes membresías"}
              </p>
              <Button onClick={() => router.push("/clubs")}>
                Explorar Clubes
              </Button>
            </CardContent>
          </Card>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredMemberships.map((membership) => (
              <Card key={membership.id}>
                <CardHeader>
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <CardTitle className="text-lg">
                        {membership.club.name}
                      </CardTitle>
                      <CardDescription className="mt-1">
                        {membership.club.city}
                      </CardDescription>
                    </div>
                    {membership.club.logo && (
                      <img
                        src={membership.club.logo}
                        alt={membership.club.name}
                        className="w-12 h-12 rounded-lg object-cover"
                      />
                    )}
                  </div>
                  <div className="mt-2">
                    {getStatusBadge(membership.status)}
                  </div>
                </CardHeader>
                <CardContent>
                  {membership.club.description && (
                    <p className="text-sm text-muted-foreground mb-4 line-clamp-2">
                      {membership.club.description}
                    </p>
                  )}

                  <div className="flex gap-4 text-sm text-muted-foreground mb-4">
                    <div>
                      <span className="font-semibold">
                        {membership.club._count.memberships}
                      </span>{" "}
                      miembros
                    </div>
                    <div>
                      <span className="font-semibold">
                        {membership.club._count.courts}
                      </span>{" "}
                      pistas
                    </div>
                    <div>
                      <span className="font-semibold">
                        {membership.club._count.events}
                      </span>{" "}
                      eventos
                    </div>
                  </div>

                  <div className="text-xs text-muted-foreground mb-4">
                    Miembro desde:{" "}
                    {new Date(membership.joinedAt).toLocaleDateString("es-ES")}
                  </div>

                  <div className="flex gap-2">
                    <Link
                      href={`/clubs/${membership.club.id}`}
                      className="flex-1"
                    >
                      <Button variant="outline" className="w-full">
                        Ver Club
                      </Button>
                    </Link>
                    {membership.status !== "CANCELLED" && (
                      <Button
                        variant="destructive"
                        size="sm"
                        onClick={() => {
                          setSelectedClub(membership);
                          setLeaveDialogOpen(true);
                        }}
                      >
                        {membership.status === "PENDING" ? "Cancelar" : "Salir"}
                      </Button>
                    )}
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </main>

      {/* Dialog de Confirmación */}
      <Dialog open={leaveDialogOpen} onOpenChange={setLeaveDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>
              {selectedClub?.status === "PENDING"
                ? "¿Cancelar solicitud?"
                : "¿Salir del club?"}
            </DialogTitle>
            <DialogDescription>
              {selectedClub?.status === "PENDING"
                ? `¿Estás seguro de que quieres cancelar tu solicitud para unirte a "${selectedClub?.club.name}"?`
                : `¿Estás seguro de que quieres salir de "${selectedClub?.club.name}"? Perderás acceso a todos los eventos y recursos del club.`}
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setLeaveDialogOpen(false)}
              disabled={isLeaving}
            >
              Cancelar
            </Button>
            <Button
              variant="destructive"
              onClick={handleLeaveClub}
              disabled={isLeaving}
            >
              {isLeaving ? "Procesando..." : "Confirmar"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
