// src/app/api/events/[id]/route.ts
import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { z } from "zod";
import { verifyToken } from "@/lib/auth-middleware";
import { EventType, EventVisibility, EventStatus } from "@prisma/client";

const updateEventSchema = z
  .object({
    title: z
      .string()
      .min(1, "Event title is required")
      .max(100, "Event title too long")
      .optional(),
    description: z.string().optional(),
    type: z.nativeEnum(EventType).optional(),
    visibility: z.nativeEnum(EventVisibility).optional(),
    status: z.nativeEnum(EventStatus).optional(),
    startDateTime: z.string().datetime("Invalid start date format").optional(),
    endDateTime: z.string().datetime("Invalid end date format").optional(),
    maxParticipants: z.number().int().positive().optional(),
    price: z.number().min(0, "Price cannot be negative").optional(),
    courtId: z.string().cuid("Invalid court ID").optional(),
  })
  .refine(
    (data) => {
      if (data.startDateTime && data.endDateTime) {
        return new Date(data.endDateTime) > new Date(data.startDateTime);
      }
      return true;
    },
    {
      message: "End date must be after start date",
      path: ["endDateTime"],
    }
  );

interface RouteParams {
  params: { id: string };
}

// GET - Obtener evento específico
export async function GET(request: NextRequest, { params }: RouteParams) {
  try {
    const { id } = await params;

    // Validar ID
    const eventId = z.string().cuid().parse(id);

    const event = await prisma.event.findUnique({
      where: { id: eventId },
      include: {
        club: {
          select: {
            id: true,
            name: true,
            city: true,
            address: true,
            phone: true,
            email: true,
            website: true,
            logo: true,
          },
        },
        court: {
          select: {
            id: true,
            name: true,
            description: true,
          },
        },
        participants: {
          include: {
            user: {
              select: {
                id: true,
                name: true,
                email: true,
                avatar: true,
                duprRating: true,
              },
            },
          },
          orderBy: {
            registeredAt: "asc",
          },
        },
        _count: {
          select: {
            participants: true,
            matches: true,
          },
        },
      },
    });

    if (!event) {
      return NextResponse.json({ error: "Event not found" }, { status: 404 });
    }

    // Verificar visibilidad del evento
    if (event.visibility === "PRIVATE") {
      const user = await verifyToken(request);

      if (!user) {
        return NextResponse.json(
          { error: "Unauthorized - Private event" },
          { status: 401 }
        );
      }

      // Verificar si el usuario es miembro del club o creador
      const membership = await prisma.clubMembership.findFirst({
        where: {
          userId: user.userId,
          clubId: event.clubId,
          status: "ACTIVE",
        },
      });

      const isClubCreator = await prisma.club.findFirst({
        where: {
          id: event.clubId,
          creatorId: user.userId,
        },
      });

      if (!membership && !isClubCreator && user.role !== "SUPER_ADMIN") {
        return NextResponse.json(
          { error: "Forbidden - You don't have access to this private event" },
          { status: 403 }
        );
      }
    }

    return NextResponse.json({ event });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json({ error: "Invalid event ID" }, { status: 400 });
    }

    console.error("Get event error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

// PUT - Actualizar evento
export async function PUT(request: NextRequest, { params }: RouteParams) {
  // Verificar autenticación manualmente
  const user = await verifyToken(request);
  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const { id } = await params;
    const body = await request.json();

    // Validar ID y datos
    const eventId = z.string().cuid().parse(id);
    const validatedData = updateEventSchema.parse(body);

    // Verificar que el evento existe
    const existingEvent = await prisma.event.findUnique({
      where: { id: eventId },
      include: {
        club: true,
      },
    });

    if (!existingEvent) {
      return NextResponse.json({ error: "Event not found" }, { status: 404 });
    }

    // Verificar permisos: creador del club o SUPER_ADMIN
    const isClubCreator = existingEvent.club.creatorId === user.userId;
    const isSuperAdmin = user.role === "SUPER_ADMIN";

    if (!isClubCreator && !isSuperAdmin) {
      return NextResponse.json(
        { error: "Forbidden - You don't have permission to update this event" },
        { status: 403 }
      );
    }

    // Verificar que la pista existe (si se especifica)
    if (validatedData.courtId) {
      const court = await prisma.court.findFirst({
        where: {
          id: validatedData.courtId,
          clubId: existingEvent.clubId,
          isActive: true,
        },
      });

      if (!court) {
        return NextResponse.json(
          { error: "Court not found or not active in this club" },
          { status: 404 }
        );
      }
    }

    // Validar fechas si se están actualizando
    const updateData: any = { ...validatedData };

    if (validatedData.startDateTime) {
      updateData.startDateTime = new Date(validatedData.startDateTime);

      // Si es una fecha pasada y el evento aún no ha comenzado, no permitir
      if (
        updateData.startDateTime < new Date() &&
        existingEvent.status === "SCHEDULED"
      ) {
        return NextResponse.json(
          { error: "Cannot set start date in the past for scheduled events" },
          { status: 400 }
        );
      }
    }

    if (validatedData.endDateTime) {
      updateData.endDateTime = new Date(validatedData.endDateTime);
    }

    // Actualizar el evento
    const updatedEvent = await prisma.event.update({
      where: { id: eventId },
      data: updateData,
      include: {
        club: {
          select: {
            id: true,
            name: true,
            city: true,
          },
        },
        court: {
          select: {
            id: true,
            name: true,
          },
        },
        _count: {
          select: {
            participants: true,
          },
        },
      },
    });

    return NextResponse.json({
      message: "Event updated successfully",
      event: updatedEvent,
    });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: "Validation error", details: error },
        { status: 400 }
      );
    }

    console.error("Update event error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

// DELETE - Eliminar evento
export async function DELETE(request: NextRequest, { params }: RouteParams) {
  // Verificar autenticación manualmente
  const user = await verifyToken(request);
  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const { id } = await params;

    // Validar ID
    const eventId = z.string().cuid().parse(id);

    // Verificar que el evento existe
    const existingEvent = await prisma.event.findUnique({
      where: { id: eventId },
      include: {
        club: true,
        _count: {
          select: {
            participants: true,
          },
        },
      },
    });

    if (!existingEvent) {
      return NextResponse.json({ error: "Event not found" }, { status: 404 });
    }

    // Verificar permisos: creador del club o SUPER_ADMIN
    const isClubCreator = existingEvent.club.creatorId === user.userId;
    const isSuperAdmin = user.role === "SUPER_ADMIN";

    if (!isClubCreator && !isSuperAdmin) {
      return NextResponse.json(
        {
          error:
            "Forbidden - Only the club creator or super admin can delete events",
        },
        { status: 403 }
      );
    }

    // No permitir eliminar eventos que ya comenzaron o terminaron
    if (
      existingEvent.status === "ONGOING" ||
      existingEvent.status === "COMPLETED"
    ) {
      return NextResponse.json(
        {
          error: "Cannot delete events that have already started or completed",
        },
        { status: 409 }
      );
    }

    // Eliminar el evento (esto también eliminará participantes y matches por cascade)
    await prisma.event.delete({
      where: { id: eventId },
    });

    return NextResponse.json({
      message: `Event deleted successfully. ${existingEvent._count.participants} participant registrations were also removed.`,
    });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json({ error: "Invalid event ID" }, { status: 400 });
    }

    console.error("Delete event error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
