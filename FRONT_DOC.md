# 📱 Documentación Frontend - EasyPicky

## 📋 Tabla de Contenidos

1. [Estado Actual del Proyecto](#estado-actual-del-proyecto)
2. [Estructura de Archivos](#estructura-de-archivos)
3. [Tecnologías y Librerías](#tecnologías-y-librerías)
4. [Componentes Implementados](#componentes-implementados)
5. [Páginas Implementadas](#páginas-implementadas)
6. [Sistema de Autenticación](#sistema-de-autenticación)
7. [Estilos y Diseño](#estilos-y-diseño)
8. [Roadmap - Próximas Implementaciones](#roadmap---próximas-implementaciones)
9. [Guía de Desarrollo](#guía-de-desarrollo)

---

## 🎯 Estado Actual del Proyecto

### ✅ Completado

- **Sistema de Autenticación**
  - ✅ Registro de usuarios
  - ✅ Login con credenciales
  - ✅ Gestión de sesiones con NextAuth
  - ✅ Protección de rutas
  - ✅ Cierre de sesión
- **Gestión de Perfil**
  - ✅ Ver perfil de usuario
  - ✅ Editar información personal (nombre, teléfono, ciudad)
  - ✅ Cambiar contraseña
  - ✅ Gestión de avatar (URL)
  - ✅ Conectar DUPR ID
- **Componentes Base UI (shadcn/ui)**
  - ✅ Button
  - ✅ Input
  - ✅ Label
  - ✅ Card (con Header, Content, Footer, etc.)
  - ✅ Alert (con variantes: default, success, warning, destructive, info)
  - ✅ Toast/Toaster (sistema de notificaciones)
  - ✅ Dialog/Modal (con Header, Footer, Content)
  - ✅ Table (con Caption, Header, Body, Row, Cell)
  - ✅ Dropdown Menu (con Label, Separator, Item)
  - ✅ Badge (con variantes: default, secondary, destructive, outline, success, warning, info)
  - ✅ Textarea
- **Páginas**

  - ✅ Landing page con redirección automática
  - ✅ Página de registro (`/auth/signup`)
  - ✅ Página de login (`/auth/signin`)
  - ✅ Dashboard básico (`/dashboard`)
  - ✅ Página de perfil (`/profile`)
  - ✅ Página "Mis Clubes" (`/my-clubs`)
  - ✅ Página de demostración de componentes (`/components-example`)

- **Infraestructura**

  - ✅ Tailwind CSS v3.4.1 configurado
  - ✅ TypeScript configurado
  - ✅ React Hook Form + Zod para formularios
  - ✅ NextAuth integrado con Prisma
  - ✅ PostCSS y Autoprefixer configurados
  - ✅ Sistema de autenticación con JWT para API
  - ✅ Helper de API con manejo de tokens y errores

- **Gestión de Clubes**
  - ✅ Listado de clubes con búsqueda y filtros
  - ✅ Creación de clubes
  - ✅ Detalle de club
  - ✅ Edición de club (creador/admin)
  - ✅ Eliminación de club (creador/admin)
  - ✅ Gestión de miembros (agregar, actualizar estado, eliminar)
  - ✅ Gestión de pistas (crear, editar, activar/desactivar, eliminar)
  - ✅ Solicitar unirse a club (usuarios regulares)
  - ✅ Salir de club / Cancelar solicitud
  - ✅ Ver mis clubes con filtros por estado
  - **Gestión de Eventos**
  - ✅ Listado de eventos con búsqueda y filtros
  - ✅ Eventos cercanos por ciudad del usuario
  - ✅ Crear eventos desde el club (creadores)
  - ✅ Inscribirse a eventos
  - ✅ Cancelar inscripción
  - ✅ Ver "Mis Eventos" con filtros por estado
  - ✅ Sistema de tabs en detalle de club (Información/Eventos)
  - ✅ Integración completa con API de eventos
  - ✅ Paginación y filtros avanzados
  - **Gestión de Pistas con Horarios**
  - ✅ Configuración de horarios de apertura/cierre
  - ✅ Configuración de duración de slots de reserva
  - ✅ Visualización de horario diario de pistas
  - ✅ Sistema de reservas por slots
  - ✅ Gestión de reservas (crear, cancelar)
  - ✅ Botón "Ver Horario" en cards de pistas

### 🚧 En Desarrollo

- Integración de datos reales en dashboard
- Detalle completo de evento (con edición y gestión de participantes)

### ❌ Pendiente

Ver sección [Roadmap](#roadmap---próximas-implementaciones)

---

## 📁 Estructura de Archivos

```
easy-picky/
├── src/
│   ├── app/
│   │   ├── layout.tsx                 # Layout raíz con AuthProvider
│   │   ├── page.tsx                   # Landing page (redirige)
│   │   ├── globals.css                # Estilos globales + variables CSS
│   │   ├── auth/
│   │   │   ├── signin/
│   │   │   │   └── page.tsx          # Página de login
│   │   │   └── signup/
│   │   │       └── page.tsx          # Página de registro
│   │   ├── events/
│   │   │   ├── page.tsx              # Listado de eventos
│   │   │   ├── nearby/
│   │   │   │   └── page.tsx          # Eventos cercanos
│   │   │   └── [id]/
│   │   │       ├── page.tsx              # Detalle de evento
│   │   │       ├── manage/
│   │   │       │   └── page.tsx          # Gestionar evento
│   │   │       └── participants/
│   │   │           └── page.tsx          # Participantes
│   │   │
│   │   ├── matches/
│   │   │   ├── page.tsx              # Listado de partidos
│   │   │   ├── new/
│   │   │   │   └── page.tsx          # Crear partido
│   │   │   └── [id]/
│   │   │       ├── page.tsx              # Detalle de partido
│   │   │       └── edit/
│   │   │           └── page.tsx          # Editar partido
│   │   ├── my-events/
│   │   │   └── page.tsx              # Mis eventos
│   │   ├── my-matches/
│   │   │   └── page.tsx              # Mis partidos
│   │   ├── profile/
│   │   │   └── page.tsx              # Página de perfil de usuario
│   │   ├── my-clubs/
│   │   │   └── page.tsx              # Página "Mis Clubes"
│   │   ├── dashboard/
│   │   │   └── page.tsx              # Dashboard principal
│   │   ├── components-example/
│   │   │   └── page.tsx              # Demo de componentes UI
│   │   └── clubs/
│   │       ├── page.tsx                    # Listado de clubes
│   │       ├── new/
│   │       │   └── page.tsx               # Crear club
│   │       └── [id]/
│   │           ├── page.tsx               # Detalle de club
│   │           ├── edit/
│   │           │   └── page.tsx           # Editar club
│   │           ├── matches/
│   │           │   ├── page.tsx           # Partidos de club
│   │           │   ├── new/
│   │           │   │   └── page.tsx       # Crear partido de club
│   │           │   └── [matchId]/
│   │           │       ├── page.tsx       # Detalle de partido de club
│   │           │       └── edit/
│   │           │           └── page.tsx   # Editar partido de club
│   │           ├── members/
│   │           │   └── page.tsx           # Gestionar miembros
│   │           └── courts/
│   │               └── page.tsx           # Gestionar pistas
│   │
│   ├── components/
│   │   ├── auth/
│   │   │   ├── LoginForm.tsx         # Formulario de login
│   │   │   └── RegisterForm.tsx      # Formulario de registro
│   │   ├── events/
│   │   │   ├── EventForm.tsx         # Formulario de evento
│   │   │   └── EventCard.tsx         # Card de evento
│   │   ├── profile/
│   │   │   ├── ProfileForm.tsx       # Formulario de edición de perfil
│   │   │   └── ChangePasswordForm.tsx # Formulario de cambio de contraseña
│   │   ├── clubs/
│   │   │   ├── ClubForm.tsx          # Formulario de club
│   │   │   └── ClubCard.tsx          # Card de club (con botón "Unirse")
│   │   ├── courts/
│   │   │   ├── CourtForm.tsx         # Formulario de pista
│   │   │   ├── CourtCard.tsx         # Card de pista
│   │   │   └── CourtSchedule.tsx
│   │   ├── providers/
│   │   │   └── AuthProvider.tsx      # Provider de NextAuth
│   │   │
│   │   └── ui/                       # Componentes base (shadcn/ui)
│   │       ├── button.tsx
│   │       ├── input.tsx
│   │       ├── label.tsx
│   │       ├── textarea.tsx
│   │       ├── card.tsx
│   │       ├── alert.tsx
│   │       ├── toast.tsx
│   │       ├── toaster.tsx
│   │       ├── use-toast.ts
│   │       ├── dialog.tsx
│   │       ├── table.tsx
│   │       ├── dropdown-menu.tsx
│   │       └── badge.tsx
│   │
│   ├── lib/
│   │   ├── api.ts                    # Helper para peticiones API con JWT
│   │   ├── auth.ts                   # Configuración NextAuth
│   │   ├── auth-middleware.ts        # Middleware autenticación API
│   │   ├── prisma.ts                 # Cliente Prisma
│   │   └── utils.ts                  # Utilidades (cn función)
│   │
│   └── types/
│       ├── user.ts                   # Tipos TypeScript para usuarios
│       ├── club.ts                   # Tipos TypeScript para clubes
│       ├── court.ts                  # Tipos TypeScript para pistas
│       ├── event.ts                  # Tipos TypeScript para eventos
│       └── next-auth.d.ts            # Types de NextAuth extendidos
│
├── prisma/
│   └── schema.prisma                 # Schema de base de datos
│
├── tailwind.config.js                # Config Tailwind CSS v3
├── postcss.config.mjs                # Config PostCSS
├── tsconfig.json                     # Config TypeScript
└── package.json                      # Dependencias
```

---

## 🛠️ Tecnologías y Librerías

### Core

| Tecnología       | Versión | Propósito                      |
| ---------------- | ------- | ------------------------------ |
| **Next.js**      | 15.5.6  | Framework React con App Router |
| **React**        | 19.1.0  | Librería UI                    |
| **TypeScript**   | 5.x     | Type safety                    |
| **Tailwind CSS** | 3.4.1   | Estilos utility-first          |
| **PostCSS**      | 8.4.35  | Transformación de CSS          |
| **Autoprefixer** | 10.4.17 | Prefijos CSS automáticos       |

### Autenticación

| Librería         | Versión | Propósito              |
| ---------------- | ------- | ---------------------- |
| **NextAuth.js**  | 4.24.11 | Autenticación completa |
| **bcryptjs**     | 3.0.2   | Hash de contraseñas    |
| **jsonwebtoken** | 9.0.2   | JWT tokens para API    |

### Formularios y Validación

| Librería                | Versión | Propósito              |
| ----------------------- | ------- | ---------------------- |
| **React Hook Form**     | 7.65.0  | Gestión de formularios |
| **Zod**                 | 4.0.14  | Validación de schemas  |
| **@hookform/resolvers** | 5.2.2   | Integración Zod + RHF  |

### UI Components (shadcn/ui)

| Librería                          | Versión | Propósito                  |
| --------------------------------- | ------- | -------------------------- |
| **@radix-ui/react-label**         | 2.1.7   | Componente Label accesible |
| **@radix-ui/react-slot**          | 1.2.3   | Composición de componentes |
| **@radix-ui/react-dialog**        | 1.1.15  | Componente Dialog/Modal    |
| **@radix-ui/react-dropdown-menu** | 2.1.16  | Dropdown Menu accesible    |
| **class-variance-authority**      | 0.7.1   | Variantes de componentes   |
| **clsx**                          | 2.1.1   | Clases condicionales       |
| **tailwind-merge**                | 3.3.1   | Merge de clases Tailwind   |

### Base de Datos

| Librería                      | Versión | Propósito               |
| ----------------------------- | ------- | ----------------------- |
| **Prisma**                    | 6.13.0  | ORM                     |
| **@prisma/client**            | 6.13.0  | Cliente Prisma          |
| **@next-auth/prisma-adapter** | 1.0.7   | Adapter NextAuth-Prisma |

---

## 🧩 Componentes Implementados

### 1. Componentes UI Base (`src/components/ui/`)

#### Button (`button.tsx`)

Botón reutilizable con múltiples variantes y tamaños.

**Variantes:**

- `default` - Botón primario
- `destructive` - Botón de acción destructiva (eliminar, etc.)
- `outline` - Botón con borde
- `secondary` - Botón secundario
- `ghost` - Botón sin fondo
- `link` - Estilo de enlace

**Tamaños:**

- `default` - Tamaño estándar
- `sm` - Pequeño
- `lg` - Grande
- `icon` - Para iconos (cuadrado)

**Uso:**

```tsx
import { Button } from "@/components/ui/button";

<Button>Click me</Button>
<Button variant="outline" size="lg">Large Outline</Button>
<Button variant="destructive">Delete</Button>
```

#### Input (`input.tsx`)

Campo de entrada con estilos consistentes y estados (focus, disabled, error).

**Uso:**

```tsx
import { Input } from "@/components/ui/input";

<Input type="email" placeholder="email@example.com" />
<Input type="password" disabled />
```

#### Label (`label.tsx`)

Etiqueta accesible para formularios (usa Radix UI).

**Uso:**

```tsx
import { Label } from "@/components/ui/label";

<Label htmlFor="email">Email</Label>
<Input id="email" type="email" />
```

#### Card (`card.tsx`)

Contenedor con múltiples subcomponentes para layouts.

**Subcomponentes:**

- `Card` - Contenedor principal
- `CardHeader` - Cabecera
- `CardTitle` - Título
- `CardDescription` - Descripción
- `CardContent` - Contenido principal
- `CardFooter` - Pie de card

**Uso:**

```tsx
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

<Card>
  <CardHeader>
    <CardTitle>Title</CardTitle>
    <CardDescription>Description</CardDescription>
  </CardHeader>
  <CardContent>Content here</CardContent>
</Card>;
```

#### Alert (`alert.tsx`)

Mensajes de alerta estáticos para mostrar información importante en la página.

**Variantes:**

- `default` - Alerta por defecto (azul/gris)
- `success` - Alerta de éxito (verde)
- `warning` - Alerta de advertencia (amarillo)
- `destructive` - Alerta de error (rojo)
- `info` - Alerta informativa (azul)

**Subcomponentes:**

- `Alert` - Contenedor principal
- `AlertTitle` - Título de la alerta
- `AlertDescription` - Descripción de la alerta

**Uso:**

```tsx
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";

<Alert variant="success">
  <AlertTitle>¡Éxito!</AlertTitle>
  <AlertDescription>Tu operación se completó exitosamente.</AlertDescription>
</Alert>;
```

#### Toast / Toaster (`toast.tsx`, `toaster.tsx`, `use-toast.ts`)

Sistema de notificaciones temporales que aparecen en la esquina de la pantalla.

**Variantes:**

- `success` - Notificación de éxito
- `destructive` - Notificación de error
- `warning` - Notificación de advertencia
- `info` - Notificación informativa

**Uso:**

```tsx
import { useToast } from "@/components/ui/use-toast";

function MyComponent() {
  const { addToast } = useToast();

  return (
    <Button
      onClick={() =>
        addToast({
          title: "Éxito",
          description: "La operación se completó correctamente",
          variant: "success",
        })
      }
    >
      Mostrar Toast
    </Button>
  );
}

// En layout.tsx o componente raíz
import { Toaster } from "@/components/ui/toaster";
<Toaster />;
```

#### Dialog (`dialog.tsx`)

Ventanas modales para confirmaciones, formularios y contenido adicional.

**Subcomponentes:**

- `Dialog` - Contenedor principal
- `DialogTrigger` - Botón/elemento que abre el diálogo
- `DialogContent` - Contenido del diálogo
- `DialogHeader` - Cabecera del diálogo
- `DialogTitle` - Título del diálogo
- `DialogDescription` - Descripción del diálogo
- `DialogFooter` - Pie del diálogo (para botones de acción)

**Uso:**

```tsx
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";

<Dialog>
  <DialogTrigger asChild>
    <Button>Abrir Modal</Button>
  </DialogTrigger>
  <DialogContent>
    <DialogHeader>
      <DialogTitle>¿Estás seguro?</DialogTitle>
      <DialogDescription>Esta acción no se puede deshacer.</DialogDescription>
    </DialogHeader>
    <DialogFooter>
      <Button variant="outline">Cancelar</Button>
      <Button variant="destructive">Confirmar</Button>
    </DialogFooter>
  </DialogContent>
</Dialog>;
```

#### Table (`table.tsx`)

Componente para mostrar datos tabulares estructurados.

**Subcomponentes:**

- `Table` - Contenedor principal de la tabla
- `TableCaption` - Título/descripción de la tabla
- `TableHeader` - Cabecera de la tabla
- `TableBody` - Cuerpo de la tabla
- `TableFooter` - Pie de la tabla
- `TableRow` - Fila de la tabla
- `TableHead` - Celda de cabecera
- `TableCell` - Celda de datos

**Uso:**

```tsx
import {
  Table,
  TableBody,
  TableCaption,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

<Table>
  <TableCaption>Lista de usuarios</TableCaption>
  <TableHeader>
    <TableRow>
      <TableHead>Nombre</TableHead>
      <TableHead>Email</TableHead>
    </TableRow>
  </TableHeader>
  <TableBody>
    <TableRow>
      <TableCell>Juan Pérez</TableCell>
      <TableCell>juan@test.com</TableCell>
    </TableRow>
  </TableBody>
</Table>;
```

#### Dropdown Menu (`dropdown-menu.tsx`)

Menús desplegables para acciones y navegación.

**Subcomponentes:**

- `DropdownMenu` - Contenedor principal
- `DropdownMenuTrigger` - Botón que abre el menú
- `DropdownMenuContent` - Contenido del menú
- `DropdownMenuLabel` - Etiqueta/título dentro del menú
- `DropdownMenuItem` - Item individual del menú
- `DropdownMenuSeparator` - Separador visual

**Uso:**

```tsx
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

<DropdownMenu>
  <DropdownMenuTrigger asChild>
    <Button variant="outline">Abrir Menú</Button>
  </DropdownMenuTrigger>
  <DropdownMenuContent>
    <DropdownMenuLabel>Mi Cuenta</DropdownMenuLabel>
    <DropdownMenuSeparator />
    <DropdownMenuItem>Perfil</DropdownMenuItem>
    <DropdownMenuItem>Configuración</DropdownMenuItem>
    <DropdownMenuSeparator />
    <DropdownMenuItem className="text-red-600">Cerrar Sesión</DropdownMenuItem>
  </DropdownMenuContent>
</DropdownMenu>;
```

#### Badge (`badge.tsx`)

Etiquetas pequeñas para mostrar estados, categorías o información adicional.

**Variantes:**

- `default` - Badge por defecto
- `secondary` - Badge secundario
- `destructive` - Badge de error/eliminación
- `outline` - Badge con borde
- `success` - Badge de éxito (verde)
- `warning` - Badge de advertencia (amarillo)
- `info` - Badge informativo (azul)

**Uso:**

```tsx
import { Badge } from "@/components/ui/badge";

<Badge>Default</Badge>
<Badge variant="success">Activo</Badge>
<Badge variant="destructive">Error</Badge>
<Badge variant="outline">Pendiente</Badge>
```

---

### 2. Componentes de Autenticación (`src/components/auth/`)

#### LoginForm (`LoginForm.tsx`)

Formulario de inicio de sesión con validación.

**Características:**

- Validación con Zod
- Estados de carga
- Manejo de errores
- Integración con NextAuth

**Campos:**

- Email (requerido, validado)
- Password (requerido, mínimo 6 caracteres)

**Flujo:**

1. Usuario completa formulario
2. Validación en cliente
3. Llamada a `signIn("credentials")`
4. Redirección a `/dashboard` si éxito
5. Muestra error si falla

#### RegisterForm (`RegisterForm.tsx`)

Formulario de registro de nuevos usuarios.

**Características:**

- Validación con Zod
- Estados de carga
- Manejo de errores
- Llamada a API de registro

**Campos:**

- Name (requerido, mínimo 2 caracteres)
- Email (requerido, validado)
- Password (requerido, mínimo 6 caracteres)
- Phone (opcional)
- City (opcional)

**Flujo:**

1. Usuario completa formulario
2. Validación en cliente
3. POST a `/api/auth/register`
4. Redirección a `/auth/signin` si éxito
5. Muestra error si falla

---

### 3. Providers (`src/components/providers/`)

#### AuthProvider (`AuthProvider.tsx`)

Wrapper de `SessionProvider` de NextAuth para toda la app.

**Propósito:**

- Provee contexto de sesión a toda la aplicación
- Debe envolver el contenido en el layout raíz

**Uso:**

```tsx
// En layout.tsx
<AuthProvider>{children}</AuthProvider>
```

---

### 4. Componentes de Clubes (`src/components/clubs/`)

#### ClubForm (`ClubForm.tsx`)

Formulario reutilizable para crear y editar clubes.

**Características:**

- Validación con Zod
- Modo crear/editar
- Estados de carga
- Manejo de errores
- Integración con API

**Campos:**

- Name (requerido, max 100 caracteres)
- Description (opcional)
- Address (requerido)
- City (requerido)
- Phone (opcional)
- Email (opcional, validado)
- Website (opcional, validado como URL)
- Logo (opcional, validado como URL)

**Modos:**

- `create` - Crear nuevo club
- `edit` - Editar club existente

**Uso:**

```tsx
import { ClubForm } from "@/components/clubs/ClubForm";

// Crear
<ClubForm mode="create" />

// Editar
<ClubForm mode="edit" club={clubData} />
```

#### ClubCard (`ClubCard.tsx`)

Tarjeta de club para mostrar en listados.

**Características:**

- Muestra información resumida del club
- Logo si está disponible
- Badges con estadísticas (miembros, pistas, eventos)
- Botón para ver detalles

**Props:**

- `club` - Objeto Club con información completa

**Uso:**

```tsx
import { ClubCard } from "@/components/clubs/ClubCard";

<ClubCard club={clubData} />;
```

### 5. Componentes de Courts (`src/components/courts/`)

#### CourtForm (`CourtForm.tsx`)

Formulario reutilizable para crear y editar pistas con configuración de horarios.

**Características:**

- Validación con Zod
- Modo crear/editar
- Estados de carga
- Manejo de errores
- Integración con API
- **Configuración de horarios** ✨ NUEVO

**Campos:**

- Name (requerido, max 100 caracteres)
- Description (opcional, max 500 caracteres)
- isActive (boolean, checkbox)
- **Open Time (requerido, formato HH:mm)** ✨ NUEVO
- **Close Time (requerido, formato HH:mm)** ✨ NUEVO
- **Slot Duration (requerido, 15-240 minutos)** ✨ NUEVO

**Validaciones:**

- Close Time debe ser mayor que Open Time
- Slot Duration debe ser múltiplo de 15 minutos
- Formato de hora HH:mm con regex

**Modos:**

- `create` - Crear nueva pista
- `edit` - Editar pista existente

**Valores por defecto:**

- openTime: "08:00"
- closeTime: "23:00"
- slotDuration: 90 minutos

#### CourtCard (`CourtCard.tsx`)

Tarjeta de pista para mostrar en listados con acceso al horario.

**Características:**

- Muestra información de la pista
- Badge de estado (Activa/Inactiva)
- Dropdown menu con acciones (editar, activar/desactivar, eliminar)
- Estadísticas (eventos, partidos)
- Opacidad reducida para pistas inactivas
- **Botón "Ver Horario"** ✨ NUEVO
- **Modal de horario integrado** ✨ NUEVO

**Props:**

- `court` - Objeto Court con información completa
- `clubId` - ID del club
- `canManage` - Boolean para mostrar acciones
- `onEdit`, `onToggleActive`, `onDelete` - Callbacks opcionales

#### CourtSchedule (`CourtSchedule.tsx`)

Modal interactivo para visualizar y gestionar el horario de una pista.

**Características:**

- Visualización de slots de tiempo configurables
- Navegación por días (anterior/siguiente)
- Slots dinámicos basados en openTime, closeTime y slotDuration
- Estados visuales (Libre/Ocupado)
- Información de reservas existentes
- Reservar slots disponibles (si canReserve)
- Cancelar reservas propias
- Integración completa con API
- Responsive design

**Slots de Tiempo:**

- Generados automáticamente según configuración de pista
- Marca slots ocupados con información de:
  - Usuario que reservó
  - Evento asociado (si existe)
  - Partido asociado (si existe)

**Props:**

- `court` - Objeto Court con configuración completa
- `isOpen` - Boolean para controlar visibilidad del modal
- `onClose` - Callback al cerrar
- `canReserve` - Boolean para permitir hacer reservas (default: false)

**Permisos para reservar:**

- Miembros activos del club
- Creador del club
- SUPER_ADMIN

**Uso:**

```tsx
import { CourtSchedule } from "@/components/courts/CourtSchedule";

<CourtSchedule
  court={courtData}
  isOpen={showSchedule}
  onClose={() => setShowSchedule(false)}
  canReserve={canManage}
/>;
```

**Integración API:**

- `GET /courts/:id/schedule?date=YYYY-MM-DD` - Obtener horario del día
- `POST /courts/:id/reservations` - Crear reserva
- `DELETE /courts/:id/reservations/:reservationId` - Cancelar reserva

### 6. Componentes de Perfil (`src/components/profile/`)

#### ProfileForm (`ProfileForm.tsx`)

Formulario para editar la información personal del usuario.

**Características:**

- Validación con Zod
- Estados de carga
- Manejo de errores
- Integración con API
- Actualización parcial de campos (solo envía lo que cambió)

**Campos:**

- Name (requerido, mínimo 2 caracteres)
- Email (solo lectura, no editable)
- Phone (opcional)
- City (opcional)
- Avatar URL (opcional, validado como URL)
- DUPR ID (opcional, único en el sistema)

**Props:**

- `user` - Objeto User con información completa
- `onUpdate` - Callback opcional cuando se actualiza el perfil

**Uso:**

```tsx
import { ProfileForm } from "@/components/profile/ProfileForm";

<ProfileForm
  user={userData}
  onUpdate={(updatedUser) => setUser(updatedUser)}
/>;
```

---

#### ChangePasswordForm (`ChangePasswordForm.tsx`)

Formulario separado para cambio seguro de contraseña.

**Características:**

- Validación con Zod
- Requiere contraseña actual
- Confirmación de nueva contraseña
- Estados de carga
- Reinicia formulario tras éxito
- No disponible para cuentas de Google

**Campos:**

- Current Password (requerido)
- New Password (requerido, mínimo 6 caracteres)
- Confirm Password (requerido, debe coincidir)

**Validaciones:**

- La contraseña actual debe ser correcta
- Las nuevas contraseñas deben coincidir
- Mínimo 6 caracteres

**Uso:**

```tsx
import { ChangePasswordForm } from "@/components/profile/ChangePasswordForm";

<ChangePasswordForm />;
```

### 7. Actualización de ClubCard

#### ClubCard (`ClubCard.tsx`)

**Nueva funcionalidad agregada:**

**Props adicionales:**

- `membershipStatus?` - Estado de membresía actual: "ACTIVE" | "INACTIVE" | "PENDING" | "CANCELLED" | null
- `onMembershipChange?` - Callback cuando cambia el estado de membresía

**Nuevo comportamiento:**

- **Sin membresía**: Muestra botón "Unirse"
- **ACTIVE**: Muestra badge verde "Miembro"
- **PENDING**: Muestra badge amarillo "Pendiente"
- **INACTIVE/CANCELLED**: Muestra botón "Volver a unirse"

**Integración con API:**

- `POST /clubs/:id/join` - Solicitar membresía
- Manejo de errores con ApiError
- Toast notifications para feedback

**Uso actualizado:**

```tsx
import { ClubCard } from "@/components/clubs/ClubCard";

<ClubCard
  club={clubData}
  membershipStatus="PENDING"
  onMembershipChange={() => refetchMemberships()}
/>;
```

### 8. Componentes de Eventos (`src/components/events/`)

#### EventForm (`EventForm.tsx`)

Formulario reutilizable para crear y editar eventos.

**Características:**

- Validación con Zod
- Modo crear/editar
- Estados de carga
- Manejo de errores
- Integración con API
- Selección de pista del club
- Validación de fechas (fin > inicio)

**Campos:**

- Title (requerido, min 3 caracteres)
- Description (opcional)
- Type (CLASS, TOURNAMENT, MEETUP)
- Visibility (OPEN, MEMBERS_ONLY, PRIVATE)
- Status (SCHEDULED, ONGOING, COMPLETED, CANCELLED) - solo edición
- Start Date Time (requerido)
- End Date Time (requerido, debe ser > inicio)
- Court ID (opcional)
- Max Participants (opcional, número positivo)
- Price (opcional, número >= 0)

**Modos:**

- `create` - Crear nuevo evento
- `edit` - Editar evento existente

**Uso:**

```tsx
import { EventForm } from "@/components/events/EventForm";

// Crear (usado en modal del club)
<EventForm mode="create" clubId={clubId} courts={courts} onSuccess={handleSuccess} />

// Editar
<EventForm mode="edit" clubId={clubId} event={eventData} courts={courts} />
```

#### EventCard (`EventCard.tsx`)

Tarjeta de evento para mostrar en listados.

**Características:**

- Muestra información resumida del evento
- Badges dinámicos (tipo, visibilidad, estado)
- Formateo de fechas en español
- Información del club (configurable)
- Botones de acción (Ver, Inscribirse, Cancelar)
- Estados de carga en acciones
- Integración con API

**Props:**

- `event` - Objeto Event con información completa
- `showClubInfo` - Mostrar info del club (default: true)
- `onJoinChange` - Callback al cambiar inscripción

**Uso:**

```tsx
import { EventCard } from "@/components/events/EventCard";

// En listado público
<EventCard event={eventData} onJoinChange={refetchEvents} />

// En página de club (sin mostrar info del club)
<EventCard event={eventData} showClubInfo={false} onJoinChange={refetchEvents} />
```

### 9. Componentes de Partidos (`src/components/matches/`)

#### MatchForm (`MatchForm.tsx`)

Formulario reutilizable para crear y editar partidos informales y de club.

**Características:**

- Validación completa con Zod
- Modo crear/editar
- Selector de tipo de partido (Singles/Doubles)
- Formulario dinámico según tipo (2 o 4 participantes)
- Equipos claramente diferenciados (Equipo 1/Equipo 2)
- Selección de ganador por equipo (checkbox excluyente)
- Validación de formato de score (1-5 sets)
- Fechas de inicio/fin opcionales
- Estados de carga y manejo de errores
- Soporte para partidos informales y de club

**Campos:**

- Match Type (requerido): SINGLES o DOUBLES
- Participantes por equipo (requeridos):
  - Team 1: Jugador 1 (ID) + Jugador 2 (ID) si es Doubles
  - Team 2: Jugador 1 (ID) + Jugador 2 (ID) si es Doubles
- Ganador: Checkbox por equipo (solo uno puede ganar)
- Score (opcional): Formato "21-19,19-21,11-9"
- Start Time (opcional): datetime-local
- End Time (opcional): datetime-local
- Court ID (opcional): Solo si no está predefinido
- Event ID (opcional): Solo si no está predefinido
- Completed (checkbox): Marcar como completado

**Validaciones:**

- Singles: Solo 2 participantes
- Doubles: Exactamente 4 participantes
- No participantes duplicados
- Solo un equipo puede ser ganador
- Score debe cumplir formato regex
- End Time > Start Time

**Modos:**

- `create` - Crear nuevo partido
- `edit` - Editar partido existente

**Props:**

- `match?` - Partido a editar (modo edit)
- `mode` - "create" o "edit"
- `clubId?` - ID del club (si es partido de club)
- `courtId?` - ID de pista predefinido
- `eventId?` - ID de evento predefinido
- `onSuccess?` - Callback al completar con éxito

**Uso:**

```tsx
import { MatchForm } from "@/components/matches/MatchForm";

// Crear partido informal
<MatchForm mode="create" />

// Crear partido de club
<MatchForm mode="create" clubId={clubId} courtId={courtId} />

// Editar partido
<MatchForm mode="edit" match={matchData} />
```

---

#### MatchCard (`MatchCard.tsx`)

Tarjeta de partido para mostrar en listados.

**Características:**

- Muestra equipos con sus participantes
- Badge de tipo (Singles/Doubles)
- Badge de estado (Completado/En progreso)
- Equipo ganador resaltado con fondo verde
- DUPR rating de participantes (si disponible)
- Score formateado con separador visual
- Duración calculada en minutos
- Información de pista y club (configurable)
- Información de evento (configurable)
- Botones de gestión (editar/eliminar) para creadores
- Link dinámico según contexto (club o informal)

**Props:**

- `match` - Objeto Match con información completa
- `showClubInfo?` - Mostrar info del club (default: false)
- `showEventInfo?` - Mostrar info del evento (default: false)
- `canManage?` - Mostrar botones de gestión (default: false)
- `clubId?` - ID del club para construir link correcto
- `onEdit?` - Callback al editar
- `onDelete?` - Callback al eliminar

**Uso:**

```tsx
import { MatchCard } from "@/components/matches/MatchCard";

// Partido informal (listado público)
<MatchCard match={matchData} showClubInfo={true} showEventInfo={true} />

// Partido de club (desde página del club)
<MatchCard
  match={matchData}
  clubId={clubId}
  showClubInfo={false}
  showEventInfo={true}
/>

// Con gestión (creador)
<MatchCard
  match={matchData}
  canManage={true}
  onEdit={handleEdit}
  onDelete={handleDelete}
/>
```

---

## 📄 Páginas Implementadas

### 1. Landing Page (`src/app/page.tsx`)

**Ruta:** `/`

**Funcionalidad:**

- Verifica estado de autenticación
- Redirige a `/dashboard` si hay sesión activa
- Redirige a `/auth/signin` si no hay sesión

**Estado:** ✅ Implementada

---

### 2. Página de Login (`src/app/auth/signin/page.tsx`)

**Ruta:** `/auth/signin`

**Componentes:**

- `LoginForm` - Formulario principal
- `Card` - Contenedor
- Link a página de registro

**Funcionalidad:**

- Login con email/password
- Validación de campos
- Manejo de errores
- Redirección tras login exitoso

**Estado:** ✅ Implementada

---

### 3. Página de Registro (`src/app/auth/signup/page.tsx`)

**Ruta:** `/auth/signup`

**Componentes:**

- `RegisterForm` - Formulario principal
- `Card` - Contenedor
- Link a página de login

**Funcionalidad:**

- Registro de nuevos usuarios
- Campos opcionales (phone, city)
- Validación de campos
- Prevención de emails duplicados
- Redirección tras registro exitoso

**Estado:** ✅ Implementada

---

### 4. Dashboard (`src/app/dashboard/page.tsx`)

**Ruta:** `/dashboard`

**Protección:** ⚠️ Requiere autenticación

**Secciones:**

1. **Header**

   - Logo y título de la app
   - Botón de cerrar sesión

2. **Welcome Section**

   - Saludo personalizado con nombre de usuario
   - Información de email y rol

3. **Stats Cards** (datos estáticos por ahora)

   - Clubes disponibles
   - Próximos eventos
   - Membresías activas
   - Partidos jugados

4. **Acciones Rápidas**

   - Mi Perfil → `/profile`
   - Mis Clubes → `/my-clubs`
   - Buscar Clubes → `/clubs`
   - Ver Eventos → `/events`
   - Mis Eventos → `/my-events`
   - Mis Partidos → `/my-matches` ✨ (habilitado)

5. **Actividad Reciente**
   - Placeholder vacío

**Estado:** ✅ Implementada (básica, sin datos reales)

**Pendiente:**

- Integración con API para datos reales
- Gráficos de estadísticas
- Lista de eventos próximos
- Botón "Buscar Partidos" → `/matches`

---

### 5. Página de Demostración de Componentes (`src/app/components-example/page.tsx`)

**Ruta:** `/components-example`

**Protección:** ❌ No requiere autenticación

**Secciones:**

1. **Toast / Notificaciones** - Ejemplos de todos los tipos de toast
2. **Alerts** - Ejemplos de todas las variantes de alert
3. **Dialog / Modal** - Ejemplos de modales de confirmación y formularios
4. **Table** - Tabla con datos de ejemplo
5. **Dropdown Menu** - Menús desplegables con acciones
6. **Badges** - Todas las variantes de badges
7. **Buttons** - Todas las variantes y tamaños de botones

**Propósito:**

- Documentación visual de componentes
- Testing de componentes UI
- Referencia para desarrolladores

**Estado:** ✅ Implementada

---

### 6. Página de Listado de Clubes (`src/app/clubs/page.tsx`)

**Ruta:** `/clubs`

**Protección:** ❌ No requiere autenticación (acceso público)

**Funcionalidades:**

- Listado paginado de clubes (12 por página)
- Búsqueda por nombre/descripción
- Filtro por ciudad
- Cards informativos con estadísticas
- Botón "Crear Club" (requiere autenticación)

**Estado:** ✅ Implementada

---

### 7. Página de Creación de Club (`src/app/clubs/new/page.tsx`)

**Ruta:** `/clubs/new`

**Protección:** ⚠️ Requiere autenticación

**Funcionalidades:**

- Formulario completo de creación
- Validación de campos
- Campos opcionales claramente marcados
- Redirección automática al detalle tras creación

**Estado:** ✅ Implementada

---

### 8. Página de Detalle de Club (`src/app/clubs/[id]/page.tsx`)

**Ruta:** `/clubs/[id]`

**Protección:** ⚠️ Requiere autenticación para ver partidos

**Secciones:**

1. **Información Principal**

   - Nombre, ciudad, logo
   - Descripción
   - Badges con estadísticas (miembros, pistas, eventos)

2. **Sistema de Tabs**

   - **Tab "Información"**: Contacto y creador

     - Dirección
     - Teléfono (si existe)
     - Email (si existe)
     - Website (si existe)
     - Información del creador
     - Fecha de creación

   - **Tab "Eventos"**: Lista de eventos del club

     - Botón "+ Crear Evento" (solo creadores)
     - Grid de eventos con EventCard
     - Empty state cuando no hay eventos
     - Actualización automática tras crear
     - Muestra solo eventos SCHEDULED

   - **Tab "Partidos"**: Partidos del club ✨ NUEVO
     - Lista de últimos 12 partidos completados
     - Grid responsive con MatchCard
     - Botón "Ver Todos" → `/clubs/[id]/matches`
     - Empty state con CTA "Registrar Primer Partido" (solo creadores)
     - Links a detalle de partido: `/clubs/[id]/matches/[matchId]`

**Acciones (solo creador/admin):**

- Editar información
- Gestionar pistas
- Gestionar miembros
- Eliminar club (con confirmación)

**Estado:** ✅ Implementada

**Integración API:**

- `GET /clubs/:id` - Información del club
- `GET /events?clubId=:id&status=SCHEDULED` - Eventos del tab
- `GET /clubs/:id/courts?isActive=true` - Pistas activas para crear eventos
- `GET /clubs/:id/matches?limit=12&completed=true` - Partidos del tab ✨ NUEVO

---

### 9. Página de Edición de Club (`src/app/clubs/[id]/edit/page.tsx`)

**Ruta:** `/clubs/[id]/edit`

**Protección:** ⚠️ Requiere autenticación y permisos (creador/SUPER_ADMIN)

**Funcionalidades:**

- Formulario pre-cargado con datos actuales
- Validación de permisos
- Actualización parcial de campos
- Redirección al detalle tras guardar

**Estado:** ✅ Implementada

---

### 10. Página de Gestión de Miembros (`src/app/clubs/[id]/members/page.tsx`)

**Ruta:** `/clubs/[id]/members`

**Protección:** ⚠️ Requiere autenticación y permisos (creador/SUPER_ADMIN)

**Funcionalidades:**

- Tabla completa de miembros
- Información detallada (nombre, email, ciudad, DUPR rating)
- Estados de membresía con badges
- Agregar miembros (por ID de usuario)
- Cambiar estado de membresía (ACTIVE, INACTIVE, PENDING, CANCELLED)
- Eliminar miembros (con confirmación)
- Dropdown menu de acciones por miembro

**Estado:** ✅ Implementada

**Pendiente:**

- Búsqueda de usuarios por email/nombre (ahora se usa ID)
- Filtros avanzados
- Exportación de lista

---

### 11. Página de Gestión de Pistas (`src/app/clubs/[id]/courts/page.tsx`)

**Ruta:** `/clubs/[id]/courts`

**Protección:** ⚠️ Acceso público (lectura), gestión requiere permisos (creador/SUPER_ADMIN)

**Secciones:**

1. **Header**

   - Nombre del club
   - Botón "Volver"
   - Botón "+ Nueva Pista" (solo si canManage)

2. **Estadísticas**

   - Total de pistas
   - Pistas activas
   - Pistas inactivas

3. **Listado de Pistas Activas**

   - Grid responsive (3 columnas desktop, 2 tablet, 1 móvil)
   - Cards con información y acciones
   - Badge verde "Activa"

4. **Listado de Pistas Inactivas**

   - Separado de las activas
   - Opacidad reducida
   - Badge gris "Inactiva"

5. **Empty State**
   - Mensaje cuando no hay pistas
   - Botón para crear primera pista

**Funcionalidades:**

- **Crear pista** (creador/admin)

  - Modal con formulario
  - Validación con Zod
  - Toast de confirmación

- **Editar pista** (creador/admin)

  - Modal pre-cargado con datos
  - Actualización parcial de campos

- **Activar/Desactivar** (creador/admin)

  - Toggle rápido desde dropdown
  - Validación de eventos futuros

- **Eliminar pista** (creador/admin)
  - Modal de confirmación
  - Validación de eventos/partidos vinculados
  - Mensaje de advertencia si tiene datos

**Estado:** ✅ Implementada

**Integraciones:**

- API: `/api/clubs/[id]/courts` (GET, POST)
- API: `/api/clubs/[id]/courts/[courtId]` (GET, PUT, DELETE)
- Validaciones del backend integradas

---

### 12. Página de Perfil de Usuario (`src/app/profile/page.tsx`)

**Ruta:** `/profile`

**Protección:** ⚠️ Requiere autenticación

**Secciones:**

1. **Header**

   - Título "Mi Perfil"
   - Botón "Volver al Dashboard"

2. **Información del Perfil**

   - Formulario completo de edición (ProfileForm)
   - Campos: nombre, email (solo lectura), teléfono, ciudad, avatar, DUPR ID
   - Badge con rol del usuario
   - Validación con Zod
   - Actualización parcial de campos

3. **Seguridad - Cambiar Contraseña**

   - Formulario separado (ChangePasswordForm)
   - Validación de contraseña actual
   - Confirmación de nueva contraseña
   - Mínimo 6 caracteres

4. **Información de la Cuenta**
   - ID de usuario
   - Fecha de creación
   - Última actualización

**Estado:** ✅ Implementada

**Componentes utilizados:**

- `ProfileForm` - Edición de información personal
- `ChangePasswordForm` - Cambio seguro de contraseña
- `Card`, `Button`, `Badge` - Componentes UI

---

### 13. Página "Mis Clubes" (`src/app/my-clubs/page.tsx`)

**Ruta:** `/my-clubs`

**Protección:** ⚠️ Requiere autenticación

**Secciones:**

1. **Header**

   - Título "Mis Clubes"
   - Botones: "Explorar Clubes", "Dashboard"

2. **Tabs de Filtrado**

   - Activos (ACTIVE)
   - Pendientes (PENDING)
   - Todos

3. **Grid de Clubes**

   - Cards con información del club
   - Logo del club (si existe)
   - Descripción resumida
   - Estadísticas (miembros, pistas, eventos)
   - Badge de estado de membresía
   - Fecha de membresía
   - Botones: "Ver Club", "Salir" / "Cancelar"

4. **Empty State**
   - Mensaje cuando no hay clubes
   - Botón para explorar clubes

**Funcionalidades:**

- **Ver mis membresías**: Lista todos los clubes donde el usuario es miembro
- **Filtrar por estado**: ACTIVE, PENDING, ALL
- **Salir de club**: Modal de confirmación, cambia estado a CANCELLED
- **Cancelar solicitud**: Elimina membresía PENDING
- **Navegación**: Enlaces directos a cada club

**Estado:** ✅ Implementada

**Integraciones:**

- API: `GET /users/memberships`
- API: `DELETE /clubs/[id]/join`
- Manejo de estados con badges coloreados
- Modales de confirmación con Dialog

---

### 14. Página de Listado de Eventos (`src/app/events/page.tsx`)

**Ruta:** `/events`

**Protección:** ❌ No requiere autenticación (acceso público)

**Funcionalidades:**

- Listado paginado de eventos (12 por página)
- Búsqueda por título/descripción
- Filtros:
  - Ciudad
  - Tipo (CLASS, TOURNAMENT, MEETUP)
  - Estado (SCHEDULED, ONGOING, COMPLETED, CANCELLED)
- Aplicar/Limpiar filtros
- Grid responsive (3-2-1 columnas)
- Botones de navegación: "Eventos Cercanos", "Mis Eventos", "Dashboard"
- Inscribirse/Cancelar desde los cards (si está logueado)
- Contador de resultados
- Paginación con controles anterior/siguiente
- Empty state cuando no hay resultados

**Estado:** ✅ Implementada

**Integración API:** `GET /events?page=1&limit=12&search=&city=&type=&status=`

---

### 15. Página de Eventos Cercanos (`src/app/events/nearby/page.tsx`)

**Ruta:** `/events/nearby`

**Protección:** ⚠️ Requiere autenticación

**Funcionalidades:**

- Eventos en la ciudad del usuario (desde perfil)
- Filtros:
  - Tipo de evento (CLASS, TOURNAMENT, MEETUP)
  - Próximos días (1, 3, 7, 14, 30 días)
  - Solo eventos abiertos (checkbox)
- Listado paginado (12 por página)
- Grid responsive
- Botones de navegación
- Empty state con sugerencia para buscar en todas las ciudades

**Estado:** ✅ Implementada

**Nota:** Usa la ciudad configurada en el perfil del usuario logueado

**Integración API:** `GET /events/nearby?city=&daysAhead=7&type=&openOnly=false`

---

### 16. Página "Mis Eventos" (`src/app/my-events/page.tsx`)

**Ruta:** `/my-events`

**Protección:** ⚠️ Requiere autenticación

**Secciones:**

1. **Header**

   - Título "Mis Eventos"
   - Botones: "Eventos Cercanos", "Dashboard"

2. **Tabs de Filtrado**

   - Próximos (SCHEDULED, fecha futura)
   - Pasados (fecha pasada)
   - Todos

3. **Grid de Eventos**

   - Cards con información del evento
   - Estado de inscripción visible
   - Botón "Cancelar" si está inscrito
   - Información del club organizador
   - Fechas formateadas
   - Paginación

4. **Empty State**
   - Mensaje personalizado según el tab
   - Botón para buscar eventos

**Funcionalidades:**

- **Ver mis inscripciones**: Lista todos los eventos donde el usuario está inscrito
- **Filtrar por estado**: Próximos, Pasados, Todos
- **Cancelar inscripción**: Modal de confirmación
- **Navegación**: Enlaces directos a cada evento

**Estado:** ✅ Implementada

**Integraciones:**

- API: `GET /events?userId=me&startDate=&endDate=&status=`
- API: `DELETE /events/:id/join` (cancelar inscripción)
- Paginación con query params
- Contador de eventos por tab

---

### 17. Página de Detalle de Evento (`src/app/events/[id]/page.tsx`)

**Ruta:** `/events/[id]`

**Protección:** ❌ No requiere autenticación (acceso público)

**Secciones:**

1. **Header del Evento**

   - Badges dinámicos (tipo, visibilidad, estado, inscrito, check-in)
   - Título del evento
   - Descripción completa
   - Botones de acción según contexto

2. **Botones de Acción** (si hay sesión y está SCHEDULED)

   - **No inscrito**: Botón "Inscribirse al Evento"
   - **Inscrito**:
     - Botón "Hacer Check-in" (si canCheckIn y no tiene check-in)
     - Botón "Cancelar Inscripción" (rojo)
   - **Creador/Admin**: Botón "Ver Participantes (X)"

3. **Información Principal** (Grid 2 columnas)

   **Columna Izquierda - Detalles:**

   - **Fecha y Hora**

     - Inicio (formato largo en español)
     - Fin (formato largo en español)
     - Duración en minutos

   - **Ubicación**
     - Club (con link a `/clubs/[id]`)
     - Ciudad
     - Pista (si está asignada)

   **Columna Derecha - Stats:**

   - **Participantes**

     - Contador actual / máximo
     - Barra de progreso visual

   - **Precio**

     - Monto en euros o "Gratis"

   - **Partidos** (si > 0)
     - Contador de partidos registrados

4. **Modal de Confirmación**
   - Confirmar cancelación de inscripción
   - Botones: "No, mantener" / "Sí, cancelar"

**Funcionalidades:**

- Ver información completa del evento
- Inscribirse al evento (con validaciones de visibilidad)
- Cancelar inscripción (con modal de confirmación)
- Hacer check-in (si está en ventana de 30 min antes del inicio)
- Badges dinámicos según estado de participación
- Formateo de fechas en español con capitalize
- Cálculo automático de duración
- Barra de progreso de participantes
- Navegación a club y gestión (si es creador/admin)

**Integraciones API:**

- `GET /events/:id` - Obtener evento con info de participación
- `POST /events/:id/join` - Inscribirse
- `DELETE /events/:id/join` - Cancelar inscripción
- `POST /events/:id/checkin` - Hacer check-in

**Estado:** ✅ Implementada

---

### 18. Página de Gestión de Evento (`src/app/events/[id]/manage/page.tsx`)

**Ruta:** `/events/[id]/manage`

**Protección:** ⚠️ Requiere autenticación y permisos (creador del club o SUPER_ADMIN)

**Secciones:**

1. **Header**

   - Botón "Volver al Evento"
   - Botón "Ver Participantes (X)"

2. **Editar Información**

   - Card con EventForm en modo "edit"
   - Pre-cargado con datos actuales
   - Selección de pistas del club
   - Guardado inmediato

3. **Zona de Peligro** (Card rojo)
   - Descripción de acción irreversible
   - Botón "Eliminar Evento" (rojo)
   - Modal de confirmación doble

**Funcionalidades:**

- Editar toda la información del evento
- Cambiar estado (SCHEDULED, ONGOING, COMPLETED, CANCELLED)
- Cambiar pista asignada
- Modificar fechas, precio, límite de participantes
- Eliminar evento con confirmación
- Validación de permisos automática
- Redirección si no tiene permisos

**Validaciones:**

- Solo creador del club o SUPER_ADMIN
- No puede eliminar eventos ONGOING o COMPLETED
- Validación de fechas (fin > inicio)
- Validación de pista activa del club

**Integraciones API:**

- `GET /events/:id` - Obtener evento y verificar permisos
- `GET /clubs/:clubId/courts?isActive=true` - Cargar pistas
- `PUT /events/:id` - Actualizar evento
- `DELETE /events/:id` - Eliminar evento

**Flujo de Permisos:**

1. Carga evento desde API
2. Verifica `event.club.creatorId === session.user.id` o `session.user.role === "SUPER_ADMIN"`
3. Si no tiene permisos → Redirect a `/events/:id` con toast de error
4. Si tiene permisos → Muestra formulario de edición

**Estado:** ✅ Implementada

---

### 19. Página de Participantes de Evento (`src/app/events/[id]/participants/page.tsx`)

**Ruta:** `/events/[id]/participants`

**Protección:** ⚠️ Requiere autenticación y permisos (creador del club o SUPER_ADMIN)

**Secciones:**

1. **Header**

   - Título del evento
   - Botón "Volver al Evento"
   - Botón "Gestionar Evento"

2. **Estadísticas** (3 Cards)

   - Total Inscritos (X / max)
   - Check-in Realizados (verde)
   - Pendientes de Check-in (amarillo)

3. **Filtros**

   - Input de búsqueda (nombre/email)
   - Botones de filtro:
     - Todos
     - Con Check-in
     - Sin Check-in

4. **Tabla de Participantes**

   - Columnas:
     - Nombre
     - Email
     - Ciudad
     - DUPR Rating (badge)
     - Fecha inscripción
     - Check-in (badge verde/pendiente)
     - Acciones
   - Caption con total de resultados
   - Paginación (20 por página)

5. **Acciones por Participante**
   - **Sin check-in**: Botón "Hacer Check-in"
   - **Con check-in**: Botón "Deshacer Check-in"
   - Modal de confirmación para check-in

**Funcionalidades:**

- Ver lista completa de participantes
- Filtrar por estado de check-in
- Buscar por nombre o email (búsqueda local en página actual)
- Hacer check-in manual a participantes
- Deshacer check-in
- Estadísticas en tiempo real
- Paginación con controles anterior/siguiente
- Validación de permisos automática

**Integraciones API:**

- `GET /events/:id/participants?page=1&limit=20&checkedIn=true` - Lista paginada
- `POST /events/:id/checkin` - Check-in con userId
- `DELETE /events/:id/checkin?userId=id` - Deshacer check-in

**Respuesta API incluye:**

```typescript
{
  participants: EventParticipant[],
  event: { id, title, maxParticipants },
  stats: { total, checkedIn, notCheckedIn },
  pagination: { page, limit, totalCount, totalPages, hasNext, hasPrev }
}
```

**Estado:** ✅ Implementada

**Nota:** La búsqueda es local (filtra resultados de la página actual). Para búsqueda global, se requeriría parámetro de query en el backend.

---

### 20. Página de Listado Público de Partidos (`/matches`)

**Ruta:** `/matches`

**Protección:** ⚠️ Requiere autenticación

**Funcionalidades:**

- Listado paginado de partidos (12 por página)
- Filtros:
  - Tipo de partido (Singles/Doubles)
  - Estado (Completado/En progreso)
  - Pista ID
  - Evento ID
- Grid responsive (3-2-1 columnas)
- Contador de resultados
- Paginación con controles anterior/siguiente
- Empty state cuando no hay resultados

**Botones de navegación (si está logueado):**

- "Mis Partidos" → `/my-matches`
- "+ Registrar Partido" → `/matches/new`
- "Dashboard" → `/dashboard`

**Estado:** ✅ Implementada

**Integración API:** `GET /matches?page=1&limit=12&matchType=&completed=&courtId=&eventId=`

---

### 21. Página Registrar Partido Informal (`/matches/new`)

**Ruta:** `/matches/new`

**Protección:** ⚠️ Requiere autenticación

**Funcionalidades:**

- Formulario completo de creación (MatchForm)
- Selección de tipo: Singles o Doubles
- Input de IDs de participantes
- Campos opcionales: score, fechas, court ID, event ID
- Validación completa con Zod
- Alert informativo sobre partidos informales
- Card de ayuda sobre cómo registrar participantes

**Estado:** ✅ Implementada

**Nota:** Los participantes deben ser usuarios registrados (se requiere ID de usuario)

---

### 22. Página Mis Partidos (`/my-matches`)

**Ruta:** `/my-matches`

**Protección:** ⚠️ Requiere autenticación

**Secciones:**

1. **Estadísticas Generales** (4 Cards)

   - Total Partidos
   - Completados
   - Victorias
   - Win Rate

2. **Estadísticas por Tipo** (2 Cards)

   - Singles: Total, Victorias, Win Rate
   - Doubles: Total, Victorias, Win Rate

3. **Filtros**

   - Tipo de Partido (Singles/Doubles)
   - Estado (Completados/En progreso)

4. **Grid de Partidos**

   - Cards con información del partido
   - Botones de gestión (editar/eliminar) si soy creador
   - Paginación

5. **Empty State**
   - Mensaje cuando no hay partidos
   - Botón para registrar primer partido

**Funcionalidades:**

- Ver historial completo de partidos
- Estadísticas detalladas y win rate
- Filtrar por tipo y estado
- Editar partidos propios
- Eliminar partidos con confirmación
- Navegación a detalle de partido

**Estado:** ✅ Implementada

**Integraciones:**

- API: `GET /matches?page=1&limit=12&matchType=&completed=`
- API: `DELETE /matches/:id`
- Estadísticas calculadas en el backend

---

### 23. Página Detalle de Partido Informal (`/matches/[id]`)

**Ruta:** `/matches/[id]`

**Protección:** ⚠️ Requiere autenticación

**Secciones:**

1. **Header del Partido**

   - Badges: tipo, estado
   - Fecha formateada en español
   - Botones de gestión (si soy creador)

2. **Resultado** (Grid 2 columnas en desktop)

   **Columna Izquierda:**

   - Equipos con participantes
   - DUPR rating de cada jugador
   - Equipo ganador resaltado
   - Score formateado con separadores

   **Columna Derecha:**

   - Información del creador
   - Badge con inicial del nombre

3. **Información del Partido** (Sidebar)
   - Fecha de inicio
   - Fecha de fin
   - Duración en minutos
   - Pista (con link al club)
   - Evento (con link)
   - Fecha de registro

**Funcionalidades:**

- Ver información completa del partido
- Editar (si soy creador) → `/matches/:id/edit`
- Eliminar con modal de confirmación
- Links a pista/club y evento si existen

**Estado:** ✅ Implementada

---

### 24. Página Editar Partido Informal (`/matches/[id]/edit`)

**Ruta:** `/matches/[id]/edit`

**Protección:** ⚠️ Requiere autenticación y permisos (creador)

**Funcionalidades:**

- Formulario pre-cargado con datos actuales
- Validación de permisos (solo creador)
- Actualización parcial de campos
- Redirección automática tras guardar

**Estado:** ✅ Implementada

---

### 25. Página Partidos del Club (`/clubs/[id]/matches`)

**Ruta:** `/clubs/[id]/matches`

**Protección:** ⚠️ Requiere autenticación

**Funcionalidades:**

- Listado paginado de partidos del club (12 por página)
- Información del club en header
- Filtros:
  - Tipo de partido (Singles/Doubles)
  - Estado (Completado/En progreso)
  - Pista ID
  - Evento ID
- Grid responsive con MatchCards
- Botón "+ Registrar Partido" (solo creadores/admin)
- Empty state con CTA para crear primer partido

**Estado:** ✅ Implementada

**Integración API:** `GET /clubs/:id/matches?page=1&limit=12&matchType=&completed=&courtId=&eventId=`

---

### 26. Página Crear Partido de Club (`/clubs/[id]/matches/new`)

**Ruta:** `/clubs/[id]/matches/new`

**Protección:** ⚠️ Requiere autenticación y permisos (creador/SUPER_ADMIN)

**Funcionalidades:**

- Formulario completo de creación
- Selector de pista obligatorio (solo pistas activas)
- Validación de permisos
- Alert informativo sobre partidos de club
- Validación de existencia de pistas
- Card de ayuda con requisitos

**Requisitos:**

- Club debe tener al menos una pista activa
- Participantes deben ser miembros activos del club
- Pista es obligatoria

**Estado:** ✅ Implementada

---

### 27. Página Editar Partido de Club (`/clubs/[id]/matches/[matchId]/edit`)

**Ruta:** `/clubs/[id]/matches/[matchId]/edit`

**Protección:** ⚠️ Requiere autenticación y permisos (creador club/SUPER_ADMIN)

**Funcionalidades:**

- Formulario pre-cargado con datos actuales
- Validación de permisos del club
- Actualización parcial de campos
- Redirección tras guardar

**Estado:** ✅ Implementada

---

### 28. Página Detalle de Partido de Club (`/clubs/[id]/matches/[matchId]`)

**Ruta:** `/clubs/[id]/matches/[matchId]`

**Protección:** ⚠️ Requiere autenticación

**Secciones:**

1. **Header del Partido**

   - Badge especial "Partido de Club"
   - Badges: tipo, estado
   - Nombre del club
   - Fecha formateada
   - Botones de gestión (si tiene permisos)

2. **Resultado**

   - Equipos con participantes y DUPR rating
   - Equipo ganador resaltado
   - Score formateado

3. **Información del Club** (Card dedicado)

   - Logo del club
   - Nombre con link
   - Ciudad
   - Botón "Ver Club"

4. **Creador y Info** (Sidebar)

   - Datos del creador
   - Fecha de inicio/fin
   - Duración
   - Pista
   - Evento vinculado
   - Fecha de registro

5. **Acciones Rápidas** (Card en sidebar)
   - Ver todos los partidos del club
   - Ir al club
   - Ir al evento (si existe)

**Funcionalidades:**

- Ver información completa del partido de club
- Editar (si soy creador del club) → `/clubs/:id/matches/:matchId/edit`
- Eliminar con modal de confirmación
- Navegación contextual al club y evento

**Estado:** ✅ Implementada

---

## 🔐 Sistema de Autenticación

### Flujo de Autenticación

```mermaid
graph TD
    A[Usuario visita /] --> B{¿Tiene sesión?}
    B -->|Sí| C[Redirige a /dashboard]
    B -->|No| D[Redirige a /auth/signin]
    D --> E[Usuario hace login]
    E --> F[NextAuth valida credenciales]
    F -->|Válidas| G[Crea sesión]
    F -->|Inválidas| H[Muestra error]
    G --> C
    H --> E
```

### Tecnologías Usadas

**NextAuth.js:**

- Gestión de sesiones
- Múltiples providers (actualmente: credentials)
- JWT para tokens
- Cookies seguras

**Backend:**

- Prisma para acceso a BD
- bcryptjs para hash de contraseñas
- Validación con Zod

### Configuración

**Archivo:** `src/lib/auth.ts`

**Providers configurados:**

- ✅ Credentials (email + password)
- ⏳ Google OAuth (preparado, no usado aún)

**Estrategia de sesión:** JWT

**Callbacks:**

- `jwt`: Agrega `role` e `id` al token
- `session`: Expone `role` e `id` en la sesión del cliente

### Protección de Rutas

**Cliente (React):**

```tsx
"use client";

import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { useEffect } from "react";

export default function ProtectedPage() {
  const { data: session, status } = useSession();
  const router = useRouter();

  useEffect(() => {
    if (status === "unauthenticated") {
      router.push("/auth/signin");
    }
  }, [status, router]);

  if (status === "loading") return <p>Cargando...</p>;
  if (!session) return null;

  return <div>Contenido protegido</div>;
}
```

**Servidor (API Routes):**

```typescript
// src/lib/auth-middleware.ts
export async function verifyToken(request: NextRequest) {
  // Extrae y verifica JWT del header Authorization
}

export function withAuth(handler) {
  // Wrapper para proteger rutas de API
}

export function withRole(roles, handler) {
  // Wrapper para verificar roles específicos
}
```

### Sesiones

**Almacenamiento:**

- Tabla `sessions` en PostgreSQL
- Token en cookie HTTP-only

**Expiración:**

- Sesiones expiran según configuración de NextAuth
- Tokens JWT tienen expiración independiente

---

## 🔌 Sistema de API

### Helper de API (`src/lib/api.ts`)

Utilidad para hacer peticiones autenticadas a la API.

**Características:**

- Obtención automática de JWT token desde sesión NextAuth
- Cache de token (6 días)
- Manejo de errores con clase `ApiError`
- Soporte para métodos HTTP: GET, POST, PUT, DELETE

**Flujo de Autenticación:**

1. Verifica sesión activa de NextAuth
2. Obtiene JWT token desde `/api/auth/token`
3. Cachea el token
4. Agrega token en header `Authorization: Bearer <token>`
5. Backend valida token con middleware `withAuth`

**Uso:**

```typescript
import { api } from "@/lib/api";

// GET request
const data = await api.get("/clubs");

// POST request
const response = await api.post("/clubs", {
  name: "Mi Club",
  city: "Madrid",
});

// PUT request
await api.put("/clubs/123", { name: "Nuevo Nombre" });

// DELETE request
await api.delete("/clubs/123");

// Request sin autenticación
const data = await api.get("/clubs", { requiresAuth: false });
```

**Manejo de Errores:**

```typescript
try {
  await api.post("/clubs", data);
} catch (error) {
  if (error instanceof ApiError) {
    console.log(error.status); // 401, 403, etc.
    console.log(error.message); // Mensaje del error
  }
}
```

**Limpiar Cache (al hacer logout):**

```typescript
import { clearAuthTokenCache } from "@/lib/api";

clearAuthTokenCache();
await signOut();
```

### Endpoint de Token (`/api/auth/token`)

Convierte sesión de NextAuth en JWT token para autenticación de API.

**Funcionalidad:**

- Verifica sesión activa de NextAuth
- Genera JWT token firmado con `NEXTAUTH_SECRET`
- Token expira en 7 días
- Solo accesible con sesión válida

**Response:**

```json
{
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
}
```

## Tipos (`src/types/`)

### Tipos de Club (`src/types/club.ts`)

Definiciones TypeScript para trabajar con clubes.

**Interfaces principales:**

```typescript
// Club completo con relaciones
export interface Club {
  id: string;
  name: string;
  description?: string | null;
  address: string;
  city: string;
  phone?: string | null;
  email?: string | null;
  website?: string | null;
  logo?: string | null;
  stripeAccountId?: string | null;
  createdAt: string;
  updatedAt: string;
  creatorId: string;
  creator?: {
    id: string;
    name: string;
    email: string;
  };
  _count?: {
    memberships: number;
    events: number;
    courts: number;
  };
}

// Membresía de club
export interface ClubMembership {
  id: string;
  status: "ACTIVE" | "INACTIVE" | "PENDING" | "CANCELLED";
  joinedAt: string;
  expiresAt?: string | null;
  userId: string;
  clubId: string;
  user: {
    id: string;
    name: string;
    email: string;
    phone?: string | null;
    city?: string | null;
    avatar?: string | null;
    duprRating?: number | null;
  };
}

// Datos para crear club
export interface CreateClubData {
  name: string;
  description?: string;
  address: string;
  city: string;
  phone?: string;
  email?: string;
  website?: string;
  logo?: string;
}

// Datos para actualizar club
export interface UpdateClubData {
  name?: string;
  description?: string;
  address?: string;
  city?: string;
  phone?: string;
  email?: string;
  website?: string;
  logo?: string;
}

// Datos para agregar miembro
export interface AddMemberData {
  userId: string;
  status?: "ACTIVE" | "PENDING";
  expiresAt?: string;
}

// Datos para actualizar membresía
export interface UpdateMembershipData {
  status: "ACTIVE" | "INACTIVE" | "PENDING" | "CANCELLED";
  expiresAt?: string;
}

// Respuesta del listado de clubes
export interface ClubsResponse {
  clubs: Club[];
  pagination: {
    page: number;
    limit: number;
    totalCount: number;
    totalPages: number;
    hasNextPage: boolean;
    hasPreviousPage: boolean;
  };
}

// Respuesta del listado de miembros
export interface MembersResponse {
  club: {
    id: string;
    name: string;
  };
  members: ClubMembership[];
  pagination: {
    page: number;
    limit: number;
    totalCount: number;
    totalPages: number;
    hasNextPage: boolean;
    hasPreviousPage: boolean;
  };
}
```

---

### Tipos de Court (`src/types/court.ts`)

Definiciones TypeScript para trabajar con pistas y reservas.

**Interfaces principales:**

```typescript
// Pista completa con relaciones
export interface Court {
  id: string;
  name: string;
  description?: string | null;
  isActive: boolean;
  openTime: string;
  closeTime: string;
  slotDuration: number;
  clubId: string;
  club?: {
    id: string;
    name: string;
  };
  _count?: {
    events: number;
    matches: number;
    reservations?: number;
  };
}

// Datos para crear pista
export interface CreateCourtData {
  name: string;
  description?: string;
  isActive?: boolean;
  openTime?: string;
  closeTime?: string;
  slotDuration?: number;
}

// Datos para actualizar pista
export interface UpdateCourtData {
  name?: string;
  description?: string;
  isActive?: boolean;
  openTime?: string;
  closeTime?: string;
  slotDuration?: number;
}

// Respuesta del listado de pistas
export interface CourtsResponse {
  club: {
    id: string;
    name: string;
  };
  courts: Court[];
  pagination?: {
    page: number;
    limit: number;
    totalCount: number;
    totalPages: number;
    hasNextPage: boolean;
    hasPreviousPage: boolean;
  };
}

// Reserva de pista
export interface CourtReservation {
  id: string;
  startTime: string;
  endTime: string;
  courtId: string;
  userId: string;
  eventId?: string | null;
  matchId?: string | null;
  createdAt: string;
  updatedAt: string;
  user?: {
    id: string;
    name: string;
    email: string;
  };
  event?: {
    id: string;
    title: string;
  };
  match?: {
    id: string;
    matchType: string;
  };
}

// Slot de tiempo en el horario
export interface TimeSlot {
  time: string; // Formato "HH:mm"
  isAvailable: boolean;
  reservation?: CourtReservation;
}

// Respuesta del horario de pista
export interface CourtScheduleResponse {
  court: Court;
  date: string;
  slots: TimeSlot[];
}

// Datos para crear reserva
export interface CreateReservationData {
  courtId: string;
  startTime: string; // ISO DateTime
  endTime: string; // ISO DateTime
}
```

---

### Tipos de Evento (`src/types/event.ts`)

Definiciones TypeScript para trabajar con eventos.

**Interfaces principales:**

```typescript
// Event completo con relaciones
export interface Event extends PrismaEvent {
  club: {
    id: string;
    name: string;
    city: string;
    logo?: string | null;
    creatorId: string; // ✅ IMPORTANTE: Para verificar permisos
  };
  court?: {
    id: string;
    name: string;
  } | null;
  _count?: {
    participants: number;
    matches: number;
  };
}

// Event con información del usuario participante
export interface EventWithParticipation extends Event {
  isParticipant: boolean;
  isCheckedIn: boolean;
  canCheckIn: boolean;
}

// Datos para crear evento
export interface CreateEventData {
  title: string;
  description?: string;
  type: EventType;
  visibility: EventVisibility;
  startDateTime: string;
  endDateTime: string;
  maxParticipants?: number;
  price?: number;
  clubId: string;
  courtId?: string;
}

// Datos para actualizar evento
export interface UpdateEventData {
  title?: string;
  description?: string;
  type?: EventType;
  visibility?: EventVisibility;
  status?: EventStatus;
  startDateTime?: string;
  endDateTime?: string;
  maxParticipants?: number;
  price?: number;
  courtId?: string;
}

// Participante de evento
export interface EventParticipant {
  id: string;
  userId: string;
  eventId: string;
  registeredAt: string;
  checkedIn: boolean;
  checkedInAt: string | null;
  user: {
    id: string;
    name: string;
    email: string;
    avatar?: string | null;
    city?: string | null;
    duprRating?: number | null;
  };
}

// Respuesta del listado de eventos
export interface EventsResponse {
  events: Event[];
  pagination: {
    page: number;
    limit: number;
    totalCount: number;
    totalPages: number;
    hasNextPage: boolean;
    hasPreviousPage: boolean;
  };
}

// Respuesta de eventos cercanos
export interface NearbyEventsResponse {
  events: Event[];
  city: string;
  pagination: {
    page: number;
    limit: number;
    totalCount: number;
    totalPages: number;
    hasNextPage: boolean;
    hasPreviousPage: boolean;
  };
}

// Respuesta del listado de participantes
export interface ParticipantsResponse {
  participants: EventParticipant[];
  event: {
    id: string;
    title: string;
    maxParticipants?: number | null;
  };
  stats: {
    total: number;
    checkedIn: number;
    notCheckedIn: number;
  };
  pagination: {
    page: number;
    limit: number;
    totalCount: number;
    totalPages: number;
    hasNextPage: boolean;
    hasPreviousPage: boolean;
  };
}

// Filtros para búsqueda de eventos
export interface EventFilters {
  page?: number;
  limit?: number;
  clubId?: string;
  type?: EventType;
  status?: EventStatus;
  city?: string;
  startDate?: string;
  endDate?: string;
  upcoming?: boolean;
}

// Filtros para eventos cercanos
export interface NearbyEventFilters {
  page?: number;
  limit?: number;
  type?: EventType;
  daysAhead?: number;
  openOnly?: boolean;
}
```

---

### Tipos de Usuario (`src/types/user.ts`)

Definiciones TypeScript para trabajar con usuarios.

**Interfaces principales:**

```typescript
// Usuario completo
export interface User {
  id: string;
  email: string;
  name: string;
  phone?: string | null;
  avatar?: string | null;
  city?: string | null;
  duprId?: string | null;
  duprRating?: number | null;
  role: "USER" | "SUPER_ADMIN";
  createdAt: string;
  updatedAt: string;
}

// Datos para actualizar perfil
export interface UpdateProfileData {
  name?: string;
  phone?: string;
  city?: string;
  avatar?: string;
  duprId?: string;
  currentPassword?: string;
  newPassword?: string;
}

// Datos para cambiar contraseña
export interface ChangePasswordData {
  currentPassword: string;
  newPassword: string;
}
```

Definiciones TypeScript para trabajar con eventos.

**Interfaces principales:**

````typescript
// Event completo con relaciones
export interface Event extends PrismaEvent {
  club: {
    id: string;
    name: string;
    city: string;
    logo?: string | null;
    creatorId: string; // ✅ IMPORTANTE: Para verificar permisos
  };
  court?: {
    id: string;
    name: string;
  } | null;
  _count?: {
    participants: number;
    matches: number;
  };
}

// Event con información del usuario participante
export interface EventWithParticipation extends Event {
  isParticipant: boolean;
  isCheckedIn: boolean;
  canCheckIn: boolean;
}

// Participante de evento
export interface EventParticipant {
  id: string;
  userId: string;
  eventId: string;
  registeredAt: string;
  checkedIn: boolean;
  checkedInAt: string | null;
  user: {
    id: string;
    name: string;
    email: string;
    avatar?: string | null;
    city?: string | null;
    duprRating?: number | null;
  };
}

// Respuesta del listado de participantes
export interface ParticipantsResponse {
  participants: EventParticipant[];
  event: {
    id: string;
    title: string;
    maxParticipants?: number | null;
  };
  stats: {
    total: number;
    checkedIn: number;
    notCheckedIn: number;
  };
  pagination: {
    page: number;
    limit: number;
    totalCount: number;
    totalPages: number;
    hasNextPage: boolean;
    hasPreviousPage: boolean;
  };
}

---

## 🎨 Estilos y Diseño

### Tailwind CSS v3

**Versión:** 3.4.1

**Archivo de configuración:** `tailwind.config.js`

**Características:**

- Utility-first CSS
- Purge automático de clases no usadas
- Personalización mediante variables CSS
- Soporte para dark mode
- `@apply`, `@layer` y directivas de Tailwind

### Sistema de Colores (shadcn/ui)

Definidos en `src/app/globals.css`:

```css
:root {
  --background: 210 40% 96.1%; /* Fondo gris claro */
  --foreground: 222.2 84% 4.9%; /* Texto oscuro */
  --primary: 222.2 47.4% 11.2%; /* Color primario */
  --secondary: 210 40% 96.1%; /* Color secundario */
  --muted: 210 40% 96.1%; /* Color apagado */
  --accent: 210 40% 96.1%; /* Color de acento */
  --destructive: 0 84.2% 60.2%; /* Color de error */
  --border: 214.3 31.8% 91.4%; /* Color de bordes */
  --input: 214.3 31.8% 91.4%; /* Color de inputs */
  --ring: 222.2 84% 4.9%; /* Color de focus ring */
}
````

**Dark Mode:**

- Variables CSS preparadas en `.dark` class
- Cambio con clase `.dark` en `<html>`
- Configurado con `darkMode: ["class"]` en tailwind.config.js

## Tipos (`src/types/`)

### Tipos de Club (`src/types/club.ts`)

Definiciones TypeScript para trabajar con clubes.

**Interfaces principales:**

```typescript
// Club completo con relaciones
export interface Club {
  id: string;
  name: string;
  description?: string | null;
  address: string;
  city: string;
  phone?: string | null;
  email?: string | null;
  website?: string | null;
  logo?: string | null;
  stripeAccountId?: string | null;
  createdAt: string;
  updatedAt: string;
  creatorId: string;
  creator?: {
    id: string;
    name: string;
    email: string;
  };
  _count?: {
    memberships: number;
    events: number;
    courts: number;
  };
}

// Membresía de club
export interface ClubMembership {
  id: string;
  status: "ACTIVE" | "INACTIVE" | "PENDING" | "CANCELLED";
  joinedAt: string;
  expiresAt?: string | null;
  userId: string;
  clubId: string;
  user: {
    id: string;
    name: string;
    email: string;
    phone?: string | null;
    city?: string | null;
    avatar?: string | null;
    duprRating?: number | null;
  };
}

// Datos para crear club
export interface CreateClubData {
  name: string;
  description?: string;
  address: string;
  city: string;
  phone?: string;
  email?: string;
  website?: string;
  logo?: string;
}

// Datos para actualizar club
export interface UpdateClubData {
  name?: string;
  description?: string;
  address?: string;
  city?: string;
  phone?: string;
  email?: string;
  website?: string;
  logo?: string;
}

// Datos para agregar miembro
export interface AddMemberData {
  userId: string;
  status?: "ACTIVE" | "PENDING";
  expiresAt?: string;
}

// Datos para actualizar membresía
export interface UpdateMembershipData {
  status: "ACTIVE" | "INACTIVE" | "PENDING" | "CANCELLED";
  expiresAt?: string;
}

// Respuesta del listado de clubes
export interface ClubsResponse {
  clubs: Club[];
  pagination: {
    page: number;
    limit: number;
    totalCount: number;
    totalPages: number;
    hasNextPage: boolean;
    hasPreviousPage: boolean;
  };
}

// Respuesta del listado de miembros
export interface MembersResponse {
  club: {
    id: string;
    name: string;
  };
  members: ClubMembership[];
  pagination: {
    page: number;
    limit: number;
    totalCount: number;
    totalPages: number;
    hasNextPage: boolean;
    hasPreviousPage: boolean;
  };
}
```

---

### Tipos de Court (`src/types/court.ts`)

Definiciones TypeScript para trabajar con pistas.

**Interfaces principales:**

```typescript
// Pista completa con relaciones
export interface Court {
  id: string;
  name: string;
  description?: string | null;
  isActive: boolean;
  clubId: string;
  club?: {
    id: string;
    name: string;
  };
  _count?: {
    events: number;
    matches: number;
  };
}

// Datos para crear pista
export interface CreateCourtData {
  name: string;
  description?: string;
  isActive?: boolean;
}

// Datos para actualizar pista
export interface UpdateCourtData {
  name?: string;
  description?: string;
  isActive?: boolean;
}

// Respuesta del listado de pistas
export interface CourtsResponse {
  club: {
    id: string;
    name: string;
  };
  courts: Court[];
  pagination?: {
    page: number;
    limit: number;
    totalCount: number;
    totalPages: number;
    hasNextPage: boolean;
    hasPreviousPage: boolean;
  };
}
```

---

### Tipos de Evento (`src/types/event.ts`)

Definiciones TypeScript para trabajar con eventos.

**Interfaces principales:**

```typescript
// Event completo con relaciones
export interface Event extends PrismaEvent {
  club: {
    id: string;
    name: string;
    city: string;
    logo?: string | null;
    creatorId: string; // ✅ IMPORTANTE: Para verificar permisos
  };
  court?: {
    id: string;
    name: string;
  } | null;
  _count?: {
    participants: number;
    matches: number;
  };
}

// Event con información del usuario participante
export interface EventWithParticipation extends Event {
  isParticipant: boolean;
  isCheckedIn: boolean;
  canCheckIn: boolean;
}

// Datos para crear evento
export interface CreateEventData {
  title: string;
  description?: string;
  type: EventType;
  visibility: EventVisibility;
  startDateTime: string;
  endDateTime: string;
  maxParticipants?: number;
  price?: number;
  clubId: string;
  courtId?: string;
}

// Datos para actualizar evento
export interface UpdateEventData {
  title?: string;
  description?: string;
  type?: EventType;
  visibility?: EventVisibility;
  status?: EventStatus;
  startDateTime?: string;
  endDateTime?: string;
  maxParticipants?: number;
  price?: number;
  courtId?: string;
}

// Participante de evento
export interface EventParticipant {
  id: string;
  userId: string;
  eventId: string;
  registeredAt: string;
  checkedIn: boolean;
  checkedInAt: string | null;
  user: {
    id: string;
    name: string;
    email: string;
    avatar?: string | null;
    city?: string | null;
    duprRating?: number | null;
  };
}

// Respuesta del listado de eventos
export interface EventsResponse {
  events: Event[];
  pagination: {
    page: number;
    limit: number;
    totalCount: number;
    totalPages: number;
    hasNextPage: boolean;
    hasPreviousPage: boolean;
  };
}

// Respuesta de eventos cercanos
export interface NearbyEventsResponse {
  events: Event[];
  city: string;
  pagination: {
    page: number;
    limit: number;
    totalCount: number;
    totalPages: number;
    hasNextPage: boolean;
    hasPreviousPage: boolean;
  };
}

// Respuesta del listado de participantes
export interface ParticipantsResponse {
  participants: EventParticipant[];
  event: {
    id: string;
    title: string;
    maxParticipants?: number | null;
  };
  stats: {
    total: number;
    checkedIn: number;
    notCheckedIn: number;
  };
  pagination: {
    page: number;
    limit: number;
    totalCount: number;
    totalPages: number;
    hasNextPage: boolean;
    hasPreviousPage: boolean;
  };
}

// Filtros para búsqueda de eventos
export interface EventFilters {
  page?: number;
  limit?: number;
  clubId?: string;
  type?: EventType;
  status?: EventStatus;
  city?: string;
  startDate?: string;
  endDate?: string;
  upcoming?: boolean;
}

// Filtros para eventos cercanos
export interface NearbyEventFilters {
  page?: number;
  limit?: number;
  type?: EventType;
  daysAhead?: number;
  openOnly?: boolean;
}
```

---

### Tipos de Usuario (`src/types/user.ts`)

Definiciones TypeScript para trabajar con usuarios.

**Interfaces principales:**

```typescript
// Usuario completo
export interface User {
  id: string;
  email: string;
  name: string;
  phone?: string | null;
  avatar?: string | null;
  city?: string | null;
  duprId?: string | null;
  duprRating?: number | null;
  role: "USER" | "SUPER_ADMIN";
  createdAt: string;
  updatedAt: string;
}

// Datos para actualizar perfil
export interface UpdateProfileData {
  name?: string;
  phone?: string;
  city?: string;
  avatar?: string;
  duprId?: string;
  currentPassword?: string;
  newPassword?: string;
}

// Datos para cambiar contraseña
export interface ChangePasswordData {
  currentPassword: string;
  newPassword: string;
}
```

Definiciones TypeScript para trabajar con eventos.

**Interfaces principales:**

````typescript
// Event completo con relaciones
export interface Event extends PrismaEvent {
  club: {
    id: string;
    name: string;
    city: string;
    logo?: string | null;
    creatorId: string; // ✅ IMPORTANTE: Para verificar permisos
  };
  court?: {
    id: string;
    name: string;
  } | null;
  _count?: {
    participants: number;
    matches: number;
  };
}

// Event con información del usuario participante
export interface EventWithParticipation extends Event {
  isParticipant: boolean;
  isCheckedIn: boolean;
  canCheckIn: boolean;
}

// Participante de evento
export interface EventParticipant {
  id: string;
  userId: string;
  eventId: string;
  registeredAt: string;
  checkedIn: boolean;
  checkedInAt: string | null;
  user: {
    id: string;
    name: string;
    email: string;
    avatar?: string | null;
    city?: string | null;
    duprRating?: number | null;
  };
}

// Respuesta del listado de participantes
export interface ParticipantsResponse {
  participants: EventParticipant[];
  event: {
    id: string;
    title: string;
    maxParticipants?: number | null;
  };
  stats: {
    total: number;
    checkedIn: number;
    notCheckedIn: number;
  };
  pagination: {
    page: number;
    limit: number;
    totalCount: number;
    totalPages: number;
    hasNextPage: boolean;
    hasPreviousPage: boolean;
  };
}

---

## 🎨 Estilos y Diseño

### Tailwind CSS v3

**Versión:** 3.4.1

**Archivo de configuración:** `tailwind.config.js`

**Características:**

- Utility-first CSS
- Purge automático de clases no usadas
- Personalización mediante variables CSS
- Soporte para dark mode
- `@apply`, `@layer` y directivas de Tailwind

### Sistema de Colores (shadcn/ui)

Definidos en `src/app/globals.css`:

```css
:root {
  --background: 210 40% 96.1%; /* Fondo gris claro */
  --foreground: 222.2 84% 4.9%; /* Texto oscuro */
  --primary: 222.2 47.4% 11.2%; /* Color primario */
  --secondary: 210 40% 96.1%; /* Color secundario */
  --muted: 210 40% 96.1%; /* Color apagado */
  --accent: 210 40% 96.1%; /* Color de acento */
  --destructive: 0 84.2% 60.2%; /* Color de error */
  --border: 214.3 31.8% 91.4%; /* Color de bordes */
  --input: 214.3 31.8% 91.4%; /* Color de inputs */
  --ring: 222.2 84% 4.9%; /* Color de focus ring */
}
````

**Dark Mode:**

- Variables CSS preparadas en `.dark` class
- Cambio con clase `.dark` en `<html>`
- Configurado con `darkMode: ["class"]` en tailwind.config.js

---

## Diseño:

### Responsive Design

**Breakpoints de Tailwind:**

- `sm`: 640px
- `md`: 768px
- `lg`: 1024px
- `xl`: 1280px
- `2xl`: 1536px

**Ejemplos usados:**

```tsx
<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
  {/* Responsive grid */}
</div>
```

### Utilidades

**Función `cn` (`src/lib/utils.ts`):**

```typescript
import { clsx } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs) {
  return twMerge(clsx(inputs));
}
```

**Propósito:**

- Combina clases de Tailwind sin conflictos
- Permite clases condicionales

**Uso:**

```tsx
<div
  className={cn("base-class", condition && "conditional-class", className)}
/>
```

---

## 🗺️ Roadmap - Próximas Implementaciones

### Fase 1: Componentes UI Base Restantes (1 semana)

#### Alta Prioridad

- [x] **Alert** - Mensajes de alerta estáticos ✅
- [x] **Toast** - Notificaciones temporales ✅
- [x] **Dialog/Modal** - Ventanas modales ✅
- [x] **Dropdown Menu** - Menús desplegables ✅
- [x] **Table** - Tablas de datos ✅
- [x] **Badge** - Etiquetas de estado ✅
- [ ] **Avatar** - Fotos de perfil
- [ ] **Skeleton** - Loading placeholders

#### Media Prioridad

- [ ] **Tabs** - Navegación entre secciones
- [ ] **Select** - Campos de selección
- [ ] **Checkbox/Radio** - Opciones múltiples
- [ ] **Switch** - Toggle on/off
- [x] **Textarea** - Campos de texto largo
- [ ] **Progress** - Barras de progreso

#### Baja Prioridad

- [ ] **Accordion** - Secciones colapsables
- [ ] **Tooltip** - Información al hover
- [ ] **Popover** - Contenido emergente
- [ ] **Calendar** - Selector de fechas
- [ ] **Command** - Command palette

---

### Fase 2: Gestión de Perfil (1 semana) - ✅ COMPLETADA

- [x] **Página de Perfil** (`/profile`) ✅

  - [x] Ver información del usuario
  - [x] Editar nombre, teléfono, ciudad
  - [x] Cambiar contraseña
  - [x] Subir avatar (URL por ahora)
  - [x] Conectar DUPR ID

- [x] **Formularios** ✅
  - [x] Formulario de edición de perfil (ProfileForm)
  - [x] Formulario de cambio de contraseña (ChangePasswordForm)
  - [x] Validación de campos con Zod

---

### Fase 3: Gestión de Clubes (2-3 semanas) - COMPLETADA 90%

#### Vista Usuario Regular ✅

- [x] **Explorar Clubes** (`/clubs`) ✅

  - [x] Lista de clubes disponibles
  - [x] Búsqueda por nombre
  - [x] Filtros (ciudad)
  - [x] Paginación

- [x] **Detalle de Club** (`/clubs/[id]`) ✅

  - [x] Información del club
  - [x] Información de contacto
  - [x] Información del creador
  - [x] Estadísticas (miembros, pistas, eventos)
  - [x] Botón "Unirse" (solicitud de membresía)
  - [ ] Lista de pistas (pendiente)
  - [ ] Próximos eventos (pendiente)

- [x] **Mis Clubes** (`/my-clubs`) ✅

  - [x] Lista de clubes donde soy miembro
  - [x] Estado de membresía (badges coloreados)
  - [x] Filtros por estado (Activos, Pendientes, Todos)
  - [x] Salir de club / Cancelar solicitud
  - [x] Estadísticas de cada club

#### Vista Creador de Club ✅

- [x] **Crear Club** (`/clubs/new`) ✅

  - [x] Formulario de creación
  - [x] Validación completa
  - [ ] Subir logo (por ahora URL)

- [x] **Editar Club** (`/clubs/[id]/edit`) ✅

  - [x] Formulario de edición
  - [x] Pre-carga de datos
  - [x] Validación de permisos

- [x] **Gestionar Miembros** (`/clubs/[id]/members`) ✅

  - [x] Lista de miembros
  - [x] Agregar miembros (por ID)
  - [x] Cambiar estados de membresía
  - [x] Eliminar miembros
  - [ ] Búsqueda de usuarios por email/nombre
  - [ ] Filtros avanzados

- [x] **Eliminar Club** ✅

  - [x] Modal de confirmación
  - [x] Validación de permisos
  - [x] Eliminación en cascada

- [ ] **Dashboard del Club** (`/clubs/[id]/manage`)

  - [ ] Estadísticas del club
  - [ ] Gráficos de actividad
  - [ ] Accesos rápidos

- [x] **Pistas** (`/clubs/[id]/courts`) ✅
  - [x] Lista de pistas (activas/inactivas separadas)
  - [x] Crear pistas con configuración de horarios
  - [x] Editar pistas (incluye horarios)
  - [x] Activar/desactivar pistas
  - [x] Eliminar pistas (con validaciones)
  - [x] Ver horario diario de cada pista
  - [x] Sistema de reservas por slots
  - [x] Gestión de reservas (crear/cancelar)
  - [x] Stats en tiempo real
  - [x] Control de permisos
  - [x] Responsive design

---

### Fase 4: Gestión de Eventos (2-3 semanas) - ✅ COMPLETADA

#### Vista Usuario Regular

- [x] **Explorar Eventos** (`/events`)

  - [x] Lista de eventos disponibles
  - [x] Filtros (tipo, ciudad, estado)
  - [x] Búsqueda por título/descripción
  - [x] Paginación (12 por página)
  - [x] Inscribirse desde los cards
  - [x] Cancelar inscripción

- [x] **Eventos Cercanos** (`/events/nearby`)

  - [x] Eventos en mi ciudad
  - [x] Filtros (tipo, días adelante, solo abiertos)
  - [x] Paginación

- [x] **Detalle de Evento** (`/events/[id]`)

  - [x] Información completa con badges dinámicos
  - [x] Detalles de fecha, ubicación y pista
  - [x] Estadísticas (participantes, precio, partidos)
  - [x] Botón "Inscribirse" con validaciones
  - [x] Botón "Hacer Check-in" (ventana 30 min antes)
  - [x] Botón "Cancelar inscripción" con modal
  - [x] Barra de progreso de participantes
  - [x] Navegación al club organizador

- [x] **Mis Eventos** (`/my-events`)

  - [x] Eventos donde estoy inscrito
  - [x] Tabs: Próximos, Pasados, Todos
  - [x] Cancelar inscripción
  - [x] Paginación por tab

- [x] **Inscribirse a eventos**
- [x] **Cancelar inscripción**
- [x] **Check-in a eventos** (en ventana de tiempo)

#### Vista Creador de Club ✅

- [x] **Crear Evento** (desde página del club)

  - [x] Modal con formulario completo
  - [x] Selección automática de pistas del club
  - [x] Configuración de visibilidad
  - [x] Precio y límite de participantes
  - [x] Validación completa de fechas
  - [x] Integrado en tab "Eventos" del club

- [x] **Gestionar Evento** (`/events/[id]/manage`)

  - [x] Editar información completa
  - [x] Cambiar estado (SCHEDULED, ONGOING, COMPLETED, CANCELLED)
  - [x] Modificar pista asignada
  - [x] Actualizar fechas y configuración
  - [x] Zona de peligro con eliminación
  - [x] Validación de permisos (creatorId del club)

- [x] **Participantes** (`/events/[id]/participants`)
  - [x] Lista completa paginada
  - [x] Estados de check-in con badges
  - [x] Estadísticas (total, check-in, pendientes)
  - [x] Hacer check-in manual
  - [x] Deshacer check-in
  - [x] Filtros por estado de check-in
  - [x] Búsqueda por nombre/email
  - [x] Validación de permisos

**Notas de Implementación:**

- ✅ Permisos verificados con `event.club.creatorId`
- ✅ Check-in disponible 30 min antes del evento
- ✅ Validación de visibilidad (OPEN, MEMBERS_ONLY, PRIVATE)
- ✅ Formateo de fechas en español con capitalize
- ✅ Badges dinámicos según contexto
- ✅ Modales de confirmación en acciones destructivas
- ✅ Integración completa con API
- ✅ Responsive design en todas las páginas

---

### Fase 5: Gestión de Partidos (2 semanas) - ✅ COMPLETADA

#### Partidos Informales ✅

- [x] **Registrar Partido** (`/matches/new`)
  - [x] Formulario completo con validación
  - [x] Selector Singles/Doubles
  - [x] Input de participantes por ID
  - [x] Score opcional con validación de formato
  - [x] Fechas y duración opcionales
- [x] **Mis Partidos** (`/my-matches`)
  - [x] Historial completo con paginación
  - [x] Estadísticas generales (total, wins, win rate)
  - [x] Estadísticas por tipo (Singles/Doubles)
  - [x] Filtros (tipo, estado)
  - [x] Editar/eliminar partidos propios
- [x] **Detalle de Partido** (`/matches/[id]`)
  - [x] Vista completa del partido
  - [x] Equipos con DUPR rating
  - [x] Score formateado
  - [x] Información de creador, pista, evento
  - [x] Botones de gestión (creador)

#### Partidos de Club ✅

- [x] **Partidos del Club** (`/clubs/[id]/matches`)
  - [x] Lista paginada de partidos
  - [x] Filtros (tipo, estado, pista, evento)
  - [x] Botón crear (creador/admin)
  - [x] Integración con API
- [x] **Crear Partido de Club** (`/clubs/[id]/matches/new`)
  - [x] Formulario completo
  - [x] Selector de pista obligatorio
  - [x] Validación de pistas activas
  - [x] Validación de permisos
- [x] **Detalle de Partido de Club** (`/clubs/[id]/matches/[matchId]`)
  - [x] Vista completa con info del club
  - [x] Card dedicado al club
  - [x] Acciones rápidas en sidebar
  - [x] Navegación contextual
- [x] **Editar Partido de Club** (`/clubs/[id]/matches/[matchId]/edit`)
  - [x] Formulario pre-cargado
  - [x] Validación de permisos

#### Componentes ✅

- [x] **MatchForm** - Formulario reutilizable
- [x] **MatchCard** - Card para listados

#### Integraciones ✅

- [x] Tab "Partidos" en detalle de club
- [x] Botón "Mis Partidos" habilitado en Dashboard
- [x] Página de listado público (`/matches`)
- [x] Sistema completo de permisos
- [x] Validaciones de score y participantes
- [x] Estadísticas y win rate

#### Características Implementadas ✅

- ✅ Partidos Singles (1vs1) y Doubles (2vs2)
- ✅ Selección de ganador por equipo
- ✅ Score con formato validado (1-5 sets)
- ✅ Cálculo automático de duración
- ✅ Estadísticas por tipo de partido
- ✅ Win rate calculado
- ✅ Paginación en todos los listados
- ✅ Filtros avanzados
- ✅ Modales de confirmación
- ✅ Empty states
- ✅ Links contextuales según tipo de partido
- ✅ Integración completa con API

**Pendiente (mejoras futuras):**

- [ ] Búsqueda de usuarios por nombre/email
- [ ] Búsqueda de miembros del club
- [ ] Selector de ganador automático desde score
- [ ] Gráficos de estadísticas
- [ ] Exportar historial
- [ ] Filtro por rango de fechas

---

### Fase 6: Estadísticas y Analytics (1-2 semanas)

- [ ] **Dashboard de Estadísticas** (`/stats`)

  - [ ] Gráficos de partidos ganados/perdidos
  - [ ] Win rate por tipo de partido
  - [ ] Evolución temporal
  - [ ] Comparación con otros jugadores

- [ ] **Estadísticas del Club** (`/clubs/[id]/stats`)

  - [ ] Miembros activos
  - [ ] Eventos realizados
  - [ ] Partidos jugados
  - [ ] Asistencia promedio

- [ ] **Ranking** (`/rankings`)
  - [ ] Ranking global
  - [ ] Ranking por ciudad
  - [ ] Filtros (nivel DUPR)

---

### Fase 7: Administración (1 semana)

#### Solo SUPER_ADMIN

- [ ] **Panel de Administración** (`/admin`)

  - [ ] Métricas de la plataforma
  - [ ] Usuarios totales
  - [ ] Clubes activos
  - [ ] Eventos recientes

- [ ] **Gestión de Usuarios** (`/admin/users`)

  - [ ] Lista completa de usuarios
  - [ ] Búsqueda y filtros
  - [ ] Ver detalles
  - [ ] Eliminar usuarios

- [ ] **Gestión de Clubes** (`/admin/clubs`)

  - [ ] Lista de todos los clubes
  - [ ] Editar/eliminar clubes
  - [ ] Verificar información

- [ ] **Logs y Auditoría** (`/admin/logs`)
  - [ ] Actividad reciente
  - [ ] Errores
  - [ ] Acciones administrativas

---

### Fase 8: Pagos (Stripe) (2-3 semanas)

- [ ] **Configuración Stripe**

  - [ ] Stripe Connect para clubes
  - [ ] Webhooks
  - [ ] Testing mode

- [ ] **Eventos de Pago**

  - [ ] Checkout flow
  - [ ] Confirmación de pago
  - [ ] Recibos

- [ ] **Suscripciones de Clubes**

  - [ ] Suscripción mensual
  - [ ] Portal de gestión
  - [ ] Cancelación

- [ ] **Historial de Pagos**
  - [ ] Ver mis pagos
  - [ ] Descargar recibos
  - [ ] Reembolsos

---

### Fase 9: Features Adicionales (Continuo)

- [ ] **Notificaciones**

  - [ ] Sistema de notificaciones en tiempo real
  - [ ] Email notifications
  - [ ] Push notifications (PWA)

- [ ] **Chat/Mensajería**

  - [ ] Mensajes entre usuarios
  - [ ] Chat de eventos
  - [ ] Notificaciones

- [ ] **Búsqueda Avanzada**

  - [ ] Búsqueda global
  - [ ] Filtros complejos
  - [ ] Autocompletado

- [ ] **PWA**

  - [ ] Installable app
  - [ ] Offline mode
  - [ ] Push notifications

- [ ] **Dark Mode**

  - [ ] Toggle en UI
  - [ ] Persistencia de preferencia

- [ ] **Internacionalización**

  - [ ] Español (actual)
  - [ ] Inglés
  - [ ] Otros idiomas

- [ ] **Integración DUPR**
  - [ ] Verificación de DUPR ID
  - [ ] Sincronización de rating
  - [ ] Actualización automática

---

## 👨‍💻 Guía de Desarrollo

### Convenciones de Código

#### Nomenclatura

**Componentes:**

- PascalCase: `LoginForm.tsx`, `DashboardCard.tsx`
- Un componente por archivo
- Nombre del archivo = Nombre del componente

**Funciones:**

- camelCase: `handleSubmit`, `fetchUserData`
- Descriptivas y verbosas

**Variables:**

- camelCase: `userId`, `isLoading`
- Booleanos con prefijo `is`, `has`, `should`

**Tipos:**

- PascalCase: `User`, `LoginFormData`
- Interfaces con prefijo `I` opcional

#### Estructura de Componentes

```tsx
"use client"; // Si usa hooks o estado

import { useState } from "react";
import { useRouter } from "next/navigation";
// ... otros imports

// Types/Interfaces
interface ComponentProps {
  prop1: string;
  prop2?: number;
}

// Component
export default function ComponentName({ prop1, prop2 }: ComponentProps) {
  // 1. Hooks
  const [state, setState] = useState();
  const router = useRouter();

  // 2. Handlers
  const handleClick = () => {
    // ...
  };

  // 3. Effects
  useEffect(() => {
    // ...
  }, []);

  // 4. Render
  return <div>{/* JSX */}</div>;
}
```

#### Estilos con Tailwind

**Orden de clases:**

1. Layout (flex, grid, etc.)
2. Spacing (p, m, gap)
3. Sizing (w, h)
4. Typography (text, font)
5. Colors (bg, text)
6. Borders
7. Effects (shadow, opacity)
8. States (hover, focus)

**Ejemplo:**

```tsx
<div className="flex flex-col gap-4 p-6 w-full text-lg font-semibold bg-white border rounded-lg shadow-md hover:shadow-lg">
```

### Creación de Nuevos Componentes

#### 1. Componentes UI Base

```bash
# Crear archivo
touch src/components/ui/nombre-componente.tsx
```

**Template:**

```tsx
import * as React from "react";
import { cn } from "@/lib/utils";

export interface NombreComponenteProps
  extends React.HTMLAttributes<HTMLDivElement> {
  // Props adicionales
}

const NombreComponente = React.forwardRef<
  HTMLDivElement,
  NombreComponenteProps
>(({ className, ...props }, ref) => (
  <div ref={ref} className={cn("base-classes-here", className)} {...props} />
));
NombreComponente.displayName = "NombreComponente";

export { NombreComponente };
```

#### 2. Componentes de Página

```bash
# Crear directorio y archivo
mkdir -p src/app/nueva-ruta
touch src/app/nueva-ruta/page.tsx
```

**Template:**

```tsx
"use client";

import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { useEffect } from "react";

export default function NuevaPaginaPage() {
  const { data: session, status } = useSession();
  const router = useRouter();

  // Protección de ruta (si aplica)
  useEffect(() => {
    if (status === "unauthenticated") {
      router.push("/auth/signin");
    }
  }, [status, router]);

  if (status === "loading") {
    return <div>Cargando...</div>;
  }

  return <div>{/* Contenido */}</div>;
}
```

### Integración con API

#### Fetch con Error Handling

```typescript
const [data, setData] = useState(null);
const [error, setError] = useState(null);
const [isLoading, setIsLoading] = useState(false);

const fetchData = async () => {
  setIsLoading(true);
  setError(null);

  try {
    const response = await fetch("/api/endpoint", {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
      },
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.error || "Error desconocido");
    }

    const result = await response.json();
    setData(result);
  } catch (err) {
    setError(err.message);
  } finally {
    setIsLoading(false);
  }
};
```

#### Custom Hook para Fetch

```typescript
// src/hooks/useFetch.ts
export function useFetch<T>(url: string) {
  const [data, setData] = useState<T | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const refetch = async () => {
    setIsLoading(true);
    setError(null);

    try {
      const response = await fetch(url);
      if (!response.ok) throw new Error("Error en la petición");
      const result = await response.json();
      setData(result);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Error desconocido");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    refetch();
  }, [url]);

  return { data, error, isLoading, refetch };
}
```

### Testing

#### Tests Manuales

Ver documento: **Flujo de Pruebas** (documento separado)

#### Tests Automatizados (Futuro)

Herramientas recomendadas:

- **Jest** - Unit tests
- **React Testing Library** - Component tests
- **Cypress** o **Playwright** - E2E tests

### Git Workflow

#### Commits

Formato: `tipo(scope): mensaje`

**Tipos:**

- `feat`: Nueva funcionalidad
- `fix`: Bug fix
- `docs`: Documentación
- `style`: Formato de código
- `refactor`: Refactorización
- `test`: Tests
- `chore`: Tareas de mantenimiento

**Ejemplos:**

```bash
git commit -m "feat(auth): add password reset functionality"
git commit -m "fix(dashboard): correct stats calculation"
git commit -m "docs(readme): update installation steps"
```

#### Branches

- `main` - Producción
- `develop` - Desarrollo
- `feature/nombre` - Nueva funcionalidad
- `fix/nombre` - Bug fix
- `refactor/nombre` - Refactorización

### Notas Importantes sobre Eventos

#### Creación de Eventos

Los eventos **solo se pueden crear desde la página del club** por los creadores:

1. Usuario creador va a su club (`/clubs/[id]`)
2. Click en tab "Eventos"
3. Click en botón "+ Crear Evento"
4. Se abre modal con `EventForm`
5. Las pistas del club se cargan automáticamente
6. Al guardar, el modal se cierra y la lista se actualiza

**No existe ruta `/events/new` standalone** - esta aproximación contextual mejora la UX.

#### Navegación de Eventos

- **Desde Dashboard**: Acceso directo a "Ver Eventos" y "Mis Eventos"
- **Listado público** (`/events`): Cualquiera puede ver eventos
- **Eventos cercanos** (`/events/nearby`): Filtrado automático por ciudad del usuario
- **Mis eventos** (`/my-events`): Solo eventos donde estoy inscrito

#### EventCard - Prop `showClubInfo`

```tsx
// En listado público - muestra info del club
<EventCard event={event} showClubInfo={true} />

// En página del club - no duplicar info
<EventCard event={event} showClubInfo={false} />
```

---

## 📞 Recursos y Links

### Documentación Oficial

- [Next.js Docs](https://nextjs.org/docs)
- [React Docs](https://react.dev)
- [Tailwind CSS v3](https://tailwindcss.com/docs)
- [NextAuth.js](https://next-auth.js.org)
- [Prisma](https://www.prisma.io/docs)
- [shadcn/ui](https://ui.shadcn.com)
- [React Hook Form](https://react-hook-form.com)
- [Zod](https://zod.dev)

### Herramientas

- [Tailwind CSS IntelliSense](https://marketplace.visualstudio.com/items?itemName=bradlc.vscode-tailwindcss) - VSCode extension
- [Prisma Studio](https://www.prisma.io/studio) - Database GUI
- [React DevTools](https://react.dev/learn/react-developer-tools)

### Comunidad

- [Next.js GitHub](https://github.com/vercel/next.js)
- [shadcn/ui GitHub](https://github.com/shadcn/ui)
- [Discord de Next.js](https://discord.gg/nextjs)

---

## ✅ Checklist de Features

### Autenticación

- [x] Registro de usuarios
- [x] Login con credenciales
- [x] Logout
- [x] Protección de rutas
- [ ] Recuperación de contraseña
- [ ] Login con Google
- [ ] Verificación de email

### Componentes UI

- [x] Button
- [x] Input
- [x] Label
- [x] Card
- [x] Alert
- [x] Toast
- [x] Dialog
- [x] Table
- [x] Dropdown Menu
- [x] Badge
- [x] Textarea
- [ ] Avatar
- [ ] Skeleton
- [ ] Tabs
- [ ] Select
- [ ] Checkbox
- [ ] Radio
- [ ] Switch
- [ ] Progress

### Perfil

- [x] Ver perfil
- [x] Editar perfil
- [x] Cambiar contraseña
- [x] Gestionar avatar (URL)
- [x] Conectar DUPR ID

### Clubes (Usuario)

- [x] Listar clubes
- [x] Buscar clubes
- [x] Ver detalle de club
- [x] Unirse a club (solicitar membresía)
- [x] Mis clubes
- [x] Salir de club
- [x] Cancelar solicitud de membresía
- [x] Ver estado de membresía

### Clubes (Creador)

- [x] Crear club
- [x] Editar club
- [x] Gestionar miembros
  - [x] Ver lista de miembros
  - [x] Agregar miembros
  - [x] Aprobar/Rechazar solicitudes
  - [x] Cambiar estado de membresía
  - [x] Eliminar miembros
- [x] Eliminar club
- [x] Gestionar pistas
  - [x] Crear pistas
  - [x] Editar pistas
  - [x] Activar/desactivar
  - [x] Eliminar pistas
  - [x] Configurar horarios de apertura/cierre
  - [x] Configurar duración de slots
  - [x] Ver horario de pista
  - [x] Gestionar reservas
- [ ] Dashboard del club

### Eventos (Usuario) ✅

- [x] Listar eventos
- [x] Buscar eventos (por título/descripción)
- [x] Filtrar por ciudad, tipo, estado
- [x] Ver eventos cercanos (por mi ciudad)
- [x] Inscribirse a evento
- [x] Cancelar inscripción
- [x] Ver mis eventos
- [x] Filtrar mis eventos (próximos/pasados/todos)
- [x] Ver detalle de evento
- [x] Check-in en evento (ventana de 30 min antes)
- [x] Ver barra de progreso de participantes
- [x] Ver estadísticas de evento

### Eventos (Creador) ✅

- [x] Crear evento (desde el club)
- [x] Asignar pista del club
- [x] Configurar visibilidad (OPEN, MEMBERS_ONLY, PRIVATE)
- [x] Establecer precio
- [x] Límite de participantes
- [x] Ver eventos del club en tab dedicado
- [x] Editar evento completo
- [x] Cambiar estado del evento
- [x] Gestionar participantes
  - [x] Ver lista completa paginada
  - [x] Ver estadísticas de asistencia
  - [x] Hacer check-in manual
  - [x] Deshacer check-in
  - [x] Filtrar por estado de check-in
  - [x] Buscar por nombre/email
- [x] Eliminar evento (con validaciones)
- [x] Ver contador de participantes en tiempo real

### Partidos ✅

- [x] Registrar partido informal
- [x] Registrar partido de club
- [x] Ver historial de partidos
- [x] Ver estadísticas (total, wins, win rate)
- [x] Estadísticas por tipo (Singles/Doubles)
- [x] Editar/eliminar partidos propios
- [x] Ver partidos del club
- [x] Filtros avanzados (tipo, estado, pista, evento)
- [x] Paginación en listados
- [x] Detalle completo de partido
- [x] Score con validación de formato
- [x] Cálculo de duración
- [x] DUPR rating de participantes
- [x] Tab de partidos en detalle de club
- [x] Listado público de partidos
- [x] MatchForm component (Singles/Doubles)
- [x] MatchCard component
- [x] Sistema de permisos (creador/admin)

### Pagos

- [ ] Configurar Stripe
- [ ] Pagar eventos
- [ ] Reservar pistas
- [ ] Suscripción de club
- [ ] Ver historial de pagos

### Admin

- [ ] Dashboard admin
- [ ] Gestionar usuarios
- [ ] Gestionar clubes
- [ ] Ver logs

---
