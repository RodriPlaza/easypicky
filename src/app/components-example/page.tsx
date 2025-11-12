"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { useToast } from "@/components/ui/use-toast";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
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
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Badge } from "@/components/ui/badge";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { LoginForm } from "@/components/auth/LoginForm";
import { RegisterForm } from "@/components/auth/RegisterForm";
import { ProfileForm } from "@/components/profile/ProfileForm";
import { ChangePasswordForm } from "@/components/profile/ChangePasswordForm";
import { ClubForm } from "@/components/clubs/ClubForm";
import { ClubCard } from "@/components/clubs/ClubCard";
import { CourtForm } from "@/components/courts/CourtForm";
import { CourtCard } from "@/components/courts/CourtCard";
import { EventForm } from "@/components/events/EventForm";
import { EventCard } from "@/components/events/EventCard";
import { MatchForm } from "@/components/matches/MatchForm";
import { MatchCard } from "@/components/matches/MatchCard";

export default function ComponentsExamplePage() {
  const { addToast } = useToast();
  const [dialogOpen, setDialogOpen] = useState(false);
  const [authDialogOpen, setAuthDialogOpen] = useState(false);
  const [authMode, setAuthMode] = useState<"login" | "register">("login");
  const [profileDialogOpen, setProfileDialogOpen] = useState(false);
  const [profileFormMode, setProfileFormMode] = useState<"edit" | "password">(
    "edit"
  );
  const [clubDialogOpen, setClubDialogOpen] = useState(false);
  const [clubFormMode, setClubFormMode] = useState<"create" | "edit">("create");
  const [courtDialogOpen, setCourtDialogOpen] = useState(false);
  const [courtFormMode, setCourtFormMode] = useState<"create" | "edit">(
    "create"
  );
  const [eventDialogOpen, setEventDialogOpen] = useState(false);
  const [eventFormMode, setEventFormMode] = useState<"create" | "edit">(
    "create"
  );
  const [matchDialogOpen, setMatchDialogOpen] = useState(false);
  const [matchFormMode, setMatchFormMode] = useState<"create" | "edit">(
    "create"
  );

  // Datos de ejemplo para la tabla
  const users = [
    {
      id: 1,
      name: "Juan Pérez",
      email: "juan@test.com",
      role: "USER",
      status: "ACTIVE",
    },
    {
      id: 2,
      name: "María García",
      email: "maria@test.com",
      role: "USER",
      status: "ACTIVE",
    },
    {
      id: 3,
      name: "Carlos López",
      email: "carlos@test.com",
      role: "SUPER_ADMIN",
      status: "ACTIVE",
    },
    {
      id: 4,
      name: "Ana Martínez",
      email: "ana@test.com",
      role: "USER",
      status: "INACTIVE",
    },
  ];

  // Mock user data para ProfileForm
  const mockUser = {
    id: "1",
    name: "Juan Pérez",
    email: "juan@test.com",
    phone: "+34 666 123 456",
    city: "Madrid",
    avatar: "https://i.pravatar.cc/150?img=1",
    duprId: "12345",
    duprRating: 4.5,
    role: "USER" as const,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  };

  // Mock club data
  const mockClub = {
    id: "1",
    name: "Club Pickleball Madrid",
    description: "El mejor club de pickleball en Madrid",
    address: "Calle Gran Vía 1",
    city: "Madrid",
    phone: "+34 666 777 888",
    email: "info@clubmadrid.com",
    website: "https://clubmadrid.com",
    logo: "https://placehold.co/100x100/0ea5e9/white?text=CPM",
    creatorId: "1",
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    _count: {
      memberships: 45,
      courts: 6,
      events: 12,
    },
  };

  // Mock court data
  const mockCourt = {
    id: "1",
    name: "Pista Central",
    description: "Pista principal con iluminación LED y superficie profesional",
    isActive: true,
    clubId: "1",
    _count: {
      events: 8,
      matches: 24,
    },
  };

  // Mock event data
  const mockEvent = {
    id: "1",
    title: "Torneo de Verano 2025",
    description:
      "Gran torneo de pickleball para todos los niveles. Premios para los ganadores y sorteos entre todos los participantes.",
    type: "TOURNAMENT" as const,
    visibility: "OPEN" as const,
    status: "SCHEDULED" as const,
    startDateTime: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000), // En 7 días
    endDateTime: new Date(
      Date.now() + 7 * 24 * 60 * 60 * 1000 + 4 * 60 * 60 * 1000
    ), // 4 horas después
    maxParticipants: 32,
    price: 15,
    clubId: "1",
    courtId: "1",
    createdAt: new Date(),
    updatedAt: new Date(),
    club: {
      id: "1",
      name: "Club Pickleball Madrid",
      city: "Madrid",
      logo: "https://placehold.co/100x100/0ea5e9/white?text=CPM",
      creatorId: "1",
    },
    court: {
      id: "1",
      name: "Pista Central",
    },
    _count: {
      participants: 18,
      matches: 0,
    },
    isParticipant: false,
    isCheckedIn: false,
    canCheckIn: false,
  };

  // Mock courts para el EventForm
  const mockCourtsForEvent = [
    { id: "1", name: "Pista Central", isActive: true },
    { id: "2", name: "Pista Norte", isActive: true },
    { id: "3", name: "Pista Sur", isActive: false },
  ];

  const mockMatch = {
    id: "1",
    matchType: "DOUBLES" as const,
    startTime: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(), // Hace 2 horas
    endTime: new Date(Date.now() - 1 * 60 * 60 * 1000).toISOString(), // Hace 1 hora
    score: "21-19,19-21,11-9",
    completed: true,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    creatorId: "1",
    courtId: "1",
    eventId: "1",
    creator: {
      id: "1",
      name: "Juan Pérez",
      email: "juan@test.com",
    },
    court: {
      id: "1",
      name: "Pista Central",
      clubId: "1",
      club: {
        id: "1",
        name: "Club Pickleball Madrid",
      },
    },
    event: {
      id: "1",
      title: "Torneo de Verano 2025",
      clubId: "1",
    },
    participants: [
      {
        id: "1",
        userId: "user1",
        matchId: "1",
        team: 1,
        isWinner: true,
        user: {
          id: "user1",
          name: "Carlos López",
          email: "carlos@test.com",
          avatar: null,
          duprRating: 4.5,
        },
      },
      {
        id: "2",
        userId: "user2",
        matchId: "1",
        team: 1,
        isWinner: true,
        user: {
          id: "user2",
          name: "Ana Martínez",
          email: "ana@test.com",
          avatar: null,
          duprRating: 4.2,
        },
      },
      {
        id: "3",
        userId: "user3",
        matchId: "1",
        team: 2,
        isWinner: false,
        user: {
          id: "user3",
          name: "María García",
          email: "maria@test.com",
          avatar: null,
          duprRating: 4.3,
        },
      },
      {
        id: "4",
        userId: "user4",
        matchId: "1",
        team: 2,
        isWinner: false,
        user: {
          id: "user4",
          name: "Pedro Sánchez",
          email: "pedro@test.com",
          avatar: null,
          duprRating: 4.0,
        },
      },
    ],
  };

  return (
    <div className="min-h-screen bg-gray-50 p-8">
      <div className="max-w-6xl mx-auto space-y-8">
        <div>
          <h1 className="text-4xl font-bold mb-2">Componentes UI</h1>
          <p className="text-muted-foreground">
            Ejemplos de todos los componentes base implementados
          </p>
        </div>

        {/* Formularios de Autenticación */}
        <Card>
          <CardHeader>
            <CardTitle>Formularios de Autenticación</CardTitle>
            <CardDescription>
              Formularios completos con validación usando React Hook Form y Zod
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-2">
            <div className="flex gap-2">
              <Button
                onClick={() => {
                  setAuthMode("login");
                  setAuthDialogOpen(true);
                }}
              >
                Ver Login Form
              </Button>
              <Button
                variant="outline"
                onClick={() => {
                  setAuthMode("register");
                  setAuthDialogOpen(true);
                }}
              >
                Ver Register Form
              </Button>
            </div>

            <Dialog open={authDialogOpen} onOpenChange={setAuthDialogOpen}>
              <DialogContent className="max-w-md">
                <DialogHeader>
                  <DialogTitle>
                    {authMode === "login" ? "Iniciar Sesión" : "Crear Cuenta"}
                  </DialogTitle>
                  <DialogDescription>
                    {authMode === "login"
                      ? "Ingresa tus credenciales para continuar"
                      : "Completa el formulario para registrarte"}
                  </DialogDescription>
                </DialogHeader>
                <div className="py-4">
                  {authMode === "login" ? <LoginForm /> : <RegisterForm />}
                </div>
              </DialogContent>
            </Dialog>
          </CardContent>
        </Card>

        {/* Formularios de Perfil */}
        <Card>
          <CardHeader>
            <CardTitle>Formularios de Perfil</CardTitle>
            <CardDescription>
              Formularios para editar perfil y cambiar contraseña
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-2">
            <div className="flex gap-2">
              <Button
                onClick={() => {
                  setProfileFormMode("edit");
                  setProfileDialogOpen(true);
                }}
              >
                Ver Profile Form
              </Button>
              <Button
                variant="outline"
                onClick={() => {
                  setProfileFormMode("password");
                  setProfileDialogOpen(true);
                }}
              >
                Ver Change Password Form
              </Button>
            </div>

            <Dialog
              open={profileDialogOpen}
              onOpenChange={setProfileDialogOpen}
            >
              <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
                <DialogHeader>
                  <DialogTitle>
                    {profileFormMode === "edit"
                      ? "Editar Perfil"
                      : "Cambiar Contraseña"}
                  </DialogTitle>
                  <DialogDescription>
                    {profileFormMode === "edit"
                      ? "Actualiza tu información personal"
                      : "Cambia tu contraseña de acceso"}
                  </DialogDescription>
                </DialogHeader>
                <div className="py-4">
                  {profileFormMode === "edit" ? (
                    <ProfileForm user={mockUser} />
                  ) : (
                    <ChangePasswordForm />
                  )}
                </div>
              </DialogContent>
            </Dialog>
          </CardContent>
        </Card>

        {/* Componentes de Clubes */}
        <Card>
          <CardHeader>
            <CardTitle>Componentes de Clubes</CardTitle>
            <CardDescription>
              Formularios y cards para gestión de clubes
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex gap-2">
              <Button
                onClick={() => {
                  setClubFormMode("create");
                  setClubDialogOpen(true);
                }}
              >
                Ver Club Form (Crear)
              </Button>
              <Button
                variant="outline"
                onClick={() => {
                  setClubFormMode("edit");
                  setClubDialogOpen(true);
                }}
              >
                Ver Club Form (Editar)
              </Button>
            </div>

            <Dialog open={clubDialogOpen} onOpenChange={setClubDialogOpen}>
              <DialogContent className="max-w-3xl max-h-[80vh] overflow-y-auto">
                <DialogHeader>
                  <DialogTitle>
                    {clubFormMode === "create" ? "Crear Club" : "Editar Club"}
                  </DialogTitle>
                  <DialogDescription>
                    {clubFormMode === "create"
                      ? "Completa el formulario para crear un nuevo club"
                      : "Actualiza la información del club"}
                  </DialogDescription>
                </DialogHeader>
                <div className="py-4">
                  <ClubForm
                    mode={clubFormMode}
                    club={clubFormMode === "edit" ? mockClub : undefined}
                  />
                </div>
              </DialogContent>
            </Dialog>

            <div>
              <h4 className="font-semibold mb-3">Club Card (Ejemplo)</h4>
              <div className="max-w-md">
                <ClubCard club={mockClub} membershipStatus="ACTIVE" />
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Componentes de Pistas */}
        <Card>
          <CardHeader>
            <CardTitle>Componentes de Pistas (Courts)</CardTitle>
            <CardDescription>
              Formularios y cards para gestión de pistas
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex gap-2">
              <Button
                onClick={() => {
                  setCourtFormMode("create");
                  setCourtDialogOpen(true);
                }}
              >
                Ver Court Form (Crear)
              </Button>
              <Button
                variant="outline"
                onClick={() => {
                  setCourtFormMode("edit");
                  setCourtDialogOpen(true);
                }}
              >
                Ver Court Form (Editar)
              </Button>
            </div>

            <Dialog open={courtDialogOpen} onOpenChange={setCourtDialogOpen}>
              <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
                <DialogHeader>
                  <DialogTitle>
                    {courtFormMode === "create"
                      ? "Crear Pista"
                      : "Editar Pista"}
                  </DialogTitle>
                  <DialogDescription>
                    {courtFormMode === "create"
                      ? "Completa el formulario para crear una nueva pista"
                      : "Actualiza la información de la pista"}
                  </DialogDescription>
                </DialogHeader>
                <div className="py-4">
                  <CourtForm
                    mode={courtFormMode}
                    clubId="1"
                    court={courtFormMode === "edit" ? mockCourt : undefined}
                  />
                </div>
              </DialogContent>
            </Dialog>

            <div>
              <h4 className="font-semibold mb-3">Court Card (Ejemplo)</h4>
              <div className="max-w-md">
                <CourtCard
                  court={mockCourt}
                  clubId="1"
                  canManage={true}
                  onEdit={(court) =>
                    addToast({
                      title: "Acción: Editar",
                      description: `Editar pista: ${court.name}`,
                      variant: "info",
                    })
                  }
                  onToggleActive={(court) =>
                    addToast({
                      title: "Acción: Toggle Active",
                      description: `Cambiar estado de: ${court.name}`,
                      variant: "info",
                    })
                  }
                  onDelete={(court) =>
                    addToast({
                      title: "Acción: Eliminar",
                      description: `Eliminar pista: ${court.name}`,
                      variant: "destructive",
                    })
                  }
                />
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Componentes de Eventos */}
        <Card>
          <CardHeader>
            <CardTitle>Componentes de Eventos</CardTitle>
            <CardDescription>
              Formularios y cards para gestión de eventos
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex gap-2">
              <Button
                onClick={() => {
                  setEventFormMode("create");
                  setEventDialogOpen(true);
                }}
              >
                Ver Event Form (Crear)
              </Button>
              <Button
                variant="outline"
                onClick={() => {
                  setEventFormMode("edit");
                  setEventDialogOpen(true);
                }}
              >
                Ver Event Form (Editar)
              </Button>
            </div>

            <Dialog open={eventDialogOpen} onOpenChange={setEventDialogOpen}>
              <DialogContent className="max-w-3xl max-h-[80vh] overflow-y-auto">
                <DialogHeader>
                  <DialogTitle>
                    {eventFormMode === "create"
                      ? "Crear Evento"
                      : "Editar Evento"}
                  </DialogTitle>
                  <DialogDescription>
                    {eventFormMode === "create"
                      ? "Completa el formulario para crear un nuevo evento"
                      : "Actualiza la información del evento"}
                  </DialogDescription>
                </DialogHeader>
                <div className="py-4">
                  <EventForm
                    mode={eventFormMode}
                    clubId="1"
                    event={eventFormMode === "edit" ? mockEvent : undefined}
                    courts={mockCourtsForEvent}
                    onSuccess={() => {
                      addToast({
                        title: "Acción completada",
                        description: `Evento ${
                          eventFormMode === "create" ? "creado" : "actualizado"
                        } correctamente`,
                        variant: "success",
                      });
                      setEventDialogOpen(false);
                    }}
                  />
                </div>
              </DialogContent>
            </Dialog>

            <div>
              <h4 className="font-semibold mb-3">Event Card (Ejemplo)</h4>
              <div className="max-w-md">
                <EventCard
                  event={mockEvent}
                  showClubInfo={true}
                  onJoinChange={() =>
                    addToast({
                      title: "Acción: Cambio en inscripción",
                      description: "Se ha actualizado tu inscripción al evento",
                      variant: "info",
                    })
                  }
                />
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Componentes de Partidos */}
        <Card>
          <CardHeader>
            <CardTitle>Componentes de Partidos</CardTitle>
            <CardDescription>
              Formularios y cards para gestión de partidos
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex gap-2">
              <Button
                onClick={() => {
                  setMatchFormMode("create");
                  setMatchDialogOpen(true);
                }}
              >
                Ver Match Form (Crear)
              </Button>
              <Button
                variant="outline"
                onClick={() => {
                  setMatchFormMode("edit");
                  setMatchDialogOpen(true);
                }}
              >
                Ver Match Form (Editar)
              </Button>
            </div>

            <Dialog open={matchDialogOpen} onOpenChange={setMatchDialogOpen}>
              <DialogContent className="max-w-3xl max-h-[80vh] overflow-y-auto">
                <DialogHeader>
                  <DialogTitle>
                    {matchFormMode === "create"
                      ? "Registrar Partido"
                      : "Editar Partido"}
                  </DialogTitle>
                  <DialogDescription>
                    {matchFormMode === "create"
                      ? "Completa el formulario para registrar un nuevo partido"
                      : "Actualiza la información del partido"}
                  </DialogDescription>
                </DialogHeader>
                <div className="py-4">
                  <MatchForm
                    mode={matchFormMode}
                    match={matchFormMode === "edit" ? mockMatch : undefined}
                    onSuccess={() => {
                      addToast({
                        title: "Acción completada",
                        description: `Partido ${
                          matchFormMode === "create"
                            ? "registrado"
                            : "actualizado"
                        } correctamente`,
                        variant: "success",
                      });
                      setMatchDialogOpen(false);
                    }}
                  />
                </div>
              </DialogContent>
            </Dialog>

            <div>
              <h4 className="font-semibold mb-3">Match Card (Ejemplo)</h4>
              <div className="max-w-md">
                <MatchCard
                  match={mockMatch}
                  showClubInfo={true}
                  showEventInfo={true}
                  canManage={true}
                  onEdit={(match) =>
                    addToast({
                      title: "Acción: Editar",
                      description: `Editar partido ${match.matchType}`,
                      variant: "info",
                    })
                  }
                  onDelete={(match) =>
                    addToast({
                      title: "Acción: Eliminar",
                      description: `Eliminar partido ${match.id}`,
                      variant: "destructive",
                    })
                  }
                />
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Input & Label */}
        <Card>
          <CardHeader>
            <CardTitle>Input & Label</CardTitle>
            <CardDescription>
              Campos de entrada de texto con etiquetas
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="text-input">Texto</Label>
                <Input
                  id="text-input"
                  type="text"
                  placeholder="Escribe algo..."
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="email-input">Email</Label>
                <Input
                  id="email-input"
                  type="email"
                  placeholder="tu@email.com"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="password-input">Contraseña</Label>
                <Input
                  id="password-input"
                  type="password"
                  placeholder="••••••••"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="number-input">Número</Label>
                <Input id="number-input" type="number" placeholder="123" />
              </div>

              <div className="space-y-2">
                <Label htmlFor="tel-input">Teléfono</Label>
                <Input
                  id="tel-input"
                  type="tel"
                  placeholder="+34 666 777 888"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="disabled-input">Deshabilitado</Label>
                <Input
                  id="disabled-input"
                  type="text"
                  placeholder="Campo deshabilitado"
                  disabled
                />
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Textarea */}
        <Card>
          <CardHeader>
            <CardTitle>Textarea</CardTitle>
            <CardDescription>
              Campos de texto multilínea para contenido extenso
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="textarea-default">Descripción</Label>
              <Textarea
                id="textarea-default"
                placeholder="Escribe una descripción detallada..."
                rows={4}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="textarea-disabled">Deshabilitado</Label>
              <Textarea
                id="textarea-disabled"
                placeholder="Campo deshabilitado"
                disabled
                rows={3}
              />
            </div>
          </CardContent>
        </Card>

        {/* Toasts */}
        <Card>
          <CardHeader>
            <CardTitle>Toast / Notificaciones</CardTitle>
            <CardDescription>
              Sistema de notificaciones temporales
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-2">
            <div className="flex flex-wrap gap-2">
              <Button
                onClick={() =>
                  addToast({
                    title: "Éxito",
                    description: "La operación se completó correctamente",
                    variant: "success",
                  })
                }
              >
                Toast Success
              </Button>
              <Button
                variant="destructive"
                onClick={() =>
                  addToast({
                    title: "Error",
                    description: "Ocurrió un error al procesar la solicitud",
                    variant: "destructive",
                  })
                }
              >
                Toast Error
              </Button>
              <Button
                variant="outline"
                onClick={() =>
                  addToast({
                    title: "Advertencia",
                    description: "Esta acción puede tener consecuencias",
                    variant: "warning",
                  })
                }
              >
                Toast Warning
              </Button>
              <Button
                variant="secondary"
                onClick={() =>
                  addToast({
                    title: "Información",
                    description: "Tienes 3 nuevos mensajes",
                    variant: "info",
                  })
                }
              >
                Toast Info
              </Button>
              <Button
                variant="outline"
                onClick={() =>
                  addToast({
                    description: "Toast simple sin título",
                  })
                }
              >
                Toast Simple
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Alerts */}
        <Card>
          <CardHeader>
            <CardTitle>Alerts</CardTitle>
            <CardDescription>
              Mensajes de alerta estáticos en la página
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <Alert variant="default">
              <AlertTitle>Información</AlertTitle>
              <AlertDescription>
                Este es un mensaje informativo por defecto.
              </AlertDescription>
            </Alert>

            <Alert variant="success">
              <AlertTitle>¡Éxito!</AlertTitle>
              <AlertDescription>
                Tu operación se completó exitosamente.
              </AlertDescription>
            </Alert>

            <Alert variant="warning">
              <AlertTitle>Advertencia</AlertTitle>
              <AlertDescription>
                Revisa la información antes de continuar.
              </AlertDescription>
            </Alert>

            <Alert variant="destructive">
              <AlertTitle>Error</AlertTitle>
              <AlertDescription>
                Ocurrió un error al procesar tu solicitud.
              </AlertDescription>
            </Alert>

            <Alert variant="info">
              <AlertTitle>Nota Informativa</AlertTitle>
              <AlertDescription>
                Tienes 5 notificaciones sin leer.
              </AlertDescription>
            </Alert>
          </CardContent>
        </Card>

        {/* Dialog/Modal */}
        <Card>
          <CardHeader>
            <CardTitle>Dialog / Modal</CardTitle>
            <CardDescription>
              Ventanas modales para confirmaciones y formularios
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-2">
            <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
              <DialogTrigger asChild>
                <Button>Abrir Modal</Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>¿Estás seguro?</DialogTitle>
                  <DialogDescription>
                    Esta acción no se puede deshacer. Esto eliminará
                    permanentemente los datos seleccionados.
                  </DialogDescription>
                </DialogHeader>
                <DialogFooter>
                  <Button
                    variant="outline"
                    onClick={() => setDialogOpen(false)}
                  >
                    Cancelar
                  </Button>
                  <Button
                    variant="destructive"
                    onClick={() => {
                      addToast({
                        title: "Acción confirmada",
                        description: "Los datos han sido eliminados",
                        variant: "success",
                      });
                      setDialogOpen(false);
                    }}
                  >
                    Confirmar
                  </Button>
                </DialogFooter>
              </DialogContent>
            </Dialog>

            <Dialog>
              <DialogTrigger asChild>
                <Button variant="outline">Modal con Formulario</Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Editar Perfil</DialogTitle>
                  <DialogDescription>
                    Actualiza tu información personal aquí.
                  </DialogDescription>
                </DialogHeader>
                <div className="space-y-4 py-4">
                  <div className="space-y-2">
                    <Label htmlFor="modal-name">Nombre</Label>
                    <Input id="modal-name" placeholder="Tu nombre" />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="modal-email">Email</Label>
                    <Input
                      id="modal-email"
                      type="email"
                      placeholder="tu@email.com"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="modal-bio">Biografía</Label>
                    <Textarea
                      id="modal-bio"
                      placeholder="Cuéntanos sobre ti..."
                      rows={3}
                    />
                  </div>
                </div>
                <DialogFooter>
                  <Button>Guardar Cambios</Button>
                </DialogFooter>
              </DialogContent>
            </Dialog>
          </CardContent>
        </Card>

        {/* Table */}
        <Card>
          <CardHeader>
            <CardTitle>Table</CardTitle>
            <CardDescription>
              Tablas para mostrar datos estructurados
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Table>
              <TableCaption>Lista de usuarios en la plataforma</TableCaption>
              <TableHeader>
                <TableRow>
                  <TableHead>ID</TableHead>
                  <TableHead>Nombre</TableHead>
                  <TableHead>Email</TableHead>
                  <TableHead>Rol</TableHead>
                  <TableHead>Estado</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {users.map((user) => (
                  <TableRow key={user.id}>
                    <TableCell className="font-medium">{user.id}</TableCell>
                    <TableCell>{user.name}</TableCell>
                    <TableCell>{user.email}</TableCell>
                    <TableCell>
                      <Badge
                        variant={
                          user.role === "SUPER_ADMIN" ? "default" : "secondary"
                        }
                      >
                        {user.role}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <Badge
                        variant={
                          user.status === "ACTIVE" ? "success" : "outline"
                        }
                      >
                        {user.status}
                      </Badge>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>

        {/* Dropdown Menu */}
        <Card>
          <CardHeader>
            <CardTitle>Dropdown Menu</CardTitle>
            <CardDescription>
              Menús desplegables para acciones y navegación
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-2">
            <div className="flex flex-wrap gap-2">
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="outline">Abrir Menú</Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent>
                  <DropdownMenuLabel>Mi Cuenta</DropdownMenuLabel>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem>Perfil</DropdownMenuItem>
                  <DropdownMenuItem>Configuración</DropdownMenuItem>
                  <DropdownMenuItem>Mis Clubes</DropdownMenuItem>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem className="text-red-600">
                    Cerrar Sesión
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>

              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button>Acciones</Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent>
                  <DropdownMenuItem
                    onClick={() =>
                      addToast({
                        title: "Acción: Editar",
                        description: "Has seleccionado editar",
                        variant: "info",
                      })
                    }
                  >
                    Editar
                  </DropdownMenuItem>
                  <DropdownMenuItem
                    onClick={() =>
                      addToast({
                        title: "Acción: Duplicar",
                        description: "Has seleccionado duplicar",
                        variant: "info",
                      })
                    }
                  >
                    Duplicar
                  </DropdownMenuItem>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem
                    className="text-red-600"
                    onClick={() =>
                      addToast({
                        title: "Acción: Eliminar",
                        description: "Has seleccionado eliminar",
                        variant: "destructive",
                      })
                    }
                  >
                    Eliminar
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          </CardContent>
        </Card>

        {/* Badges */}
        <Card>
          <CardHeader>
            <CardTitle>Badges</CardTitle>
            <CardDescription>
              Etiquetas para estados y categorías
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex flex-wrap gap-2">
              <Badge>Default</Badge>
              <Badge variant="secondary">Secondary</Badge>
              <Badge variant="destructive">Destructive</Badge>
              <Badge variant="outline">Outline</Badge>
              <Badge variant="success">Success</Badge>
              <Badge variant="warning">Warning</Badge>
              <Badge variant="info">Info</Badge>
            </div>
          </CardContent>
        </Card>

        {/* Buttons */}
        <Card>
          <CardHeader>
            <CardTitle>Buttons</CardTitle>
            <CardDescription>Variantes de botones disponibles</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex flex-wrap gap-2">
                <Button>Default</Button>
                <Button variant="secondary">Secondary</Button>
                <Button variant="destructive">Destructive</Button>
                <Button variant="outline">Outline</Button>
                <Button variant="ghost">Ghost</Button>
                <Button variant="link">Link</Button>
              </div>
              <div className="flex flex-wrap gap-2">
                <Button size="sm">Small</Button>
                <Button size="default">Default</Button>
                <Button size="lg">Large</Button>
              </div>
              <div className="flex flex-wrap gap-2">
                <Button disabled>Disabled</Button>
                <Button variant="outline" disabled>
                  Disabled Outline
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
