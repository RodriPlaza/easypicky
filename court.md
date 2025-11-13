## 📅 Court Reservations Endpoints

### Get Court Schedule

**GET** `/courts/:id/schedule`

Get available and occupied time slots for a specific court on a given date.

#### Query Parameters

| Parameter | Type   | Required | Description                 |
| --------- | ------ | -------- | --------------------------- |
| `date`    | string | Yes      | Date in format `YYYY-MM-DD` |

#### Request Example

```http
GET /api/courts/cm3kx8y9z0000/schedule?date=2025-01-15
Authorization: Bearer <jwt_token>
```

#### Success Response (200)

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
    },
    {
      "time": "12:30",
      "isAvailable": false,
      "reservation": {
        "id": "cm3kx8y9z0004",
        "startTime": "2025-01-15T12:30:00.000Z",
        "endTime": "2025-01-15T14:00:00.000Z",
        "event": {
          "id": "cm3kx8y9z0005",
          "title": "Clase de Iniciación"
        },
        "user": {
          "id": "cm3kx8y9z0006",
          "name": "María García",
          "email": "maria@example.com"
        }
      }
    }
  ]
}
```

#### Error Responses

##### Court Not Reservable (400)

```json
{
  "error": "This court does not accept public reservations",
  "details": {
    "courtName": "Pista VIP",
    "suggestion": "This court is only available for club events"
  }
}
```

##### Court Not Found (404)

```json
{
  "error": "Court not found"
}
```

##### Unauthorized (401)

```json
{
  "error": "Unauthorized"
}
```

#### Notes

- Slots are generated based on `openTime`, `closeTime`, and `slotDuration`
- `slotDuration` is in minutes (typically 60, 90, or 120)
- Occupied slots show reservation details including user and optional event/match
- Only users with active session can view schedules

---

### Create Reservation

**POST** `/courts/:id/reservations`

Create a new reservation for a specific time slot on a court.

#### Request Body

```json
{
  "startTime": "2025-01-15T09:30:00.000Z",
  "endTime": "2025-01-15T11:00:00.000Z"
}
```

#### Request Example

```http
POST /api/courts/cm3kx8y9z0000/reservations
Authorization: Bearer <jwt_token>
Content-Type: application/json

{
  "startTime": "2025-01-15T09:30:00.000Z",
  "endTime": "2025-01-15T11:00:00.000Z"
}
```

#### Success Response (201)

```json
{
  "message": "Reservation created successfully",
  "reservation": {
    "id": "cm3kx8y9z0007",
    "startTime": "2025-01-15T09:30:00.000Z",
    "endTime": "2025-01-15T11:00:00.000Z",
    "courtId": "cm3kx8y9z0000",
    "userId": "cm3kx8y9z0003",
    "eventId": null,
    "matchId": null,
    "createdAt": "2025-01-14T10:30:00.000Z",
    "updatedAt": "2025-01-14T10:30:00.000Z",
    "court": {
      "id": "cm3kx8y9z0000",
      "name": "Pista Central",
      "club": {
        "id": "cm3kx8y9z0001",
        "name": "Club Example"
      }
    },
    "user": {
      "id": "cm3kx8y9z0003",
      "name": "Juan Pérez",
      "email": "juan@example.com"
    }
  }
}
```

#### Error Responses

##### Court Not Reservable (400)

```json
{
  "error": "This court does not accept public reservations",
  "details": {
    "courtName": "Pista VIP",
    "suggestion": "This court is only available for club events. Contact the club administrator."
  }
}
```

##### Time Slot Not Available (409)

```json
{
  "error": "Time slot not available",
  "details": {
    "conflictingReservation": {
      "id": "cm3kx8y9z0008",
      "startTime": "2025-01-15T09:00:00.000Z",
      "endTime": "2025-01-15T10:30:00.000Z"
    }
  }
}
```

##### Not a Member (403)

```json
{
  "error": "Forbidden",
  "details": "You must be an active member of the club to make reservations"
}
```

##### Invalid Time Range (400)

```json
{
  "error": "Invalid time range",
  "details": "End time must be after start time"
}
```

##### Outside Court Hours (400)

```json
{
  "error": "Reservation outside court operating hours",
  "details": {
    "courtHours": "08:00 - 23:00",
    "requestedTime": "07:00 - 08:30"
  }
}
```

##### Invalid Slot Duration (400)

```json
{
  "error": "Invalid reservation duration",
  "details": {
    "allowedDuration": 90,
    "requestedDuration": 60,
    "message": "Reservation must match court slot duration (90 minutes)"
  }
}
```

#### Validation Rules

- ✅ Court must have `isReservable: true`
- ✅ Court must be active (`isActive: true`)
- ✅ User must be an active member of the club
- ✅ Time slot must be available (no overlapping reservations)
- ✅ Reservation must be within court operating hours
- ✅ Duration must match court's `slotDuration`
- ✅ `endTime` must be after `startTime`
- ✅ Reservation must be for a future time

#### Permissions

**Who can create reservations:**

- ✅ Active members of the club (`status: ACTIVE`)
- ✅ Club creator
- ✅ SUPER_ADMIN

**Who cannot:**

- ❌ Users with INACTIVE, PENDING, or CANCELLED membership
- ❌ Users not members of the club
- ❌ Unauthenticated users

---

### List My Reservations

**GET** `/courts/reservations/my`

Get all reservations created by the authenticated user.

#### Query Parameters

| Parameter  | Type    | Required | Default | Description              |
| ---------- | ------- | -------- | ------- | ------------------------ |
| `page`     | number  | No       | 1       | Page number              |
| `limit`    | number  | No       | 20      | Items per page (max 100) |
| `upcoming` | boolean | No       | false   | Only future reservations |
| `courtId`  | string  | No       | -       | Filter by court          |
| `clubId`   | string  | No       | -       | Filter by club           |

#### Request Example

```http
GET /api/courts/reservations/my?page=1&limit=20&upcoming=true
Authorization: Bearer <jwt_token>
```

#### Success Response (200)

```json
{
  "reservations": [
    {
      "id": "cm3kx8y9z0007",
      "startTime": "2025-01-15T09:30:00.000Z",
      "endTime": "2025-01-15T11:00:00.000Z",
      "courtId": "cm3kx8y9z0000",
      "userId": "cm3kx8y9z0003",
      "eventId": null,
      "matchId": null,
      "createdAt": "2025-01-14T10:30:00.000Z",
      "court": {
        "id": "cm3kx8y9z0000",
        "name": "Pista Central",
        "club": {
          "id": "cm3kx8y9z0001",
          "name": "Club Example",
          "city": "Madrid"
        }
      }
    }
  ],
  "pagination": {
    "page": 1,
    "limit": 20,
    "totalCount": 15,
    "totalPages": 1,
    "hasNextPage": false,
    "hasPreviousPage": false
  }
}
```

---

### Get Reservation Details

**GET** `/courts/reservations/:id`

Get detailed information about a specific reservation.

#### Request Example

```http
GET /api/courts/reservations/cm3kx8y9z0007
Authorization: Bearer <jwt_token>
```

#### Success Response (200)

```json
{
  "reservation": {
    "id": "cm3kx8y9z0007",
    "startTime": "2025-01-15T09:30:00.000Z",
    "endTime": "2025-01-15T11:00:00.000Z",
    "courtId": "cm3kx8y9z0000",
    "userId": "cm3kx8y9z0003",
    "eventId": null,
    "matchId": null,
    "createdAt": "2025-01-14T10:30:00.000Z",
    "updatedAt": "2025-01-14T10:30:00.000Z",
    "court": {
      "id": "cm3kx8y9z0000",
      "name": "Pista Central",
      "description": "Pista principal del club",
      "slotDuration": 90,
      "club": {
        "id": "cm3kx8y9z0001",
        "name": "Club Example",
        "city": "Madrid",
        "address": "Calle Example 123"
      }
    },
    "user": {
      "id": "cm3kx8y9z0003",
      "name": "Juan Pérez",
      "email": "juan@example.com",
      "avatar": "https://example.com/avatar.jpg"
    }
  }
}
```

#### Error Responses

##### Not Found (404)

```json
{
  "error": "Reservation not found"
}
```

---

### Cancel Reservation

**DELETE** `/courts/reservations/:id`

Cancel a reservation. Users can only cancel their own reservations, unless they are club creator or SUPER_ADMIN.

#### Request Example

```http
DELETE /api/courts/reservations/cm3kx8y9z0007
Authorization: Bearer <jwt_token>
```

#### Success Response (200)

```json
{
  "message": "Reservation cancelled successfully"
}
```

#### Error Responses

##### Not Found (404)

```json
{
  "error": "Reservation not found"
}
```

##### Forbidden (403)

```json
{
  "error": "Forbidden",
  "details": "You can only cancel your own reservations"
}
```

##### Already Started (400)

```json
{
  "error": "Cannot cancel reservation",
  "details": "Reservation has already started or passed"
}
```

#### Permissions

**Who can cancel:**

- ✅ Reservation creator (own reservations)
- ✅ Club creator (any reservation in their club)
- ✅ SUPER_ADMIN (any reservation)

**Restrictions:**

- ❌ Cannot cancel reservations that have already started
- ❌ Cannot cancel past reservations

---

### List Court Reservations (Admin)

**GET** `/clubs/:id/courts/:courtId/reservations`

Get all reservations for a specific court. Only accessible by club creator or SUPER_ADMIN.

#### Query Parameters

| Parameter   | Type    | Required | Default | Description                          |
| ----------- | ------- | -------- | ------- | ------------------------------------ |
| `page`      | number  | No       | 1       | Page number                          |
| `limit`     | number  | No       | 20      | Items per page                       |
| `date`      | string  | No       | -       | Filter by specific date (YYYY-MM-DD) |
| `startDate` | string  | No       | -       | Filter from date                     |
| `endDate`   | string  | No       | -       | Filter until date                    |
| `upcoming`  | boolean | No       | false   | Only future reservations             |

#### Request Example

```http
GET /api/clubs/cm3kx8y9z0001/courts/cm3kx8y9z0000/reservations?date=2025-01-15
Authorization: Bearer <jwt_token>
```

#### Success Response (200)

```json
{
  "court": {
    "id": "cm3kx8y9z0000",
    "name": "Pista Central",
    "club": {
      "id": "cm3kx8y9z0001",
      "name": "Club Example"
    }
  },
  "reservations": [
    {
      "id": "cm3kx8y9z0007",
      "startTime": "2025-01-15T09:30:00.000Z",
      "endTime": "2025-01-15T11:00:00.000Z",
      "user": {
        "id": "cm3kx8y9z0003",
        "name": "Juan Pérez",
        "email": "juan@example.com"
      },
      "event": null,
      "match": null,
      "createdAt": "2025-01-14T10:30:00.000Z"
    }
  ],
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

#### Permissions

**Access:** Club creator or SUPER_ADMIN only

---

### Reservation Statistics

**GET** `/clubs/:id/courts/:courtId/reservations/stats`

Get statistics about court reservations. Only accessible by club creator or SUPER_ADMIN.

#### Query Parameters

| Parameter   | Type   | Required | Default     | Description                  |
| ----------- | ------ | -------- | ----------- | ---------------------------- |
| `startDate` | string | No       | 30 days ago | Start of period (YYYY-MM-DD) |
| `endDate`   | string | No       | today       | End of period (YYYY-MM-DD)   |

#### Request Example

```http
GET /api/clubs/cm3kx8y9z0001/courts/cm3kx8y9z0000/reservations/stats
Authorization: Bearer <jwt_token>
```

#### Success Response (200)

```json
{
  "court": {
    "id": "cm3kx8y9z0000",
    "name": "Pista Central"
  },
  "period": {
    "startDate": "2024-12-15",
    "endDate": "2025-01-15"
  },
  "stats": {
    "totalReservations": 45,
    "completedReservations": 38,
    "upcomingReservations": 7,
    "cancelledReservations": 3,
    "uniqueUsers": 12,
    "averageReservationsPerDay": 1.5,
    "occupancyRate": 68.5,
    "peakHours": [
      { "hour": "18:00", "reservations": 15 },
      { "hour": "19:30", "reservations": 12 },
      { "hour": "20:00", "reservations": 10 }
    ],
    "topUsers": [
      {
        "userId": "cm3kx8y9z0003",
        "userName": "Juan Pérez",
        "reservations": 8
      },
      {
        "userId": "cm3kx8y9z0009",
        "userName": "María García",
        "reservations": 6
      }
    ]
  }
}
```

#### Permissions

**Access:** Club creator or SUPER_ADMIN only

---

### Validation Summary

#### Court Requirements

| Requirement          | Description                           |
| -------------------- | ------------------------------------- |
| `isReservable: true` | Court must accept public reservations |
| `isActive: true`     | Court must be active                  |
| Has operating hours  | `openTime` and `closeTime` defined    |
| Has slot duration    | `slotDuration` configured             |

#### User Requirements

| Requirement     | Description                       |
| --------------- | --------------------------------- |
| Authenticated   | Must have valid JWT token         |
| Club member     | Must be ACTIVE member of the club |
| Or club creator | Creator can always reserve        |
| Or SUPER_ADMIN  | Admin can always reserve          |

#### Time Requirements

| Requirement      | Description                              |
| ---------------- | ---------------------------------------- |
| Future time      | Reservation must be for future date/time |
| Within hours     | Must be within court operating hours     |
| Correct duration | Must match court's `slotDuration`        |
| Available        | Slot must not be occupied                |
| Valid range      | `endTime` > `startTime`                  |

---

### Error Code Reference

| Status | Error                                            | Cause                                    |
| ------ | ------------------------------------------------ | ---------------------------------------- |
| 400    | "This court does not accept public reservations" | Court has `isReservable: false`          |
| 400    | "Invalid time range"                             | `endTime` ≤ `startTime`                  |
| 400    | "Reservation outside court operating hours"      | Time outside `openTime`-`closeTime`      |
| 400    | "Invalid reservation duration"                   | Duration doesn't match `slotDuration`    |
| 400    | "Cannot cancel reservation"                      | Reservation already started/passed       |
| 401    | "Unauthorized"                                   | Missing or invalid JWT token             |
| 403    | "Forbidden"                                      | Not a member or insufficient permissions |
| 404    | "Court not found"                                | Invalid court ID                         |
| 404    | "Reservation not found"                          | Invalid reservation ID                   |
| 409    | "Time slot not available"                        | Overlapping reservation exists           |

---

### Integration Examples

#### Example 1: Reserve a Court Slot

```javascript
// 1. Get court schedule for a date
const schedule = await fetch(
  "/api/courts/cm3kx8y9z0000/schedule?date=2025-01-15",
  {
    headers: { Authorization: `Bearer ${token}` },
  }
).then((r) => r.json());

// 2. Find available slot
const availableSlot = schedule.slots.find((slot) => slot.isAvailable);

if (!availableSlot) {
  console.log("No slots available");
  return;
}

// 3. Calculate end time (slot time + slot duration)
const startTime = new Date(`2025-01-15T${availableSlot.time}:00.000Z`);
const endTime = new Date(
  startTime.getTime() + schedule.court.slotDuration * 60000
);

// 4. Create reservation
const reservation = await fetch("/api/courts/cm3kx8y9z0000/reservations", {
  method: "POST",
  headers: {
    Authorization: `Bearer ${token}`,
    "Content-Type": "application/json",
  },
  body: JSON.stringify({
    startTime: startTime.toISOString(),
    endTime: endTime.toISOString(),
  }),
}).then((r) => r.json());

console.log("Reservation created:", reservation.reservation.id);
```

#### Example 2: View My Upcoming Reservations

```javascript
const myReservations = await fetch(
  "/api/courts/reservations/my?upcoming=true",
  {
    headers: { Authorization: `Bearer ${token}` },
  }
).then((r) => r.json());

console.log(
  `You have ${myReservations.reservations.length} upcoming reservations`
);

myReservations.reservations.forEach((res) => {
  console.log(
    `${res.court.name} at ${new Date(res.startTime).toLocaleString()}`
  );
});
```

#### Example 3: Cancel a Reservation

```javascript
try {
  await fetch("/api/courts/reservations/cm3kx8y9z0007", {
    method: "DELETE",
    headers: { Authorization: `Bearer ${token}` },
  });
  console.log("Reservation cancelled successfully");
} catch (error) {
  console.error("Failed to cancel:", error.message);
}
```

#### Example 4: Check Court Availability Before Reserving

```javascript
async function isSlotAvailable(courtId, date, time) {
  const schedule = await fetch(`/api/courts/${courtId}/schedule?date=${date}`, {
    headers: { Authorization: `Bearer ${token}` },
  }).then((r) => r.json());

  const slot = schedule.slots.find((s) => s.time === time);
  return slot ? slot.isAvailable : false;
}

// Usage
const available = await isSlotAvailable("cm3kx8y9z0000", "2025-01-15", "18:00");
if (available) {
  // Proceed with reservation
}
```

---

### Best Practices

#### For Clients

1. **Always check schedule before reserving**

   - Verify slot is available
   - Ensure user is a member
   - Check court is reservable

2. **Handle errors gracefully**

   - Show user-friendly messages
   - Suggest alternative slots if chosen slot is taken
   - Validate time ranges client-side first

3. **Refresh schedule after operations**

   - After creating reservation
   - After cancelling reservation
   - Periodically while viewing schedule

4. **Display time in user's timezone**
   - API returns UTC times
   - Convert to local timezone for display
   - Send UTC times in requests

#### For Admins

1. **Configure courts properly**

   - Set appropriate `slotDuration` (60, 90, or 120 min typical)
   - Define clear operating hours
   - Enable `isReservable` only for public courts

2. **Monitor reservations**

   - Use stats endpoint for insights
   - Check occupancy rates
   - Identify peak hours

3. **Manage member access**
   - Keep memberships updated
   - Review reservation patterns
   - Handle conflicts promptly

---

### Future Enhancements (Not Yet Implemented)

- [ ] Recurring reservations
- [ ] Reservation reminders (email/push)
- [ ] Waitlist for full slots
- [ ] Reservation limits per user
- [ ] Advance booking limit (e.g., max 14 days ahead)
- [ ] Cancellation policies with penalties
- [ ] Group reservations (reserve multiple slots)
- [ ] Reservation templates (favorite time slots)
- [ ] Court preferences per user
- [ ] Automatic release of unpaid reservations

---

**Last Updated:** January 2025
**API Version:** 1.0
