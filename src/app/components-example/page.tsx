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

export default function ComponentsExamplePage() {
  const { addToast } = useToast();
  const [dialogOpen, setDialogOpen] = useState(false);
  const [authDialogOpen, setAuthDialogOpen] = useState(false);
  const [authMode, setAuthMode] = useState<"login" | "register">("login");

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
