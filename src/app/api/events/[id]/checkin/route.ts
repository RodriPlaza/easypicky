// src/app/api/events/[id]/checkin/route.ts
import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { z } from "zod";
import { verifyToken } from "@/lib/auth-middleware";

interface RouteParams {
  params: { id: string };
}

const checkinSchema = z.object({
  userId: z.string().cuid("Invalid user ID"), // Para que administradores hagan check-in de otros
});

// POST - Check-in de participante
export async function POST(request: NextRequest, { params }: RouteParams) {
  // Verificar autenticación manualmente
  const user = await verifyToken(request);
  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const { id } = await params;

    // Validar ID del evento
    const eventId = z.string().cuid().parse(id);

    // Verificar que el evento existe
    const event = await prisma.event.findUnique({
      where: { id: eventId },
      include: {
        club: true,
      },
    });

    if (!event) {
      return NextResponse.json({ error: "Event not found" }, { status: 404 });
    }

    // Determinar qué usuario hacer check-in
    let targetUserId = user.userId;

    // Intentar leer el body (puede estar vacío)
    let body: any = {};
    try {
      const text = await request.text();
      if (text) {
        body = JSON.parse(text);
      }
    } catch (e) {
      // Body vacío o inválido, usar valores por defecto
    }

    // Si se especifica userId en el body, verificar permisos para hacer check-in de otros
    if (body.userId) {
      const { userId } = checkinSchema.parse(body);

      // Solo creador del club o SUPER_ADMIN pueden hacer check-in de otros usuarios
      const isClubCreator = event.club.creatorId === user.userId;
      const isSuperAdmin = user.role === "SUPER_ADMIN";

      if (!isClubCreator && !isSuperAdmin) {
        return NextResponse.json(
          {
            error:
              "Forbidden - You don't have permission to check-in other users",
          },
          { status: 403 }
        );
      }

      targetUserId = userId;
    }

    // Verificar que el evento esté en curso o próximo a comenzar (30 minutos antes)
    const now = new Date();
    const thirtyMinutesBefore = new Date(
      event.startDateTime.getTime() - 30 * 60 * 1000
    );

    if (now < thirtyMinutesBefore) {
      return NextResponse.json(
        {
          error:
            "Check-in not available yet - opens 30 minutes before event start",
        },
        { status: 409 }
      );
    }

    // Verificar que el evento no haya terminado
    if (event.status === "COMPLETED" || event.status === "CANCELLED") {
      return NextResponse.json(
        { error: "Cannot check-in to completed or cancelled events" },
        { status: 409 }
      );
    }

    // Si el evento ya terminó (por fecha), no permitir check-in
    if (now > event.endDateTime) {
      return NextResponse.json(
        { error: "Cannot check-in to events that have already ended" },
        { status: 409 }
      );
    }

    // Verificar que el usuario esté registrado en el evento
    const participation = await prisma.eventParticipant.findUnique({
      where: {
        userId_eventId: {
          userId: targetUserId,
          eventId: eventId,
        },
      },
      include: {
        user: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
      },
    });

    if (!participation) {
      return NextResponse.json(
        { error: "User is not registered for this event" },
        { status: 404 }
      );
    }

    // Verificar si ya hizo check-in
    if (participation.checkedIn) {
      return NextResponse.json(
        { error: "User has already checked in to this event" },
        { status: 409 }
      );
    }

    // Realizar check-in
    const updatedParticipation = await prisma.eventParticipant.update({
      where: {
        userId_eventId: {
          userId: targetUserId,
          eventId: eventId,
        },
      },
      data: {
        checkedIn: true,
        checkedInAt: new Date(),
      },
      include: {
        user: {
          select: {
            id: true,
            name: true,
            email: true,
            avatar: true,
          },
        },
        event: {
          select: {
            id: true,
            title: true,
            startDateTime: true,
          },
        },
      },
    });

    // Si es el primer check-in y el evento está programado, cambiar estado a ONGOING
    if (event.status === "SCHEDULED") {
      const checkedInCount = await prisma.eventParticipant.count({
        where: {
          eventId: eventId,
          checkedIn: true,
        },
      });

      if (checkedInCount === 1) {
        await prisma.event.update({
          where: { id: eventId },
          data: { status: "ONGOING" },
        });
      }
    }

    const isOwnCheckIn = targetUserId === user.userId;
    const message = isOwnCheckIn
      ? "Successfully checked in to the event"
      : `Successfully checked in ${participation.user.name} to the event`;

    return NextResponse.json({
      message,
      participation: updatedParticipation,
    });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: "Validation error", details: error },
        { status: 400 }
      );
    }

    console.error("Event check-in error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

// DELETE - Deshacer check-in
export async function DELETE(request: NextRequest, { params }: RouteParams) {
  // Verificar autenticación manualmente
  const user = await verifyToken(request);
  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const { id } = await params;
    const { searchParams } = new URL(request.url);

    // Validar ID del evento
    const eventId = z.string().cuid().parse(id);

    // Obtener userId de query params si se especifica
    const targetUserIdParam = searchParams.get("userId");
    let targetUserId = user.userId;

    if (targetUserIdParam) {
      targetUserId = z.string().cuid().parse(targetUserIdParam);

      // Verificar permisos para deshacer check-in de otros usuarios
      const event = await prisma.event.findUnique({
        where: { id: eventId },
        include: { club: true },
      });

      if (!event) {
        return NextResponse.json({ error: "Event not found" }, { status: 404 });
      }

      const isClubCreator = event.club.creatorId === user.userId;
      const isSuperAdmin = user.role === "SUPER_ADMIN";

      if (!isClubCreator && !isSuperAdmin) {
        return NextResponse.json(
          {
            error:
              "Forbidden - You don't have permission to undo check-in for other users",
          },
          { status: 403 }
        );
      }
    }

    // Verificar que la participación existe y está marcada como check-in
    const participation = await prisma.eventParticipant.findUnique({
      where: {
        userId_eventId: {
          userId: targetUserId,
          eventId: eventId,
        },
      },
      include: {
        user: {
          select: {
            id: true,
            name: true,
          },
        },
        event: {
          select: {
            status: true,
          },
        },
      },
    });

    if (!participation) {
      return NextResponse.json(
        { error: "Participation not found" },
        { status: 404 }
      );
    }

    if (!participation.checkedIn) {
      return NextResponse.json(
        { error: "User has not checked in to this event" },
        { status: 409 }
      );
    }

    // No permitir deshacer check-in si el evento ya terminó
    if (participation.event.status === "COMPLETED") {
      return NextResponse.json(
        { error: "Cannot undo check-in for completed events" },
        { status: 409 }
      );
    }

    // Deshacer check-in
    await prisma.eventParticipant.update({
      where: {
        userId_eventId: {
          userId: targetUserId,
          eventId: eventId,
        },
      },
      data: {
        checkedIn: false,
        checkedInAt: null,
      },
    });

    const isOwnUndo = targetUserId === user.userId;
    const message = isOwnUndo
      ? "Successfully undid check-in"
      : `Successfully undid check-in for ${participation.user.name}`;

    return NextResponse.json({
      message,
    });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: "Validation error", details: error },
        { status: 400 }
      );
    }

    console.error("Undo check-in error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
