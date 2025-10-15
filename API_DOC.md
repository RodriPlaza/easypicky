# API Documentation - EasyPicky

## Base URL

```
http://localhost:3000/api
```

## Autenticación

La API utiliza JWT (JSON Web Tokens) para la autenticación. Después del login, incluye el token en el header `Authorization` de todas las peticiones protegidas.

```
Authorization: Bearer <jwt_token>
```

---

## 🔐 Autenticación

### Registro de Usuario

**POST** `/auth/register`

Crea una nueva cuenta de usuario.

**Request Body:**

```json
{
  "name": "string (min: 2 chars)", // Requerido
  "email": "string (valid email)", // Requerido
  "password": "string (min: 6 chars)", // Requerido
  "phone": "string", // Opcional
  "city": "string" // Opcional
}
```

**Response 201 - Success:**

```json
{
  "message": "User created successfully",
  "user": {
    "id": "clp1234567890",
    "name": "Test User",
    "email": "test@example.com",
    "phone": "+34666777888",
    "city": "Madrid",
    "role": "USER",
    "createdAt": "2024-01-15T10:30:00.000Z"
  }
}
```

**Response 400 - Error:**

```json
{
  "error": "User already exists with this email"
}
```

**Response 400 - Validation Error:**

```json
{
  "error": "Validation error",
  "details": [
    {
      "code": "too_small",
      "minimum": 6,
      "type": "string",
      "inclusive": true,
      "exact": false,
      "message": "Password must be at least 6 characters",
      "path": ["password"]
    }
  ]
}
```

---

### Login

**POST** `/auth/login`

Autentica un usuario y devuelve un JWT token.

**Request Body:**

```json
{
  "email": "string (valid email)", // Requerido
  "password": "string" // Requerido
}
```

**Response 200 - Success:**

```json
{
  "message": "Login successful",
  "user": {
    "id": "clp1234567890",
    "email": "test@example.com",
    "name": "Test User",
    "role": "USER",
    "phone": "+34666777888",
    "city": "Madrid",
    "avatar": null,
    "duprRating": null
  },
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
}
```

**Response 401 - Error:**

```json
{
  "error": "Invalid credentials"
}
```

**Response 400 - Validation Error:**

```json
{
  "error": "Validation error",
  "details": [
    {
      "code": "invalid_string",
      "validation": "email",
      "message": "Invalid email address",
      "path": ["email"]
    }
  ]
}
```

---

### Obtener Perfil Usuario

**GET** `/auth/profile`

Obtiene la información del usuario autenticado.

**Headers:**

```
Authorization: Bearer <jwt_token>
```

**Response 200 - Success:**

```json
{
  "user": {
    "id": "clp1234567890",
    "email": "test@example.com",
    "name": "Test User",
    "phone": "+34666777888",
    "city": "Madrid",
    "avatar": null,
    "duprId": null,
    "duprRating": null,
    "role": "USER",
    "createdAt": "2024-01-15T10:30:00.000Z",
    "updatedAt": "2024-01-15T10:30:00.000Z",
    "_count": {
      "clubMemberships": 2,
      "eventParticipations": 5,
      "matchParticipations": 8
    }
  }
}
```

**Response 401 - Unauthorized:**

```json
{
  "error": "Unauthorized"
}
```

**Response 404 - User Not Found:**

```json
{
  "error": "User not found"
}
```

---

## 👤 Gestión de Usuarios

### Actualizar Perfil

**PUT** `/users/profile`

Permite al usuario autenticado actualizar su propio perfil.

**Headers:**

```
Authorization: Bearer <jwt_token>
```

**Request Body:**

```json
{
  "name": "string (min: 2 chars)", // Opcional
  "phone": "string", // Opcional
  "city": "string", // Opcional
  "avatar": "string (valid URL)", // Opcional
  "duprId": "string", // Opcional
  "currentPassword": "string", // Requerido solo si se cambia contraseña
  "newPassword": "string (min: 6 chars)" // Opcional
}
```

**Notas importantes:**

- Para cambiar la contraseña, se debe proporcionar `currentPassword` y `newPassword`
- No se puede cambiar la contraseña de cuentas creadas con Google
- El `duprId` debe ser único en el sistema

**Response 200 - Success:**

```json
{
  "message": "Profile updated successfully",
  "user": {
    "id": "clp1234567890",
    "email": "user@example.com",
    "name": "Updated Name",
    "phone": "+34666777888",
    "city": "Madrid",
    "avatar": "https://example.com/avatar.jpg",
    "duprId": "DUPR123",
    "duprRating": 3.5,
    "role": "USER",
    "createdAt": "2024-01-15T10:30:00.000Z",
    "updatedAt": "2024-01-16T14:20:00.000Z"
  }
}
```

**Response 400 - Bad Request:**

```json
{
  "error": "Current password is required to set a new password"
}
// o
{
  "error": "Cannot change password for accounts created with social login"
}
```

**Response 401 - Unauthorized:**

```json
{
  "error": "Current password is incorrect"
}
```

**Response 409 - Conflict:**

```json
{
  "error": "This DUPR ID is already in use by another user"
}
```

---

### Listar Usuarios

**GET** `/users`

Obtiene una lista paginada de usuarios. Solo accesible para SUPER_ADMIN.

**Headers:**

```
Authorization: Bearer <jwt_token>
```

**Query Parameters:**

- `page`: number (default: 1) - Página a mostrar
- `limit`: number (default: 20, max: 100) - Usuarios por página
- `search`: string - Buscar por nombre o email
- `city`: string - Filtrar por ciudad
- `role`: "USER" | "SUPER_ADMIN" - Filtrar por rol

**Response 200 - Success:**

```json
{
  "users": [
    {
      "id": "clp1234567890",
      "email": "user@example.com",
      "name": "John Doe",
      "phone": "+34666777888",
      "city": "Madrid",
      "avatar": "https://example.com/avatar.jpg",
      "duprId": "DUPR123",
      "duprRating": 3.5,
      "role": "USER",
      "createdAt": "2024-01-15T10:30:00.000Z",
      "updatedAt": "2024-01-16T14:20:00.000Z",
      "_count": {
        "clubMemberships": 2,
        "eventParticipations": 8,
        "matchParticipations": 15,
        "createdClubs": 0
      }
    }
  ],
  "pagination": {
    "page": 1,
    "limit": 20,
    "totalCount": 150,
    "totalPages": 8,
    "hasNextPage": true,
    "hasPreviousPage": false
  }
}
```

**Response 403 - Forbidden:**

```json
{
  "error": "Forbidden - Insufficient permissions"
}
```

---

### Obtener Usuario Específico

**GET** `/users/:id`

Obtiene los detalles de un usuario específico. Solo accesible para SUPER_ADMIN.

**Headers:**

```
Authorization: Bearer <jwt_token>
```

**Response 200 - Success:**

```json
{
  "user": {
    "id": "clp1234567890",
    "email": "user@example.com",
    "name": "John Doe",
    "phone": "+34666777888",
    "city": "Madrid",
    "avatar": "https://example.com/avatar.jpg",
    "duprId": "DUPR123",
    "duprRating": 3.5,
    "role": "USER",
    "createdAt": "2024-01-15T10:30:00.000Z",
    "updatedAt": "2024-01-16T14:20:00.000Z",
    "_count": {
      "clubMemberships": 2,
      "eventParticipations": 8,
      "matchParticipations": 15,
      "createdClubs": 0,
      "payments": 5
    }
  }
}
```

**Response 404 - Not Found:**

```json
{
  "error": "User not found"
}
```

**Response 403 - Forbidden:**

```json
{
  "error": "Forbidden - Insufficient permissions"
}
```

---

### Eliminar Usuario

**DELETE** `/users/:id`

Elimina un usuario del sistema. Solo accesible para SUPER_ADMIN.

**Headers:**

```
Authorization: Bearer <jwt_token>
```

**Restricciones:**

- No se puede eliminar tu propia cuenta de SUPER_ADMIN
- No se puede eliminar usuarios que sean creadores de clubes
- Se eliminan en cascada: membresías, participaciones en eventos, participaciones en partidos, pagos

**Response 200 - Success:**

```json
{
  "message": "User deleted successfully",
  "deletedUser": {
    "id": "clp1234567890",
    "email": "user@example.com",
    "name": "John Doe"
  }
}
```

**Response 400 - Bad Request:**

```json
{
  "error": "Cannot delete your own account"
}
```

**Response 404 - Not Found:**

```json
{
  "error": "User not found"
}
```

**Response 409 - Conflict:**

```json
{
  "error": "Cannot delete user who is a club creator",
  "details": {
    "clubsCreated": 2,
    "suggestion": "Please transfer club ownership or delete the clubs first"
  }
}
```

**Response 403 - Forbidden:**

```json
{
  "error": "Forbidden - Insufficient permissions"
}
```

---

## 🏢 Gestión de Clubes

### Crear Club

**POST** `/clubs`

Crea un nuevo club. El usuario autenticado se convierte automáticamente en el creador y primer miembro del club.

**Headers:**

```
Authorization: Bearer <jwt_token>
```

**Request Body:**

```json
{
  "name": "string (min: 1, max: 100 chars)", // Requerido
  "description": "string", // Opcional
  "address": "string (min: 1 char)", // Requerido
  "city": "string (min: 1 char)", // Requerido
  "phone": "string", // Opcional
  "email": "string (valid email)", // Opcional
  "website": "string (valid URL)", // Opcional
  "logo": "string (valid URL)" // Opcional
}
```

**Response 201 - Success:**

```json
{
  "message": "Club created successfully",
  "club": {
    "id": "clp1234567890",
    "name": "Club Pickleball Madrid",
    "description": "El mejor club de pickleball de Madrid",
    "address": "Calle Gran Vía 1, Madrid",
    "city": "Madrid",
    "phone": "+34666123456",
    "email": "info@clubmadrid.com",
    "website": "https://clubmadrid.com",
    "logo": null,
    "createdAt": "2024-01-15T10:30:00.000Z",
    "updatedAt": "2024-01-15T10:30:00.000Z",
    "creator": {
      "id": "usr1234567890",
      "name": "Club Creator",
      "email": "creator@example.com"
    },
    "_count": {
      "memberships": 1,
      "events": 0,
      "courts": 0
    }
  }
}
```

**Response 409 - Conflict:**

```json
{
  "error": "A club with this name already exists in this city"
}
```

---

### Listar Clubes

**GET** `/clubs`

Obtiene una lista paginada de clubes con filtros opcionales.

**Query Parameters:**

- `page`: number (default: 1) - Página a mostrar
- `limit`: number (default: 10) - Número de clubes por página
- `city`: string - Filtrar por ciudad (búsqueda parcial)
- `search`: string - Buscar en nombre y descripción

**Response 200 - Success:**

```json
{
  "clubs": [
    {
      "id": "clp1234567890",
      "name": "Club Pickleball Madrid",
      "description": "El mejor club de pickleball de Madrid",
      "address": "Calle Gran Vía 1, Madrid",
      "city": "Madrid",
      "phone": "+34666123456",
      "email": "info@clubmadrid.com",
      "website": "https://clubmadrid.com",
      "logo": null,
      "createdAt": "2024-01-15T10:30:00.000Z",
      "updatedAt": "2024-01-15T10:30:00.000Z",
      "creator": {
        "id": "usr1234567890",
        "name": "Club Creator"
      },
      "_count": {
        "memberships": 25,
        "events": 12,
        "courts": 4
      }
    }
  ],
  "pagination": {
    "page": 1,
    "limit": 10,
    "totalCount": 25,
    "totalPages": 3,
    "hasNextPage": true,
    "hasPreviousPage": false
  }
}
```

---

### Obtener Club Específico

**GET** `/clubs/:id`

Obtiene los detalles completos de un club específico.

**Response 200 - Success:**

```json
{
  "club": {
    "id": "clp1234567890",
    "name": "Club Pickleball Madrid",
    "description": "El mejor club de pickleball de Madrid",
    "address": "Calle Gran Vía 1, Madrid",
    "city": "Madrid",
    "phone": "+34666123456",
    "email": "info@clubmadrid.com",
    "website": "https://clubmadrid.com",
    "logo": null,
    "stripeAccountId": null,
    "createdAt": "2024-01-15T10:30:00.000Z",
    "updatedAt": "2024-01-15T10:30:00.000Z",
    "creator": {
      "id": "usr1234567890",
      "name": "Club Creator",
      "email": "creator@example.com"
    },
    "courts": [
      {
        "id": "crt1234567890",
        "name": "Pista 1",
        "description": "Pista principal"
      }
    ],
    "subscription": {
      "id": "sub1234567890",
      "status": "ACTIVE",
      "currentPeriodStart": "2024-01-01T00:00:00.000Z",
      "currentPeriodEnd": "2024-02-01T00:00:00.000Z"
    },
    "_count": {
      "memberships": 25,
      "events": 12
    }
  }
}
```

**Response 404 - Not Found:**

```json
{
  "error": "Club not found"
}
```

---

### Actualizar Club

**PUT** `/clubs/:id`

Actualiza la información de un club. Solo el creador del club o SUPER_ADMIN pueden realizar esta acción.

**Headers:**

```
Authorization: Bearer <jwt_token>
```

**Request Body:**

```json
{
  "name": "string (min: 1, max: 100 chars)", // Opcional
  "description": "string", // Opcional
  "address": "string (min: 1 char)", // Opcional
  "city": "string (min: 1 char)", // Opcional
  "phone": "string", // Opcional
  "email": "string (valid email)", // Opcional
  "website": "string (valid URL)", // Opcional
  "logo": "string (valid URL)" // Opcional
}
```

**Response 200 - Success:**

```json
{
  "message": "Club updated successfully",
  "club": {
    "id": "clp1234567890",
    "name": "Club Pickleball Madrid - Actualizado",
    "description": "Descripción actualizada"
    // ... resto de campos
  }
}
```

**Response 403 - Forbidden:**

```json
{
  "error": "Forbidden - You don't have permission to manage this club"
}
```

**Response 409 - Conflict:**

```json
{
  "error": "A club with this name already exists in this city"
}
```

---

### Eliminar Club

**DELETE** `/clubs/:id`

Elimina un club y todos sus datos asociados (miembros, eventos, pistas, etc.). Solo el creador del club o SUPER_ADMIN pueden realizar esta acción.

**Headers:**

```
Authorization: Bearer <jwt_token>
```

**Response 200 - Success:**

```json
{
  "message": "Club deleted successfully"
}
```

**Response 403 - Forbidden:**

```json
{
  "error": "Forbidden - Only the club creator or super admin can delete this club"
}
```

---

## 👥 Gestión de Membresías

### Listar Miembros del Club

**GET** `/clubs/:id/members`

Obtiene una lista paginada de los miembros de un club. Solo el creador del club o SUPER_ADMIN pueden acceder.

**Headers:**

```
Authorization: Bearer <jwt_token>
```

**Query Parameters:**

- `status`: "ACTIVE" | "INACTIVE" | "PENDING" | "CANCELLED" - Filtrar por estado
- `page`: number (default: 1) - Página a mostrar
- `limit`: number (default: 20) - Número de miembros por página

**Response 200 - Success:**

```json
{
  "club": {
    "id": "clp1234567890",
    "name": "Club Pickleball Madrid"
  },
  "members": [
    {
      "id": "mem1234567890",
      "status": "ACTIVE",
      "joinedAt": "2024-01-15T10:30:00.000Z",
      "expiresAt": "2024-12-31T23:59:59.000Z",
      "user": {
        "id": "usr1234567890",
        "name": "Member Name",
        "email": "member@example.com",
        "phone": "+34666777888",
        "city": "Madrid",
        "avatar": null,
        "duprRating": 3.5
      }
    }
  ],
  "pagination": {
    "page": 1,
    "limit": 20,
    "totalCount": 25,
    "totalPages": 2,
    "hasNextPage": true,
    "hasPreviousPage": false
  }
}
```

**Response 403 - Forbidden:**

```json
{
  "error": "Forbidden - You don't have permission to view club members"
}
```

---

### Agregar Miembro al Club

**POST** `/clubs/:id/members`

Agrega un nuevo miembro al club. Solo el creador del club o SUPER_ADMIN pueden realizar esta acción.

**Headers:**

```
Authorization: Bearer <jwt_token>
Content-Type: application/json
```

**Request Body:**

```json
{
  "userId": "string (cuid)", // Requerido
  "status": "ACTIVE" | "PENDING", // Opcional (default: PENDING)
  "expiresAt": "string (ISO date)" // Opcional
}
```

**Response 201 - Success:**

```json
{
  "message": "Member added successfully",
  "membership": {
    "id": "mem1234567890",
    "status": "ACTIVE",
    "joinedAt": "2024-01-15T10:30:00.000Z",
    "expiresAt": "2024-12-31T23:59:59.000Z",
    "user": {
      "id": "usr1234567890",
      "name": "New Member",
      "email": "newmember@example.com",
      "phone": "+34666777888",
      "city": "Madrid",
      "avatar": null,
      "duprRating": null
    }
  }
}
```

**Response 404 - User Not Found:**

```json
{
  "error": "User not found"
}
```

**Response 409 - Conflict:**

```json
{
  "error": "User is already a member of this club"
}
```

---

### Actualizar Membresía

**PUT** `/clubs/:id/members?userId=:userId`

Actualiza el estado de una membresía existente. Solo el creador del club o SUPER_ADMIN pueden realizar esta acción.

**Headers:**

```
Authorization: Bearer <jwt_token>
Content-Type: application/json
```

**Request Body:**

```json
{
  "status": "ACTIVE" | "INACTIVE" | "PENDING" | "CANCELLED", // Requerido
  "expiresAt": "string (ISO date)" // Opcional
}
```

**Response 200 - Success:**

```json
{
  "message": "Membership updated successfully",
  "membership": {
    "id": "mem1234567890",
    "status": "INACTIVE",
    "joinedAt": "2024-01-15T10:30:00.000Z",
    "expiresAt": "2024-06-30T23:59:59.000Z",
    "user": {
      "id": "usr1234567890",
      "name": "Member Name",
      "email": "member@example.com"
      // ... resto de campos de usuario
    }
  }
}
```

**Response 404 - Not Found:**

```json
{
  "error": "Membership not found"
}
```

---

### Eliminar Miembro del Club

**DELETE** `/clubs/:id/members?userId=:userId`

Elimina un miembro del club. No se puede eliminar al creador del club. Solo el creador del club o SUPER_ADMIN pueden realizar esta acción.

**Headers:**

```
Authorization: Bearer <jwt_token>
```

**Response 200 - Success:**

```json
{
  "message": "Member removed successfully"
}
```

**Response 409 - Conflict:**

```json
{
  "error": "Cannot remove the club creator from membership"
}
```

**Response 404 - Not Found:**

```json
{
  "error": "Membership not found"
}
```

---

## 🎯 Gestión de Eventos

### Crear Evento

**POST** `/events`

Crea un nuevo evento. Solo el creador del club o SUPER_ADMIN pueden crear eventos.

**Headers:**

```
Authorization: Bearer <jwt_token>
```

**Request Body:**

```json
{
  "title": "string (min: 1, max: 100 chars)", // Requerido
  "description": "string", // Opcional
  "type": "CLASS" | "TOURNAMENT" | "MEETUP", // Requerido
  "visibility": "OPEN" | "MEMBERS_ONLY" | "PRIVATE", // Opcional (default: MEMBERS_ONLY)
  "startDateTime": "string (ISO date, future)", // Requerido
  "endDateTime": "string (ISO date, after start)", // Requerido
  "maxParticipants": "number (positive int)", // Opcional
  "price": "number (>= 0)", // Opcional, en euros/cents
  "clubId": "string (cuid)", // Requerido
  "courtId": "string (cuid)" // Opcional
}
```

**Response 201 - Success:**

```json
{
  "message": "Event created successfully",
  "event": {
    "id": "evt1234567890",
    "title": "Clase Abierta de Pickleball",
    "description": "Clase para todos los niveles",
    "type": "CLASS",
    "visibility": "OPEN",
    "status": "SCHEDULED",
    "startDateTime": "2024-12-25T10:00:00.000Z",
    "endDateTime": "2024-12-25T11:30:00.000Z",
    "maxParticipants": 8,
    "price": 0,
    "createdAt": "2024-01-15T10:30:00.000Z",
    "updatedAt": "2024-01-15T10:30:00.000Z",
    "club": {
      "id": "clp1234567890",
      "name": "Club Pickleball Madrid",
      "city": "Madrid"
    },
    "court": {
      "id": "crt1234567890",
      "name": "Pista 1"
    },
    "_count": {
      "participants": 0
    }
  }
}
```

**Response 403 - Forbidden:**

```json
{
  "error": "Forbidden - Only club creator or super admin can create events"
}
```

**Response 404 - Not Found:**

```json
{
  "error": "Club not found"
}
// o
{
  "error": "Court not found or not active in this club"
}
```

---

### Listar Eventos

**GET** `/events`

Obtiene una lista paginada de eventos con filtros opcionales. Acceso público (solo muestra eventos OPEN y MEMBERS_ONLY).

**Query Parameters:**

- `page`: number (default: 1)
- `limit`: number (default: 10)
- `clubId`: string (cuid) - Filtrar por club
- `type`: "CLASS" | "TOURNAMENT" | "MEETUP" - Filtrar por tipo
- `status`: "SCHEDULED" | "ONGOING" | "COMPLETED" | "CANCELLED" - Filtrar por estado
- `city`: string - Filtrar por ciudad del club
- `startDate`: string (ISO date) - Eventos desde esta fecha
- `endDate`: string (ISO date) - Eventos hasta esta fecha
- `upcoming`: boolean - Solo eventos futuros

**Response 200 - Success:**

```json
{
  "events": [
    {
      "id": "evt1234567890",
      "title": "Clase Abierta de Pickleball",
      "description": "Clase para todos los niveles",
      "type": "CLASS",
      "visibility": "OPEN",
      "status": "SCHEDULED",
      "startDateTime": "2024-12-25T10:00:00.000Z",
      "endDateTime": "2024-12-25T11:30:00.000Z",
      "maxParticipants": 8,
      "price": 0,
      "createdAt": "2024-01-15T10:30:00.000Z",
      "updatedAt": "2024-01-15T10:30:00.000Z",
      "club": {
        "id": "clp1234567890",
        "name": "Club Pickleball Madrid",
        "city": "Madrid",
        "logo": null
      },
      "court": {
        "id": "crt1234567890",
        "name": "Pista 1"
      },
      "_count": {
        "participants": 5
      }
    }
  ],
  "pagination": {
    "page": 1,
    "limit": 10,
    "totalCount": 25,
    "totalPages": 3,
    "hasNextPage": true,
    "hasPreviousPage": false
  }
}
```

---

### Obtener Evento Específico

**GET** `/events/:id`

Obtiene los detalles completos de un evento específico, incluyendo participantes.

**Response 200 - Success:**

```json
{
  "event": {
    "id": "evt1234567890",
    "title": "Clase Abierta de Pickleball",
    "description": "Clase para todos los niveles",
    "type": "CLASS",
    "visibility": "OPEN",
    "status": "SCHEDULED",
    "startDateTime": "2024-12-25T10:00:00.000Z",
    "endDateTime": "2024-12-25T11:30:00.000Z",
    "maxParticipants": 8,
    "price": 0,
    "createdAt": "2024-01-15T10:30:00.000Z",
    "updatedAt": "2024-01-15T10:30:00.000Z",
    "club": {
      "id": "clp1234567890",
      "name": "Club Pickleball Madrid",
      "city": "Madrid",
      "address": "Calle Gran Vía 1, Madrid",
      "phone": "+34666123456",
      "email": "info@clubmadrid.com",
      "website": "https://clubmadrid.com",
      "logo": null
    },
    "court": {
      "id": "crt1234567890",
      "name": "Pista 1",
      "description": "Pista principal"
    },
    "participants": [
      {
        "id": "prt1234567890",
        "registeredAt": "2024-01-15T10:30:00.000Z",
        "checkedIn": false,
        "checkedInAt": null,
        "user": {
          "id": "usr1234567890",
          "name": "John Doe",
          "email": "john@example.com",
          "avatar": null,
          "duprRating": 3.5
        }
      }
    ],
    "_count": {
      "participants": 5,
      "matches": 0
    }
  }
}
```

**Response 404 - Not Found:**

```json
{
  "error": "Event not found"
}
```

**Response 401/403 - Private Event:**

```json
{
  "error": "Unauthorized - Private event"
}
// o
{
  "error": "Forbidden - You don't have access to this private event"
}
```

---

### Actualizar Evento

**PUT** `/events/:id`

Actualiza un evento. Solo el creador del club o SUPER_ADMIN pueden actualizar eventos.

**Headers:**

```
Authorization: Bearer <jwt_token>
```

**Request Body:**

```json
{
  "title": "string", // Opcional
  "description": "string", // Opcional
  "type": "CLASS" | "TOURNAMENT" | "MEETUP", // Opcional
  "visibility": "OPEN" | "MEMBERS_ONLY" | "PRIVATE", // Opcional
  "status": "SCHEDULED" | "ONGOING" | "COMPLETED" | "CANCELLED", // Opcional
  "startDateTime": "string (ISO date)", // Opcional
  "endDateTime": "string (ISO date)", // Opcional
  "maxParticipants": "number", // Opcional
  "price": "number", // Opcional
  "courtId": "string (cuid)" // Opcional
}
```

**Response 200 - Success:**

```json
{
  "message": "Event updated successfully",
  "event": {
    "id": "evt1234567890",
    "title": "Clase Abierta - ACTUALIZADA"
    // ... resto de campos actualizados
  }
}
```

**Response 403 - Forbidden:**

```json
{
  "error": "Forbidden - Only the club creator can update events"
}
```

**Response 400 - Bad Request:**

```json
{
  "error": "Cannot set start date in the past for scheduled events"
}
```

---

### Eliminar Evento

**DELETE** `/events/:id`

Elimina un evento y todos sus participantes. Solo el creador del club o SUPER_ADMIN pueden eliminar eventos. No se pueden eliminar eventos ONGOING o COMPLETED.

**Headers:**

```
Authorization: Bearer <jwt_token>
```

**Response 200 - Success:**

```json
{
  "message": "Event deleted successfully. 5 participant registrations were also removed."
}
```

**Response 403 - Forbidden:**

```json
{
  "error": "Forbidden - Only the club creator or super admin can delete events"
}
```

**Response 409 - Conflict:**

```json
{
  "error": "Cannot delete events that have already started or completed"
}
```

---

### Unirse a Evento

**POST** `/events/:id/join`

Permite a un usuario registrarse en un evento.

**Headers:**

```
Authorization: Bearer <jwt_token>
```

**Reglas de Acceso:**

- **OPEN**: Cualquier usuario autenticado
- **MEMBERS_ONLY**: Solo miembros activos del club
- **PRIVATE**: Solo miembros activos del club

**Response 201 - Success:**

```json
{
  "message": "Successfully joined the event",
  "participation": {
    "id": "prt1234567890",
    "registeredAt": "2024-01-15T10:30:00.000Z",
    "checkedIn": false,
    "checkedInAt": null,
    "user": {
      "id": "usr1234567890",
      "name": "John Doe",
      "email": "john@example.com",
      "avatar": null,
      "duprRating": 3.5
    },
    "event": {
      "id": "evt1234567890",
      "title": "Clase Abierta de Pickleball",
      "startDateTime": "2024-12-25T10:00:00.000Z",
      "endDateTime": "2024-12-25T11:30:00.000Z",
      "type": "CLASS"
    }
  }
}
```

**Response 403 - Forbidden:**

```json
{
  "error": "Forbidden - You must be a member of this club to join this event"
}
```

**Response 409 - Conflict:**

```json
{
  "error": "You are already registered for this event"
}
// o
{
  "error": "Event is full - maximum participants reached"
}
// o
{
  "error": "Cannot join completed or cancelled events"
}
```

**Response 501 - Not Implemented:**

```json
{
  "error": "Paid events are not yet supported"
}
```

---

### Salir de Evento

**DELETE** `/events/:id/join`

Permite a un usuario cancelar su participación en un evento. No se puede salir menos de 2 horas antes del inicio.

**Headers:**

```
Authorization: Bearer <jwt_token>
```

**Response 200 - Success:**

```json
{
  "message": "Successfully left the event"
}
```

**Response 404 - Not Found:**

```json
{
  "error": "You are not registered for this event"
}
```

**Response 409 - Conflict:**

```json
{
  "error": "Cannot leave event less than 2 hours before start time"
}
// o
{
  "error": "Cannot leave events that have already started"
}
```

---

### Buscar Eventos Cercanos

**GET** `/events/nearby`

Busca eventos en una ciudad específica en un rango de fechas. Acceso público.

**Query Parameters:**

- `city`: string (requerido) - Ciudad donde buscar
- `page`: number (default: 1)
- `limit`: number (default: 10, max: 50)
- `type`: "CLASS" | "TOURNAMENT" | "MEETUP" - Filtrar por tipo
- `daysAhead`: number (default: 7, min: 1, max: 30) - Días hacia adelante
- `openOnly`: boolean - Solo eventos abiertos al público

**Response 200 - Success:**

```json
{
  "events": [
    {
      "id": "evt1234567890",
      "title": "Clase Abierta de Pickleball",
      "type": "CLASS",
      "visibility": "OPEN",
      "status": "SCHEDULED",
      "startDateTime": "2024-12-25T10:00:00.000Z",
      "endDateTime": "2024-12-25T11:30:00.000Z",
      "maxParticipants": 8,
      "price": 0,
      "club": {
        "id": "clp1234567890",
        "name": "Club Pickleball Madrid",
        "city": "Madrid",
        "address": "Calle Gran Vía 1, Madrid",
        "logo": null
      },
      "court": {
        "id": "crt1234567890",
        "name": "Pista 1"
      },
      "_count": {
        "participants": 5
      },
      "distanceInfo": {
        "city": "Madrid",
        "isLocal": true
      }
    }
  ],
  "searchParams": {
    "city": "Madrid",
    "daysAhead": 7,
    "type": null,
    "openOnly": false
  },
  "pagination": {
    "page": 1,
    "limit": 10,
    "totalCount": 15,
    "totalPages": 2,
    "hasNextPage": true,
    "hasPreviousPage": false
  }
}
```

---

### Listar Participantes del Evento

**GET** `/events/:id/participants`

Obtiene la lista de participantes de un evento. Solo accesible por el creador del club, miembros activos o SUPER_ADMIN.

**Headers:**

```
Authorization: Bearer <jwt_token>
```

**Query Parameters:**

- `page`: number (default: 1)
- `limit`: number (default: 20)
- `checkedIn`: boolean - Filtrar por estado de check-in

**Response 200 - Success:**

```json
{
  "event": {
    "id": "evt1234567890",
    "title": "Clase Abierta de Pickleball",
    "startDateTime": "2024-12-25T10:00:00.000Z",
    "endDateTime": "2024-12-25T11:30:00.000Z",
    "maxParticipants": 8,
    "status": "SCHEDULED"
  },
  "participants": [
    {
      "id": "prt1234567890",
      "registeredAt": "2024-01-15T10:30:00.000Z",
      "checkedIn": true,
      "checkedInAt": "2024-12-25T09:45:00.000Z",
      "user": {
        "id": "usr1234567890",
        "name": "John Doe",
        "email": "john@example.com",
        "phone": "+34666777888",
        "avatar": null,
        "city": "Madrid",
        "duprRating": 3.5
      }
    }
  ],
  "stats": {
    "total": 8,
    "checkedIn": 5,
    "notCheckedIn": 3
  },
  "pagination": {
    "page": 1,
    "limit": 20,
    "totalCount": 8,
    "totalPages": 1,
    "hasNextPage": false,
    "hasPreviousPage": false
  }
}
```

**Response 403 - Forbidden:**

```json
{
  "error": "Forbidden - You don't have permission to view event participants"
}
```

---

### Check-in en Evento

**POST** `/events/:id/checkin`

Registra la asistencia de un participante al evento. Se puede hacer check-in propio o de otros usuarios (si eres creador del club).

**Headers:**

```
Authorization: Bearer <jwt_token>
```

**Request Body (Opcional):**

```json
{
  "userId": "string (cuid)" // Solo si eres creador del club haciendo check-in de otro usuario
}
```

**Reglas:**

- Check-in disponible desde 30 minutos antes del evento
- Solo para usuarios registrados en el evento
- No disponible para eventos COMPLETED o CANCELLED
- El primer check-in cambia el estado del evento a ONGOING

**Response 200 - Success:**

```json
{
  "message": "Successfully checked in to the event",
  "participation": {
    "id": "prt1234567890",
    "registeredAt": "2024-01-15T10:30:00.000Z",
    "checkedIn": true,
    "checkedInAt": "2024-12-25T09:45:00.000Z",
    "user": {
      "id": "usr1234567890",
      "name": "John Doe",
      "email": "john@example.com",
      "avatar": null
    },
    "event": {
      "id": "evt1234567890",
      "title": "Clase Abierta de Pickleball",
      "startDateTime": "2024-12-25T10:00:00.000Z"
    }
  }
}
```

**Response 409 - Conflict:**

```json
{
  "error": "Check-in not available yet - opens 30 minutes before event start"
}
// o
{
  "error": "User has already checked in to this event"
}
// o
{
  "error": "Cannot check-in to completed or cancelled events"
}
```

**Response 404 - Not Found:**

```json
{
  "error": "User is not registered for this event"
}
```

**Response 403 - Forbidden:**

```json
{
  "error": "Forbidden - You don't have permission to check-in other users"
}
```

---

### Deshacer Check-in

**DELETE** `/events/:id/checkin`

Deshace el check-in de un participante. El usuario puede deshacer su propio check-in, o el creador del club puede deshacer el de cualquier usuario.

**Headers:**

```
Authorization: Bearer <jwt_token>
```

**Query Parameters (Opcional):**

- `userId`: string (cuid) - ID del usuario para deshacer check-in (solo creador del club)

**Response 200 - Success:**

```json
{
  "message": "Successfully undid check-in"
}
```

**Response 404 - Not Found:**

```json
{
  "error": "Participation not found"
}
```

**Response 409 - Conflict:**

```json
{
  "error": "User has not checked in to this event"
}
// o
{
  "error": "Cannot undo check-in for completed events"
}
```

**Response 403 - Forbidden:**

```json
{
  "error": "Forbidden - You don't have permission to undo check-in for other users"
}
```

---

## 📊 Códigos de Estado HTTP

| Código | Significado                                                           |
| ------ | --------------------------------------------------------------------- |
| `200`  | OK - Petición exitosa                                                 |
| `201`  | Created - Recurso creado exitosamente                                 |
| `400`  | Bad Request - Error en la petición (validación, datos faltantes)      |
| `401`  | Unauthorized - Token inválido o faltante                              |
| `403`  | Forbidden - Sin permisos suficientes                                  |
| `404`  | Not Found - Recurso no encontrado                                     |
| `409`  | Conflict - Conflicto con el estado actual (duplicados, restricciones) |
| `500`  | Internal Server Error - Error del servidor                            |
| `501`  | Not Implemented - Funcionalidad no implementada aún                   |

---

## 🔑 Roles de Usuario

| Rol           | Descripción                                        |
| ------------- | -------------------------------------------------- |
| `USER`        | Usuario estándar - puede unirse a eventos y clubes |
| `SUPER_ADMIN` | Administrador de plataforma - acceso completo      |

---

## 📝 Modelos de Datos

### User

```typescript
{
  id: string,
  email: string,
  name: string,
  phone?: string,
  avatar?: string,
  city?: string,
  duprId?: string,
  duprRating?: number,
  role: "USER" | "SUPER_ADMIN",
  createdAt: string (ISO date),
  updatedAt: string (ISO date)
}
```

### Club

```typescript
{
  id: string,
  name: string,
  description?: string,
  address: string,
  city: string,
  phone?: string,
  email?: string,
  website?: string,
  logo?: string,
  stripeAccountId?: string,
  createdAt: string (ISO date),
  updatedAt: string (ISO date),
  creatorId: string
}
```

### ClubMembership

```typescript
{
  id: string,
  status: "ACTIVE" | "INACTIVE" | "PENDING" | "CANCELLED",
  joinedAt: string (ISO date),
  expiresAt?: string (ISO date),
  userId: string,
  clubId: string
}
```

### Event

```typescript
{
  id: string,
  title: string,
  description?: string,
  type: "CLASS" | "TOURNAMENT" | "MEETUP",
  visibility: "OPEN" | "MEMBERS_ONLY" | "PRIVATE",
  status: "SCHEDULED" | "ONGOING" | "COMPLETED" | "CANCELLED",
  startDateTime: string (ISO date),
  endDateTime: string (ISO date),
  maxParticipants?: number,
  price?: number, // En cents
  clubId: string,
  courtId?: string,
  createdAt: string (ISO date),
  updatedAt: string (ISO date)
}
```

### EventParticipant

```typescript
{
  id: string,
  registeredAt: string (ISO date),
  checkedIn: boolean,
  checkedInAt?: string (ISO date),
  userId: string,
  eventId: string
}
```

### Court

```typescript
{
  id: string,
  name: string,
  description?: string,
  isActive: boolean,
  clubId: string
}
```

### Match

```typescript
{
  id: string,
  startTime?: string (ISO date),
  endTime?: string (ISO date),
  score?: string, // Formato: "21-19,21-17"
  completed: boolean,
  eventId?: string,
  courtId: string,
  createdAt: string (ISO date),
  updatedAt: string (ISO date)
}
```

---

## 🚀 Endpoints Implementados

### ✅ Autenticación

- `POST /auth/register` - Registrar usuario
- `POST /auth/login` - Login de usuario
- `GET /auth/profile` - Obtener perfil

### ✅ Gestión de Usuarios

- `PUT /users/profile` - Actualizar perfil propio
- `GET /users` - Listar usuarios (admin)
- `GET /users/:id` - Obtener usuario específico (admin)
- `DELETE /users/:id` - Eliminar usuario (admin)

### ✅ Clubes

- `POST /clubs` - Crear club
- `GET /clubs` - Listar clubes
- `GET /clubs/:id` - Obtener club específico
- `PUT /clubs/:id` - Actualizar club
- `DELETE /clubs/:id` - Eliminar club

### ✅ Membresías

- `GET /clubs/:id/members` - Listar miembros
- `POST /clubs/:id/members` - Agregar miembro
- `PUT /clubs/:id/members` - Actualizar membresía
- `DELETE /clubs/:id/members` - Eliminar miembro

### ✅ Eventos

- `POST /events` - Crear evento
- `GET /events` - Listar eventos
- `GET /events/:id` - Obtener evento específico
- `PUT /events/:id` - Actualizar evento
- `DELETE /events/:id` - Eliminar evento
- `POST /events/:id/join` - Unirse a evento
- `DELETE /events/:id/join` - Salir de evento
- `GET /events/nearby` - Buscar eventos cercanos
- `GET /events/:id/participants` - Listar participantes
- `POST /events/:id/checkin` - Hacer check-in
- `DELETE /events/:id/checkin` - Deshacer check-in

---

## 🔜 Próximos Endpoints

Los siguientes endpoints están planificados para implementar:

### Pistas (Courts)

- `POST /clubs/:id/courts` - Crear pista
- `GET /clubs/:id/courts` - Listar pistas del club
- `PUT /courts/:id` - Actualizar pista
- `DELETE /courts/:id` - Eliminar pista

### Partidos (Matches)

- `POST /matches` - Crear partido/registrar resultado
- `GET /matches` - Listar partidos
- `GET /matches/:id` - Obtener partido específico
- `PUT /matches/:id` - Actualizar partido
- `DELETE /matches/:id` - Eliminar partido

### Pagos

- `POST /payments/create-intent` - Crear intención de pago
- `POST /payments/confirm` - Confirmar pago
- `GET /payments` - Listar pagos
- `POST /payments/refund` - Procesar reembolso

### Suscripciones de Clubes

- `POST /clubs/:id/subscription` - Crear suscripción
- `GET /clubs/:id/subscription` - Obtener suscripción
- `PUT /clubs/:id/subscription` - Actualizar suscripción
- `DELETE /clubs/:id/subscription` - Cancelar suscripción

### Estadísticas

- `GET /users/:id/stats` - Estadísticas del usuario
- `GET /clubs/:id/stats` - Estadísticas del club
- `GET /events/:id/stats` - Estadísticas del evento

---

## 🛠️ Herramientas de Testing

### Variables de Entorno Recomendadas

```env
base_url=http://localhost:3000/api
user_token=[token de usuario regular]
admin_token=[token de super admin]
club_id=[ID del club para testing]
event_id=[ID de evento para testing]
user_id=[ID del usuario para testing]
```

---

## 📞 Flujo de Uso Típico

### Para Usuarios Regulares:

1. **Registro/Login**: `POST /auth/register` → `POST /auth/login`
2. **Actualizar Perfil**: `PUT /users/profile`
3. **Buscar Clubes**: `GET /clubs?city=Madrid`
4. **Ver Eventos**: `GET /events?clubId={id}` o `GET /events/nearby?city=Madrid`
5. **Unirse a Evento**: `POST /events/:id/join`
6. **Check-in en Evento**: `POST /events/:id/checkin`

### Para Crear y Gestionar un Club:

1. **Registro/Login**: `POST /auth/register` → `POST /auth/login`
2. **Crear Club**: `POST /clubs`
3. **Agregar Miembros**: `POST /clubs/:id/members`
4. **Crear Eventos**: `POST /events`
5. **Gestionar Participantes**: Ver con `GET /events/:id/participants`
6. **Realizar Check-in**: `POST /events/:id/checkin`

### Para SUPER_ADMIN:

1. **Login**: `POST /auth/login`
2. **Listar Usuarios**: `GET /users`
3. **Ver Usuario Específico**: `GET /users/:id`
4. **Gestionar Clubes**: Acceso completo a todos los clubes
5. **Gestionar Eventos**: Acceso completo a todos los eventos
6. **Eliminar Usuarios**: `DELETE /users/:id` (con restricciones)

---

## ⚠️ Notas Importantes

### Generales

- Todos los timestamps están en formato **ISO 8601 UTC**
- Los tokens JWT expiran en **7 días**
- Los precios se manejan en **centavos** (ej: €10.50 = 1050)
- Las contraseñas deben tener mínimo **6 caracteres**
- Los emails deben ser **únicos** en el sistema
- Los IDs utilizan el formato `cuid()` de Prisma

### Permisos de Usuarios

- **Actualizar perfil**: Solo el propio usuario
- **Cambiar contraseña**: Requiere contraseña actual, no disponible para cuentas de Google
- **DUPR ID**: Debe ser único en el sistema
- **Ver usuarios**: Solo SUPER_ADMIN
- **Eliminar usuarios**: Solo SUPER_ADMIN, con restricciones

### Permisos de Clubes

- **Crear clubes**: Cualquier usuario autenticado
- **Actualizar/Eliminar clubes**: Solo creador del club o SUPER_ADMIN
- **Gestionar miembros**: Solo creador del club o SUPER_ADMIN
- **El creador** se convierte automáticamente en primer miembro

### Permisos de Eventos

- **Crear/Actualizar/Eliminar eventos**: Solo creador del club o SUPER_ADMIN
- **Unirse a eventos**: Según visibilidad (OPEN = todos, MEMBERS_ONLY/PRIVATE = solo miembros)
- **Ver participantes**: Solo creador del club, miembros activos o SUPER_ADMIN
- **Check-in**: Usuarios registrados (creadores pueden hacer check-in de otros)

### Check-in System

- Check-in disponible desde **30 minutos antes** del evento
- Primer check-in cambia el estado del evento a **ONGOING**
- Solo usuarios **registrados** pueden hacer check-in
- **No se puede** hacer check-in en eventos COMPLETED o CANCELLED

### Restricciones de Usuario

- No se pueden eliminar usuarios que son **creadores de clubes**
- Los SUPER_ADMIN **no pueden eliminarse a sí mismos**
- Al eliminar un usuario se eliminan en cascada: membresías, participaciones, pagos
- Los DUPR IDs deben ser **únicos**

### Eliminación en Cascada

- Al eliminar un **club** se eliminan automáticamente: membresías, eventos, pistas, suscripciones
- Al eliminar un **evento** se eliminan automáticamente: participantes, matches asociados
- Al eliminar un **usuario** se eliminan automáticamente: membresías, participaciones, pagos
- **No se puede** eliminar:
  - Eventos ONGOING o COMPLETED
  - Creador del club de las membresías
  - Usuarios creadores de clubes

### Zona Horaria

- **Importante**: Todas las fechas deben enviarse en formato UTC
- Para testing, considera tu zona horaria local al crear eventos
- Ejemplo: Si son las 13:00 en España (UTC+2), en UTC son las 11:00

### Limitaciones Actuales

- Eventos de pago aún **no soportados** (retorna 501)
- No se pueden salir de eventos menos de **2 horas antes** del inicio
- Integración con DUPR en preparación
- Sistema de pagos con Stripe en desarrollo
- Límite de **100 usuarios por página** en listados

---

## 🔒 Seguridad

### Autenticación

- JWT tokens con expiración de 7 días
- Contraseñas hasheadas con bcrypt (12 rounds)
- Tokens en header Authorization: Bearer

### Validación

- Validación de datos con Zod en todos los endpoints
- Sanitización de inputs
- Validación de URLs para avatares, logos y websites
- Validación de emails y formatos de fecha

### Autorización

- Control de permisos basado en roles (USER, SUPER_ADMIN)
- Verificación de propiedad de recursos
- Restricciones específicas por endpoint

### Mejores Prácticas

- No exponer información sensible en errores
- Logs de errores en servidor
- Rate limiting (pendiente de implementar)
- CORS configurado correctamente

---

## 🎯 Changelog

### v1.1.0 (Actual)

- ✅ Gestión completa de usuarios (CRUD)
- ✅ Actualización de perfil con cambio de contraseña
- ✅ Integración DUPR ID
- ✅ Sistema de permisos mejorado
- ✅ Restricciones de eliminación de usuarios

### v1.0.0

- ✅ Sistema de autenticación (registro y login)
- ✅ Gestión completa de clubes
- ✅ Sistema de membresías
- ✅ Gestión completa de eventos
- ✅ Sistema de participación en eventos
- ✅ Check-in system
- ✅ Búsqueda de eventos cercanos

---

## 📚 Recursos Adicionales

- **Documentación de Prisma**: https://www.prisma.io/docs
- **Documentación de Zod**: https://zod.dev
- **Next.js App Router**: https://nextjs.org/docs/app
- **JWT**: https://jwt.io

---

## 🤝 Soporte

Para reportar bugs o solicitar features, contacta con el equipo de desarrollo o abre un issue en el repositorio del proyecto
