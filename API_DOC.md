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
    "description": "Descripción actualizada",
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
  "message": "Club deleted successfully. All associated data (members, events, courts) has been removed."
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
      "email": "member@example.com",
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

## 📊 Códigos de Estado HTTP

| Código | Significado |
|--------|-------------|
| `200` | OK - Petición exitosa |
| `201` | Created - Recurso creado exitosamente |
| `400` | Bad Request - Error en la petición (validación, datos faltantes) |
| `401` | Unauthorized - Token inválido o faltante |
| `403` | Forbidden - Sin permisos suficientes |
| `404` | Not Found - Recurso no encontrado |
| `409` | Conflict - Conflicto con el estado actual (duplicados, restricciones) |
| `500` | Internal Server Error - Error del servidor |

---

## 🔑 Roles de Usuario

| Rol | Descripción |
|-----|-------------|
| `USER` | Usuario estándar - puede unirse a eventos y clubes |
| `SUPER_ADMIN` | Administrador de plataforma - acceso completo |

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
  courtId?: string
}
```

---

## 🚀 Próximos Endpoints

Los siguientes endpoints están planificados para implementar:

### Eventos
- `POST /events` - Crear evento
- `GET /events` - Listar eventos
- `GET /events/:id` - Obtener evento específico
- `POST /events/:id/join` - Unirse a evento
- `GET /events/nearby` - Eventos cercanos

### Gestión de Usuarios
- `PUT /users/profile` - Actualizar perfil
- `GET /users` - Listar usuarios (admin)
- `DELETE /users/:id` - Eliminar usuario

### Pistas (Courts)
- `POST /clubs/:id/courts` - Crear pista
- `GET /clubs/:id/courts` - Listar pistas del club
- `PUT /courts/:id` - Actualizar pista
- `DELETE /courts/:id` - Eliminar pista

### Pagos
- `POST /payments/create-intent` - Crear intención de pago
- `POST /payments/confirm` - Confirmar pago

### Estadísticas
- `GET /users/:id/stats` - Estadísticas del usuario
- `GET /clubs/:id/stats` - Estadísticas del club
- `POST /matches` - Registrar resultado de partido

---

## 🛠️ Herramientas de Testing

### Variables de Entorno Recomendadas
```
base_url=http://localhost:3000/api
creator_token=[token del creador de club]
member_token=[token de miembro]
external_token=[token de usuario externo]
club_id=[ID del club para testing]
user_id=[ID de usuario para testing]
```

### Flujo de Testing Completo

1. **Autenticación**
   - Registrar varios usuarios con roles diferentes
   - Login y obtener tokens para cada usuario

2. **Gestión de Clubes**
   - Crear club con usuario creador
   - Listar clubes (público)
   - Obtener detalles de club
   - Actualizar club (solo creador)
   - Intentar eliminar club con miembros (error esperado)

3. **Gestión de Membresías**
   - Agregar miembros con diferentes estados
   - Listar miembros con filtros
   - Actualizar estados de membresía
   - Eliminar miembros
   - Probar restricciones de permisos

---

## 📞 Flujo de Uso Típico

### Para Crear y Gestionar un Club:
1. **Registro/Login**: `POST /auth/register` → `POST /auth/login`
2. **Crear Club**: `POST /clubs`
3. **Agregar Miembros**: `POST /clubs/:id/members`
4. **Gestionar Membresías**: `PUT /clubs/:id/members`
5. **Ver Estadísticas**: `GET /clubs/:id`

### Para Unirse a un Club:
1. **Buscar Clubes**: `GET /clubs?city=Madrid`
2. **Ver Detalles**: `GET /clubs/:id`
3. **Solicitar Membresía**: (Por implementar)
4. **Esperar Aprobación**: El admin gestiona con `PUT /clubs/:id/members`

---

## ⚠️ Notas Importantes

- Todos los timestamps están en formato ISO 8601 UTC
- Los tokens JWT expiran en 7 días
- Los precios se manejan en **centavos** (ej: €10.50 = 1050)
- Las contraseñas deben tener mínimo 6 caracteres
- Los emails deben ser únicos en el sistema
- Los IDs utilizan el formato `cuid()` de Prisma
- **Eliminación en Cascada**: Al eliminar un club se eliminan automáticamente todas sus membresías, eventos, pistas y datos asociados
- **Permisos de Club**: Solo el creador del club puede gestionarlo (no hay rol CLUB_ADMIN intermedio)
- **Membresía del Creador**: El creador del club se convierte automáticamente en miembro ACTIVE y no puede ser eliminado