"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useSession } from "next-auth/react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useToast } from "@/components/ui/use-toast";
import { api, ApiError } from "@/lib/api";
import type {
  MembersResponse,
  ClubMembership,
  UpdateMembershipData,
} from "@/types/club";

interface MembersPageProps {
  params: {
    id: string;
  };
}

export default function MembersPage({ params }: MembersPageProps) {
  const router = useRouter();
  const { data: session, status } = useSession();
  const { addToast } = useToast();

  const [data, setData] = useState<MembersResponse | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [showAddDialog, setShowAddDialog] = useState(false);
  const [showUpdateDialog, setShowUpdateDialog] = useState(false);
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [selectedMember, setSelectedMember] = useState<ClubMembership | null>(
    null
  );
  const [isProcessing, setIsProcessing] = useState(false);

  // Form states
  const [newMemberUserId, setNewMemberUserId] = useState("");
  const [newMemberStatus, setNewMemberStatus] = useState<"ACTIVE" | "PENDING">(
    "PENDING"
  );
  const [updateStatus, setUpdateStatus] = useState<
    "ACTIVE" | "INACTIVE" | "PENDING" | "CANCELLED"
  >("ACTIVE");

  useEffect(() => {
    if (status === "unauthenticated") {
      router.push("/auth/signin");
      return;
    }

    if (status === "authenticated") {
      fetchMembers();
    }
  }, [status, params.id]);

  const fetchMembers = async () => {
    setIsLoading(true);
    try {
      const response = await api.get<MembersResponse>(
        `/clubs/${params.id}/members?limit=50`
      );
      setData(response);
    } catch (error) {
      if (error instanceof ApiError) {
        if (error.status === 403) {
          addToast({
            title: "Acceso Denegado",
            description: "No tienes permisos para ver los miembros",
            variant: "destructive",
          });
          router.push(`/clubs/${params.id}`);
        } else {
          addToast({
            title: "Error",
            description: error.message,
            variant: "destructive",
          });
        }
      }
    } finally {
      setIsLoading(false);
    }
  };

  const handleAddMember = async () => {
    if (!newMemberUserId) {
      addToast({
        title: "Error",
        description: "Debes ingresar un ID de usuario",
        variant: "destructive",
      });
      return;
    }

    setIsProcessing(true);
    try {
      await api.post(`/clubs/${params.id}/members`, {
        userId: newMemberUserId,
        status: newMemberStatus,
      });

      addToast({
        title: "¡Éxito!",
        description: "Miembro agregado correctamente",
        variant: "success",
      });

      setShowAddDialog(false);
      setNewMemberUserId("");
      setNewMemberStatus("PENDING");
      fetchMembers();
    } catch (error) {
      if (error instanceof ApiError) {
        addToast({
          title: "Error",
          description: error.message,
          variant: "destructive",
        });
      }
    } finally {
      setIsProcessing(false);
    }
  };

  const handleUpdateMember = async () => {
    if (!selectedMember) return;

    setIsProcessing(true);
    try {
      const updateData: UpdateMembershipData = {
        status: updateStatus,
      };

      await api.put(
        `/clubs/${params.id}/members?userId=${selectedMember.userId}`,
        updateData
      );

      addToast({
        title: "¡Éxito!",
        description: "Membresía actualizada correctamente",
        variant: "success",
      });

      setShowUpdateDialog(false);
      setSelectedMember(null);
      fetchMembers();
    } catch (error) {
      if (error instanceof ApiError) {
        addToast({
          title: "Error",
          description: error.message,
          variant: "destructive",
        });
      }
    } finally {
      setIsProcessing(false);
    }
  };

  const handleDeleteMember = async () => {
    if (!selectedMember) return;

    setIsProcessing(true);
    try {
      await api.delete(
        `/clubs/${params.id}/members?userId=${selectedMember.userId}`
      );

      addToast({
        title: "Miembro eliminado",
        description: "El miembro ha sido removido del club",
        variant: "success",
      });

      setShowDeleteDialog(false);
      setSelectedMember(null);
      fetchMembers();
    } catch (error) {
      if (error instanceof ApiError) {
        addToast({
          title: "Error",
          description: error.message,
          variant: "destructive",
        });
      }
    } finally {
      setIsProcessing(false);
    }
  };

  const openUpdateDialog = (member: ClubMembership) => {
    setSelectedMember(member);
    setUpdateStatus(member.status);
    setShowUpdateDialog(true);
  };

  const openDeleteDialog = (member: ClubMembership) => {
    setSelectedMember(member);
    setShowDeleteDialog(true);
  };

  const getStatusBadge = (status: string) => {
    const variants: Record<
      string,
      "success" | "warning" | "outline" | "destructive"
    > = {
      ACTIVE: "success",
      PENDING: "warning",
      INACTIVE: "outline",
      CANCELLED: "destructive",
    };
    return <Badge variant={variants[status] || "outline"}>{status}</Badge>;
  };

  if (status === "loading" || isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <p className="text-lg">Cargando...</p>
      </div>
    );
  }

  if (!session || !data) {
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
            <Link href={`/clubs/${params.id}`}>
              <Button variant="outline">Volver al Club</Button>
            </Link>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <Card>
          <CardHeader>
            <div className="flex justify-between items-center">
              <div>
                <CardTitle>Miembros de {data.club.name}</CardTitle>
                <CardDescription>
                  Gestiona los miembros y sus estados de membresía
                </CardDescription>
              </div>
              <Button onClick={() => setShowAddDialog(true)}>
                Agregar Miembro
              </Button>
            </div>
          </CardHeader>
          <CardContent>
            {data.members.length === 0 ? (
              <div className="text-center py-12">
                <p className="text-muted-foreground mb-4">
                  No hay miembros en este club todavía
                </p>
                <Button onClick={() => setShowAddDialog(true)}>
                  Agregar Primer Miembro
                </Button>
              </div>
            ) : (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Nombre</TableHead>
                    <TableHead>Email</TableHead>
                    <TableHead>Ciudad</TableHead>
                    <TableHead>DUPR</TableHead>
                    <TableHead>Estado</TableHead>
                    <TableHead>Fecha Ingreso</TableHead>
                    <TableHead className="text-right">Acciones</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {data.members.map((member) => (
                    <TableRow key={member.id}>
                      <TableCell className="font-medium">
                        {member.user.name}
                      </TableCell>
                      <TableCell>{member.user.email}</TableCell>
                      <TableCell>{member.user.city || "-"}</TableCell>
                      <TableCell>
                        {member.user.duprRating
                          ? member.user.duprRating.toFixed(2)
                          : "-"}
                      </TableCell>
                      <TableCell>{getStatusBadge(member.status)}</TableCell>
                      <TableCell>
                        {new Date(member.joinedAt).toLocaleDateString("es-ES")}
                      </TableCell>
                      <TableCell className="text-right">
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button variant="outline" size="sm">
                              Acciones
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end">
                            <DropdownMenuLabel>Gestionar</DropdownMenuLabel>
                            <DropdownMenuSeparator />
                            <DropdownMenuItem
                              onClick={() => openUpdateDialog(member)}
                            >
                              Cambiar Estado
                            </DropdownMenuItem>
                            <DropdownMenuItem
                              className="text-red-600"
                              onClick={() => openDeleteDialog(member)}
                            >
                              Eliminar Miembro
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            )}
          </CardContent>
        </Card>
      </main>

      {/* Add Member Dialog */}
      <Dialog open={showAddDialog} onOpenChange={setShowAddDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Agregar Miembro</DialogTitle>
            <DialogDescription>
              Ingresa el ID del usuario que deseas agregar al club
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="userId">ID del Usuario</Label>
              <Input
                id="userId"
                placeholder="clp1234567890"
                value={newMemberUserId}
                onChange={(e) => setNewMemberUserId(e.target.value)}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="status">Estado Inicial</Label>
              <select
                id="status"
                className="w-full h-10 rounded-md border border-input bg-background px-3 py-2 text-sm"
                value={newMemberStatus}
                onChange={(e) =>
                  setNewMemberStatus(e.target.value as "ACTIVE" | "PENDING")
                }
              >
                <option value="PENDING">PENDING</option>
                <option value="ACTIVE">ACTIVE</option>
              </select>
            </div>
          </div>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setShowAddDialog(false)}
              disabled={isProcessing}
            >
              Cancelar
            </Button>
            <Button onClick={handleAddMember} disabled={isProcessing}>
              {isProcessing ? "Agregando..." : "Agregar Miembro"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Update Member Dialog */}
      <Dialog open={showUpdateDialog} onOpenChange={setShowUpdateDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Actualizar Membresía</DialogTitle>
            <DialogDescription>
              Cambia el estado de la membresía de {selectedMember?.user.name}
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="updateStatus">Nuevo Estado</Label>
              <select
                id="updateStatus"
                className="w-full h-10 rounded-md border border-input bg-background px-3 py-2 text-sm"
                value={updateStatus}
                onChange={(e) => setUpdateStatus(e.target.value as any)}
              >
                <option value="ACTIVE">ACTIVE</option>
                <option value="PENDING">PENDING</option>
                <option value="INACTIVE">INACTIVE</option>
                <option value="CANCELLED">CANCELLED</option>
              </select>
            </div>
          </div>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setShowUpdateDialog(false)}
              disabled={isProcessing}
            >
              Cancelar
            </Button>
            <Button onClick={handleUpdateMember} disabled={isProcessing}>
              {isProcessing ? "Actualizando..." : "Actualizar"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete Member Dialog */}
      <Dialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>¿Eliminar Miembro?</DialogTitle>
            <DialogDescription>
              ¿Estás seguro de que deseas eliminar a {selectedMember?.user.name}{" "}
              del club? Esta acción no se puede deshacer.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setShowDeleteDialog(false)}
              disabled={isProcessing}
            >
              Cancelar
            </Button>
            <Button
              variant="destructive"
              onClick={handleDeleteMember}
              disabled={isProcessing}
            >
              {isProcessing ? "Eliminando..." : "Eliminar Miembro"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
