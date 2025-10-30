# EasyPicky API - Frontend Documentation

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
  "name": "string (required)",
  "description": "string",
  "isActive": "boolean"
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
  "isActive": "boolean"
}
```

### Delete Court

**DELETE** `/clubs/:clubId/courts/:id`

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
