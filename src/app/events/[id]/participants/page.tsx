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
  Table,
  TableBody,
  TableCaption,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { useToast } from "@/components/ui/use-toast";
import { api, ApiError } from "@/lib/api";
import type { EventParticipant, ParticipantsResponse } from "@/types/event";

interface EventParticipantsPageProps {
  params: Promise<{
    id: string;
  }>;
}

export default function EventParticipantsPage({
  params,
}: EventParticipantsPageProps) {
  const router = useRouter();
  const { data: session, status } = useSession();
  const { addToast } = useToast();

  const [eventId, setEventId] = useState<string | null>(null);
  const [participants, setParticipants] = useState<EventParticipant[]>([]);
  const [eventInfo, setEventInfo] = useState<{
    id: string;
    title: string;
    maxParticipants?: number | null;
  } | null>(null);
  const [stats, setStats] = useState<{
    total: number;
    checkedIn: number;
    notCheckedIn: number;
  } | null>(null);
  const [pagination, setPagination] = useState({
    page: 1,
    limit: 20,
    totalCount: 0,
    totalPages: 0,
    hasNextPage: false,
    hasPreviousPage: false,
  });

  const [isLoading, setIsLoading] = useState(true);
  const [checkedInFilter, setCheckedInFilter] = useState<boolean | null>(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [showCheckInDialog, setShowCheckInDialog] = useState(false);
  const [selectedParticipant, setSelectedParticipant] =
    useState<EventParticipant | null>(null);
  const [isActionLoading, setIsActionLoading] = useState(false);

  useEffect(() => {
    if (status === "unauthenticated") {
      router.push("/auth/signin");
    }
  }, [status, router]);

  useEffect(() => {
    params.then((resolvedParams) => {
      setEventId(resolvedParams.id);
    });
  }, [params]);

  useEffect(() => {
    if (eventId && status === "authenticated") {
      fetchParticipants();
    }
  }, [eventId, status, pagination.page, checkedInFilter]);

  const fetchParticipants = async () => {
    if (!eventId) return;

    setIsLoading(true);
    try {
      const queryParams = new URLSearchParams({
        page: pagination.page.toString(),
        limit: pagination.limit.toString(),
      });

      if (checkedInFilter !== null) {
        queryParams.append("checkedIn", checkedInFilter.toString());
      }

      const response = await api.get<ParticipantsResponse>(
        `/events/${eventId}/participants?${queryParams.toString()}`
      );

      setParticipants(response.participants);
      setEventInfo(response.event);
      setStats(response.stats);
      setPagination(response.pagination);
    } catch (error) {
      if (error instanceof ApiError) {
        if (error.status === 403) {
          addToast({
            title: "Acceso denegado",
            description: "No tienes permisos para ver los participantes.",
            variant: "destructive",
          });
          router.push(`/events/${eventId}`);
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

  const handleCheckIn = async (participant: EventParticipant) => {
    if (!eventId) return;

    setIsActionLoading(true);
    try {
      await api.post(`/events/${eventId}/checkin`, {
        userId: participant.userId,
      });

      addToast({
        title: "Check-in realizado",
        description: `Check-in realizado para ${participant.user.name}`,
        variant: "success",
      });

      setShowCheckInDialog(false);
      setSelectedParticipant(null);
      fetchParticipants();
    } catch (error) {
      if (error instanceof ApiError) {
        addToast({
          title: "Error",
          description: error.message,
          variant: "destructive",
        });
      }
    } finally {
      setIsActionLoading(false);
    }
  };

  const handleUndoCheckIn = async (participant: EventParticipant) => {
    if (!eventId) return;

    setIsActionLoading(true);
    try {
      await api.delete(
        `/events/${eventId}/checkin?userId=${participant.userId}`
      );

      addToast({
        title: "Check-in deshecho",
        description: `Check-in deshecho para ${participant.user.name}`,
        variant: "success",
      });

      fetchParticipants();
    } catch (error) {
      if (error instanceof ApiError) {
        addToast({
          title: "Error",
          description: error.message,
          variant: "destructive",
        });
      }
    } finally {
      setIsActionLoading(false);
    }
  };

  const filteredParticipants = participants.filter(
    (participant) =>
      participant.user.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      participant.user.email.toLowerCase().includes(searchTerm.toLowerCase())
  );

  if (status === "loading" || isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <p className="text-lg">Cargando participantes...</p>
      </div>
    );
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
              <Link href={`/events/${eventId}`}>
                <Button variant="outline">Volver al Evento</Button>
              </Link>
              <Link href={`/events/${eventId}/manage`}>
                <Button variant="outline">Gestionar Evento</Button>
              </Link>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Page Header */}
        <div className="mb-8">
          <h2 className="text-3xl font-bold mb-2">Participantes</h2>
          <p className="text-muted-foreground">{eventInfo?.title}</p>
        </div>

        {/* Stats */}
        {stats && (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
            <Card>
              <CardHeader>
                <CardTitle className="text-sm font-medium text-muted-foreground">
                  Total Inscritos
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-3xl font-bold">
                  {stats.total}
                  {eventInfo?.maxParticipants &&
                    ` / ${eventInfo.maxParticipants}`}
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="text-sm font-medium text-muted-foreground">
                  Check-in Realizados
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-3xl font-bold text-green-600">
                  {stats.checkedIn}
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="text-sm font-medium text-muted-foreground">
                  Pendientes de Check-in
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-3xl font-bold text-yellow-600">
                  {stats.notCheckedIn}
                </p>
              </CardContent>
            </Card>
          </div>
        )}

        {/* Filters */}
        <Card className="mb-6">
          <CardHeader>
            <CardTitle>Filtros</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex flex-col md:flex-row gap-4">
              <div className="flex-1">
                <Input
                  placeholder="Buscar por nombre o email..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
              </div>
              <div className="flex gap-2">
                <Button
                  variant={checkedInFilter === null ? "default" : "outline"}
                  onClick={() => setCheckedInFilter(null)}
                >
                  Todos
                </Button>
                <Button
                  variant={checkedInFilter === true ? "default" : "outline"}
                  onClick={() => setCheckedInFilter(true)}
                >
                  Con Check-in
                </Button>
                <Button
                  variant={checkedInFilter === false ? "default" : "outline"}
                  onClick={() => setCheckedInFilter(false)}
                >
                  Sin Check-in
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Participants Table */}
        <Card>
          <CardHeader>
            <CardTitle>
              Lista de Participantes ({filteredParticipants.length})
            </CardTitle>
            <CardDescription>
              Gestiona los participantes inscritos en el evento
            </CardDescription>
          </CardHeader>
          <CardContent>
            {filteredParticipants.length === 0 ? (
              <div className="text-center py-12">
                <p className="text-muted-foreground">
                  {searchTerm
                    ? "No se encontraron participantes con ese criterio"
                    : "No hay participantes inscritos aún"}
                </p>
              </div>
            ) : (
              <Table>
                <TableCaption>
                  Mostrando {filteredParticipants.length} de{" "}
                  {pagination.totalCount} participantes
                </TableCaption>
                <TableHeader>
                  <TableRow>
                    <TableHead>Nombre</TableHead>
                    <TableHead>Email</TableHead>
                    <TableHead>Ciudad</TableHead>
                    <TableHead>DUPR Rating</TableHead>
                    <TableHead>Inscrito</TableHead>
                    <TableHead>Check-in</TableHead>
                    <TableHead className="text-right">Acciones</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredParticipants.map((participant) => (
                    <TableRow key={participant.id}>
                      <TableCell className="font-medium">
                        {participant.user.name}
                      </TableCell>
                      <TableCell>{participant.user.email}</TableCell>
                      <TableCell>{participant.user.city || "-"}</TableCell>
                      <TableCell>
                        {participant.user.duprRating ? (
                          <Badge variant="secondary">
                            {participant.user.duprRating.toFixed(2)}
                          </Badge>
                        ) : (
                          "-"
                        )}
                      </TableCell>
                      <TableCell>
                        {new Date(participant.registeredAt).toLocaleDateString(
                          "es-ES",
                          { day: "2-digit", month: "short", year: "numeric" }
                        )}
                      </TableCell>
                      <TableCell>
                        {participant.checkedIn ? (
                          <Badge variant="success">
                            ✓{" "}
                            {new Date(
                              participant.checkedInAt!
                            ).toLocaleTimeString("es-ES", {
                              hour: "2-digit",
                              minute: "2-digit",
                            })}
                          </Badge>
                        ) : (
                          <Badge variant="outline">Pendiente</Badge>
                        )}
                      </TableCell>
                      <TableCell className="text-right">
                        {participant.checkedIn ? (
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handleUndoCheckIn(participant)}
                            disabled={isActionLoading}
                          >
                            Deshacer Check-in
                          </Button>
                        ) : (
                          <Button
                            size="sm"
                            onClick={() => {
                              setSelectedParticipant(participant);
                              setShowCheckInDialog(true);
                            }}
                            disabled={isActionLoading}
                          >
                            Hacer Check-in
                          </Button>
                        )}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            )}

            {/* Pagination */}
            {pagination.totalPages > 1 && (
              <div className="flex items-center justify-between mt-4">
                <p className="text-sm text-muted-foreground">
                  Página {pagination.page} de {pagination.totalPages}
                </p>
                <div className="flex gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() =>
                      setPagination((prev) => ({
                        ...prev,
                        page: prev.page - 1,
                      }))
                    }
                    disabled={!pagination.hasPreviousPage}
                  >
                    Anterior
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() =>
                      setPagination((prev) => ({
                        ...prev,
                        page: prev.page + 1,
                      }))
                    }
                    disabled={!pagination.hasNextPage}
                  >
                    Siguiente
                  </Button>
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      </main>

      {/* Check-in Confirmation Dialog */}
      <Dialog open={showCheckInDialog} onOpenChange={setShowCheckInDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Confirmar Check-in</DialogTitle>
            <DialogDescription>
              ¿Confirmas el check-in para {selectedParticipant?.user.name}?
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => {
                setShowCheckInDialog(false);
                setSelectedParticipant(null);
              }}
              disabled={isActionLoading}
            >
              Cancelar
            </Button>
            <Button
              onClick={() =>
                selectedParticipant && handleCheckIn(selectedParticipant)
              }
              disabled={isActionLoading}
            >
              {isActionLoading ? "Procesando..." : "Confirmar Check-in"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
