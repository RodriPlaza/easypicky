# EasyPicky API - Endpoints Documentation

## Base URL

```
http://localhost:3000/api
```

## Authentication

Include JWT token in all protected requests:

```
Authorization: Bearer <jwt_token>
```

---

## 🔐 Auth Endpoints

### Register

**POST** `/auth/register`

```json
{
  "name": "string",
  "email": "string",
  "password": "string (min 6)",
  "phone": "string (optional)",
  "city": "string (optional)"
}
```

**Response:** `{ message, user }`

### Login

**POST** `/auth/login`

```json
{
  "email": "string",
  "password": "string"
}
```

**Response:** `{ message, user, token }`

### Get Profile

**GET** `/auth/profile`
**Response:** `{ user }`

---

## 👤 User Endpoints

### Get Profile

**GET** `/users/profile`
**Response:** `{ user }`

### Update Profile

**PUT** `/users/profile`

```json
{
  "name": "string (optional)",
  "phone": "string (optional)",
  "city": "string (optional)",
  "avatar": "string URL (optional)",
  "duprId": "string (optional)",
  "currentPassword": "string (required for password change)",
  "newPassword": "string (optional, min 6)"
}
```

### List User Memberships

**GET** `/users/memberships?page=1&limit=20&status=ACTIVE`

**Status:** `ACTIVE` | `INACTIVE` | `PENDING` | `CANCELLED`

**Response:** `{ memberships, pagination }`

### List Users (SUPER_ADMIN only)

**GET** `/users?page=1&limit=20&search=text&city=Madrid&role=USER`

### Get User

**GET** `/users/:id` (SUPER_ADMIN only)

### Delete User

**DELETE** `/users/:id` (SUPER_ADMIN only)

---

## 🏢 Club Endpoints

### Create Club

**POST** `/clubs`

```json
{
  "name": "string (required)",
  "description": "string",
  "address": "string (required)",
  "city": "string (required)",
  "phone": "string",
  "email": "string",
  "website": "string URL",
  "logo": "string URL"
}
```

### List Clubs

**GET** `/clubs?page=1&limit=10&city=Madrid&search=text`

### Get Club

**GET** `/clubs/:id`

### Update Club

**PUT** `/clubs/:id` (Creator or SUPER_ADMIN only)

```json
{
  "name": "string",
  "description": "string",
  "address": "string",
  "city": "string",
  "phone": "string",
  "email": "string",
  "website": "string URL",
  "logo": "string URL"
}
```

### Delete Club

**DELETE** `/clubs/:id` (Creator or SUPER_ADMIN only)

---

## 👥 Membership Endpoints

### List Club Members

**GET** `/clubs/:id/members?status=ACTIVE&page=1&limit=20`
(Creator or SUPER_ADMIN only)

**Status:** `ACTIVE` | `INACTIVE` | `PENDING` | `CANCELLED`

### Add Member

**POST** `/clubs/:id/members`

```json
{
  "userId": "string",
  "status": "ACTIVE | PENDING",
  "expiresAt": "ISO date (optional)"
}
```

### Update Membership

**PUT** `/clubs/:id/members?userId=:userId`

```json
{
  "status": "ACTIVE | INACTIVE | PENDING | CANCELLED",
  "expiresAt": "ISO date (optional)"
}
```

### Remove Member

**DELETE** `/clubs/:id/members?userId=:userId`

---

## 🤝 Join Club Endpoints

### Request to Join Club

**POST** `/clubs/:id/join`

Allows authenticated users to request membership to a club (creates PENDING membership).

**Response:** `{ message, membership }`

### Leave Club / Cancel Request

**DELETE** `/clubs/:id/join`

Allows users to leave a club or cancel their membership request.

- If status is PENDING: deletes membership completely
- If status is ACTIVE: changes to CANCELLED
- Club creators cannot leave their own clubs

**Response:** `{ message }`

---

---

## 🎯 Event Endpoints

### Create Event

**POST** `/events` (Club creator or SUPER_ADMIN only)

```json
{
  "title": "string (required)",
  "description": "string",
  "type": "CLASS | TOURNAMENT | MEETUP",
  "visibility": "OPEN | MEMBERS_ONLY | PRIVATE",
  "startDateTime": "ISO date (required)",
  "endDateTime": "ISO date (required)",
  "maxParticipants": "number",
  "price": "number (cents)",
  "clubId": "string (required)",
  "courtId": "string"
}
```

**Event Status:** `SCHEDULED` | `ONGOING` | `COMPLETED` | `CANCELLED`

### List Events

**GET** `/events?page=1&limit=10&clubId=id&type=CLASS&status=SCHEDULED&city=Madrid&startDate=date&endDate=date&upcoming=true`

### Get Event

**GET** `/events/:id`

### Update Event

**PUT** `/events/:id` (Club creator or SUPER_ADMIN only)

```json
{
  "title": "string",
  "description": "string",
  "type": "CLASS | TOURNAMENT | MEETUP",
  "visibility": "OPEN | MEMBERS_ONLY | PRIVATE",
  "status": "SCHEDULED | ONGOING | COMPLETED | CANCELLED",
  "startDateTime": "ISO date",
  "endDateTime": "ISO date",
  "maxParticipants": "number",
  "price": "number",
  "courtId": "string"
}
```

### Delete Event

**DELETE** `/events/:id` (Club creator or SUPER_ADMIN only)

### Join Event

**POST** `/events/:id/join`
**Response:** `{ message, participation }`

### Leave Event

**DELETE** `/events/:id/join`

### Search Nearby Events

**GET** `/events/nearby?city=Madrid&page=1&limit=10&type=CLASS&daysAhead=7&openOnly=false`

### List Event Participants

**GET** `/events/:id/participants?page=1&limit=20&checkedIn=true`

### Check-in to Event

**POST** `/events/:id/checkin`

```json
{
  "userId": "string (optional, for club creator)"
}
```

### Undo Check-in

**DELETE** `/events/:id/checkin?userId=id`

---

## 🏟️ Court Endpoints

### Create Court

**POST** `/clubs/:id/courts` (Club creator or SUPER_ADMIN only)

```json
{
  "name": "Pista Central",
  "description": "Pista principal del club",
  "isActive": true,
  "isReservable": true,
  "openTime": "08:00",
  "closeTime": "23:00",
  "slotDuration": 90
}
```

```json
{
  "name": "Pista VIP",
  "description": "Solo para eventos especiales",
  "isActive": true,
  "isReservable": false
  // openTime, closeTime, slotDuration no requeridos
}
```

### List Club Courts

**GET** `/clubs/:id/courts?page=1&limit=20&isActive=true`

### Get Court

**GET** `/clubs/:clubId/courts/:id`

### Update Court

**PUT** `/clubs/:clubId/courts/:id`

```json
{
  "name": "string",
  "description": "string",
  "isActive": "boolean",
  "isReservable": false
}
```

### Delete Court

**DELETE** `/clubs/:clubId/courts/:id`

---

## 🏟️ Court Endpoints

### Create Court

**POST** `/clubs/:id/courts` (Club creator or SUPER_ADMIN only)

**Pista Reservable:**

```json
{
  "name": "Pista Central",
  "description": "Pista principal del club",
  "isActive": true,
  "isReservable": true,
  "openTime": "08:00",
  "closeTime": "23:00",
  "slotDuration": 90
}
```

**Pista Solo Eventos:**

```json
{
  "name": "Pista VIP",
  "description": "Solo para eventos especiales",
  "isActive": true,
  "isReservable": false
  // openTime, closeTime, slotDuration no requeridos
}
```

**Validation:**

- If `isReservable: true` → `openTime`, `closeTime`, `slotDuration` are **required**
- If `isReservable: false` → time fields are **optional** (default values used)

**Response:** `{ message, court }`

### List Club Courts

**GET** `/clubs/:id/courts?page=1&limit=20&isActive=true`

### Get Court

**GET** `/clubs/:clubId/courts/:id`

### Update Court

**PUT** `/clubs/:clubId/courts/:id`

```json
{
  "name": "string",
  "description": "string",
  "isActive": "boolean",
  "isReservable": "boolean"
}
```

**Important:** When changing `isReservable` from `true` to `false`:

- Backend validates if there are future reservations
- Returns **409 Conflict** if future reservations exist
- Must cancel all future reservations first

**Error Example (409):**

```json
{
  "error": "Cannot disable reservability with existing future reservations",
  "details": {
    "futureReservations": 3,
    "suggestion": "Please cancel future reservations before disabling public reservations"
  }
}
```

### Delete Court

**DELETE** `/clubs/:clubId/courts/:id`

---

## 📅 Court Reservations Endpoints

### Get Court Schedule

**GET** `/courts/:id/schedule?date=YYYY-MM-DD`

Get available and occupied time slots for a specific court on a given date.

**Query Parameters:**

- `date` (required): Date in format `YYYY-MM-DD`

**Request Example:**

```http
GET /api/courts/cm3kx8y9z0000/schedule?date=2025-01-15
Authorization: Bearer <jwt_token>
```

**Success Response (200):**

```json
{
  "court": {
    "id": "cm3kx8y9z0000",
    "name": "Pista Central",
    "openTime": "08:00",
    "closeTime": "23:00",
    "slotDuration": 90,
    "club": {
      "id": "cm3kx8y9z0001",
      "name": "Club Example"
    }
  },
  "date": "2025-01-15",
  "slots": [
    {
      "time": "08:00",
      "isAvailable": true
    },
    {
      "time": "09:30",
      "isAvailable": false,
      "reservation": {
        "id": "cm3kx8y9z0002",
        "startTime": "2025-01-15T09:30:00.000Z",
        "endTime": "2025-01-15T11:00:00.000Z",
        "user": {
          "id": "cm3kx8y9z0003",
          "name": "Juan Pérez",
          "email": "juan@example.com"
        }
      }
    },
    {
      "time": "11:00",
      "isAvailable": true
    }
  ]
}
```

**Error Response - Court Not Reservable (400):**

```json
{
  "error": "This court does not accept public reservations",
  "details": {
    "courtName": "Pista VIP",
    "suggestion": "This court is only available for club events"
  }
}
```

**Validation:**

- ✅ Court must have `isReservable: true`
- ✅ User must be authenticated

**Notes:**

- Slots are generated based on `openTime`, `closeTime`, and `slotDuration`
- Occupied slots include reservation details (user, event, match if applicable)

---

### Create Reservation

**POST** `/courts/:id/reservations`

Create a new reservation for a specific time slot.

**Request Body:**

```json
{
  "startTime": "2025-01-15T09:30:00.000Z",
  "endTime": "2025-01-15T11:00:00.000Z"
}
```

**Request Example:**

```http
POST /api/courts/cm3kx8y9z0000/reservations
Authorization: Bearer <jwt_token>
Content-Type: application/json

{
  "startTime": "2025-01-15T09:30:00.000Z",
  "endTime": "2025-01-15T11:00:00.000Z"
}
```

**Success Response (201):**

```json
{
  "message": "Reservation created successfully",
  "reservation": {
    "id": "cm3kx8y9z0007",
    "startTime": "2025-01-15T09:30:00.000Z",
    "endTime": "2025-01-15T11:00:00.000Z",
    "courtId": "cm3kx8y9z0000",
    "userId": "cm3kx8y9z0003",
    "createdAt": "2025-01-14T10:30:00.000Z",
    "court": {
      "id": "cm3kx8y9z0000",
      "name": "Pista Central",
      "club": {
        "id": "cm3kx8y9z0001",
        "name": "Club Example"
      }
    }
  }
}
```

**Error Response - Court Not Reservable (400):**

```json
{
  "error": "This court does not accept public reservations",
  "details": {
    "courtName": "Pista VIP",
    "suggestion": "This court is only available for club events. Contact the club administrator."
  }
}
```

**Validation:**

- ✅ Court must have `isReservable: true`
- ✅ Court must be active (`isActive: true`)
- ✅ User must be an active member of the club, club creator, or SUPER_ADMIN
- ✅ Time slot must be available (no overlapping reservations)
- ✅ Reservation must be within court operating hours
- ✅ Duration must match court's `slotDuration`
- ✅ `endTime` must be after `startTime`

**Permissions:**

- ✅ Active members of the club (`status: ACTIVE`)
- ✅ Club creator
- ✅ SUPER_ADMIN
- ❌ Users with INACTIVE, PENDING, or CANCELLED membership

---

### Cancel Reservation

**DELETE** `/courts/:id/reservations/:reservationId`

Cancel an existing reservation.

**Request Example:**

```http
DELETE /api/courts/cm3kx8y9z0000/reservations/cm3kx8y9z0007
Authorization: Bearer <jwt_token>
```

**Success Response (200):**

```json
{
  "message": "Reservation cancelled successfully"
}
```

**Permissions:**

- ✅ Reservation creator (own reservations)
- ✅ Club creator (any reservation in their club)
- ✅ SUPER_ADMIN (any reservation)

**Restrictions:**

- ❌ Cannot cancel reservations that have already started
- ❌ Cannot cancel past reservations

---

## ⚠️ Important Notes - Court Reservations

### Court Requirements

| Field          | Required When        | Description                                                 |
| -------------- | -------------------- | ----------------------------------------------------------- |
| `isReservable` | Always               | `true` = accepts public reservations, `false` = events only |
| `openTime`     | `isReservable: true` | Court opening time (HH:mm format)                           |
| `closeTime`    | `isReservable: true` | Court closing time (HH:mm format)                           |
| `slotDuration` | `isReservable: true` | Reservation slot duration in minutes (15-240)               |

### Changing Court to Non-Reservable

When updating a court from `isReservable: true` to `isReservable: false`:

1. Backend checks for future reservations
2. If future reservations exist → **409 Conflict** error
3. Must cancel all future reservations first
4. Then can change to non-reservable

### Validation Summary

**Court Validation:**

- Court must have `isReservable: true`
- Court must be active
- Operating hours must be defined

**User Validation:**

- Must be authenticated
- Must be active member, club creator, or SUPER_ADMIN

**Time Validation:**

- Within court operating hours
- Matches slot duration
- No overlapping reservations
- Future time only

### Error Codes

| Status | Error                                                            | When                                                |
| ------ | ---------------------------------------------------------------- | --------------------------------------------------- |
| 400    | "This court does not accept public reservations"                 | `isReservable: false`                               |
| 400    | "Time fields are required when court is reservable"              | Creating reservable court without times             |
| 400    | "Close time must be after open time"                             | Invalid time range                                  |
| 409    | "Cannot disable reservability with existing future reservations" | Changing to non-reservable with active reservations |

---

## 🎾 Match Endpoints

### Informal Matches

#### Create Match

**POST** `/matches`

```json
{
  "matchType": "SINGLES | DOUBLES",
  "startTime": "ISO date",
  "endTime": "ISO date",
  "score": "string (e.g., '21-19,21-17')",
  "completed": "boolean",
  "courtId": "string",
  "eventId": "string",
  "participants": [
    {
      "userId": "string",
      "team": 1 | 2,
      "isWinner": "boolean"
    }
  ]
}
```

**Match Types:**

- `SINGLES`: Max 2 participants (1vs1)
- `DOUBLES`: Max 4 participants (2vs2)

**Score Format:** `"21-19"` or `"21-19,19-21,11-9"` (1-5 sets)

#### List My Matches

**GET** `/matches?page=1&limit=20&matchType=DOUBLES&completed=true&userId=id`

#### Get Match

**GET** `/matches/:id`

#### Update Match

**PUT** `/matches/:id` (Creator only)

#### Delete Match

**DELETE** `/matches/:id` (Creator only)

### Club Matches

#### Create Club Match

**POST** `/clubs/:id/matches` (Club creator or SUPER_ADMIN only)

```json
{
  "matchType": "SINGLES | DOUBLES",
  "courtId": "string (required)",
  "startTime": "ISO date",
  "endTime": "ISO date",
  "score": "string",
  "completed": "boolean",
  "eventId": "string",
  "participants": [
    {
      "userId": "string",
      "team": 1 | 2,
      "isWinner": "boolean"
    }
  ]
}
```

#### List Club Matches

**GET** `/clubs/:id/matches?page=1&limit=20&matchType=DOUBLES&completed=true&courtId=id&eventId=id`

#### Get Club Match

**GET** `/clubs/:id/matches/:matchId`

#### Update Club Match

**PUT** `/clubs/:id/matches/:matchId` (Club creator or SUPER_ADMIN only)

#### Delete Club Match

**DELETE** `/clubs/:id/matches/:matchId` (Club creator or SUPER_ADMIN only)

### Additional Match Queries

#### List Event Matches

**GET** `/events/:id/matches?page=1&limit=20&matchType=DOUBLES&completed=true`

#### User Match History

**GET** `/users/:id/matches?page=1&limit=20&matchType=DOUBLES&completed=true&clubMatches=true&informalMatches=true`

**Returns stats:** totalMatches, completedMatches, wins, losses, winRate, etc.

---

## 📊 Response Structure

### Success Response

```json
{
  "message": "string",
  "data": {},
  "pagination": {
    "page": 1,
    "limit": 20,
    "totalCount": 100,
    "totalPages": 5,
    "hasNextPage": true,
    "hasPreviousPage": false
  }
}
```

### Error Response

```json
{
  "error": "Error message",
  "details": {}
}
```

---

## 🔑 HTTP Status Codes

- `200` - Success
- `201` - Created
- `400` - Bad Request (validation error)
- `401` - Unauthorized (invalid/missing token)
- `403` - Forbidden (insufficient permissions)
- `404` - Not Found
- `409` - Conflict (duplicates, restrictions)
- `500` - Internal Server Error
- `501` - Not Implemented

---

## 🔒 User Roles

- `USER` - Standard user
- `SUPER_ADMIN` - Platform admin (full access)

---

## 📋 Key Models

### User

```typescript
{
  id: string
  email: string
  name: string
  phone?: string
  avatar?: string
  city?: string
  duprId?: string
  duprRating?: number
  role: "USER" | "SUPER_ADMIN"
  createdAt: string
  updatedAt: string
}
```

### Club

```typescript
{
  id: string
  name: string
  description?: string
  address: string
  city: string
  phone?: string
  email?: string
  website?: string
  logo?: string
  createdAt: string
  updatedAt: string
  creatorId: string
}
```

### Event

```typescript
{
  id: string
  title: string
  description?: string
  type: "CLASS" | "TOURNAMENT" | "MEETUP"
  visibility: "OPEN" | "MEMBERS_ONLY" | "PRIVATE"
  status: "SCHEDULED" | "ONGOING" | "COMPLETED" | "CANCELLED"
  startDateTime: string
  endDateTime: string
  maxParticipants?: number
  price?: number
  clubId: string
  courtId?: string
  createdAt: string
  updatedAt: string
  club?: {
    id: string
    name: string
    city: string
    logo?: string
    creatorId: string
  }
}
```

### Match

```typescript
{
  id: string
  matchType: "SINGLES" | "DOUBLES"
  startTime?: string
  endTime?: string
  score?: string
  completed: boolean
  creatorId: string
  courtId?: string
  eventId?: string
  createdAt: string
  updatedAt: string
}
```

### Court

```typescript
{
  id: string
  name: string
  description?: string
  isActive: boolean
  isReservable: boolean // ✨ NUEVO
  openTime: string
  closeTime: string
  slotDuration: number
  clubId: string
  createdAt: string
  updatedAt: string
}
```

---

## ⚠️ Important Notes

### Dates & Time

- All dates in **ISO 8601 UTC** format
- Check-in available **30 minutes before** event start
- Cannot leave events **2 hours before** start

### Permissions

- **Club management**: Creator or SUPER_ADMIN only
- **Event join**: Based on visibility (OPEN, MEMBERS_ONLY, PRIVATE)
- **Match creation**: Informal = anyone, Club = creator/admin only

### Validation

- Passwords: min 6 characters
- Email: must be unique
- DUPR ID: must be unique
- Score format: `^\d{1,2}-\d{1,2}(,\d{1,2}-\d{1,2}){0,4}$`

### Restrictions

- Cannot delete club creators
- Cannot delete events that are ONGOING or COMPLETED
- Cannot deactivate courts with future events
- All club match participants must be active members

---

## 🎯 Quick Start Example

```javascript
// 1. Register/Login
const { token } = await fetch("/api/auth/login", {
  method: "POST",
  body: JSON.stringify({ email, password }),
}).then((r) => r.json());

// 2. Get clubs
const clubs = await fetch("/api/clubs?city=Madrid", {
  headers: { Authorization: `Bearer ${token}` },
}).then((r) => r.json());

// 3. Get events
const events = await fetch("/api/events?clubId=xxx", {
  headers: { Authorization: `Bearer ${token}` },
}).then((r) => r.json());

// 4. Join event
await fetch("/api/events/xxx/join", {
  method: "POST",
  headers: { Authorization: `Bearer ${token}` },
});

// 5. Check-in
await fetch("/api/events/xxx/checkin", {
  method: "POST",
  headers: { Authorization: `Bearer ${token}` },
});
```
