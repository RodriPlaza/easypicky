// src/app/api/events/[id]/join/route.ts
import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { z } from "zod";
import { verifyToken } from "@/lib/auth-middleware";

interface RouteParams {
  params: { id: string };
}

// POST - Unirse a evento
export async function POST(request: NextRequest, { params }: RouteParams) {
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
    const event = await prisma.event.findUnique({
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

    if (!event) {
      return NextResponse.json({ error: "Event not found" }, { status: 404 });
    }

    // Verificar que el evento no haya terminado o sido cancelado
    if (event.status === "COMPLETED" || event.status === "CANCELLED") {
      return NextResponse.json(
        { error: "Cannot join completed or cancelled events" },
        { status: 409 }
      );
    }

    // Verificar que el evento no haya comenzado
    if (event.status === "ONGOING") {
      return NextResponse.json(
        { error: "Cannot join events that have already started" },
        { status: 409 }
      );
    }

    // Verificar que el usuario no esté ya registrado
    const existingParticipation = await prisma.eventParticipant.findUnique({
      where: {
        userId_eventId: {
          userId: user.userId,
          eventId: eventId,
        },
      },
    });

    if (existingParticipation) {
      return NextResponse.json(
        { error: "You are already registered for this event" },
        { status: 409 }
      );
    }

    // Verificar permisos según la visibilidad del evento
    if (event.visibility === "MEMBERS_ONLY" || event.visibility === "PRIVATE") {
      const membership = await prisma.clubMembership.findFirst({
        where: {
          userId: user.userId,
          clubId: event.clubId,
          status: "ACTIVE",
        },
      });

      const isClubCreator = event.club.creatorId === user.userId;
      const isSuperAdmin = user.role === "SUPER_ADMIN";

      if (!membership && !isClubCreator && !isSuperAdmin) {
        return NextResponse.json(
          {
            error:
              "Forbidden - You must be a member of this club to join this event",
          },
          { status: 403 }
        );
      }
    }

    // Verificar límite de participantes
    if (
      event.maxParticipants &&
      event._count.participants >= event.maxParticipants
    ) {
      return NextResponse.json(
        { error: "Event is full - maximum participants reached" },
        { status: 409 }
      );
    }

    // Verificar que la fecha del evento no haya pasado
    if (event.startDateTime <= new Date()) {
      return NextResponse.json(
        { error: "Cannot join events that have already started" },
        { status: 409 }
      );
    }

    // TODO: En el futuro, aquí se manejará el pago si el evento tiene precio
    if (event.price && event.price > 0) {
      // Por ahora retornamos error, en futuras versiones integrar con Stripe
      return NextResponse.json(
        { error: "Paid events are not yet supported" },
        { status: 501 }
      );
    }

    // Crear la participación
    const participation = await prisma.eventParticipant.create({
      data: {
        userId: user.userId,
        eventId: eventId,
      },
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
        event: {
          select: {
            id: true,
            title: true,
            startDateTime: true,
            endDateTime: true,
            type: true,
          },
        },
      },
    });

    return NextResponse.json(
      {
        message: "Successfully joined the event",
        participation,
      },
      { status: 201 }
    );
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json({ error: "Invalid event ID" }, { status: 400 });
    }

    console.error("Join event error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

// DELETE - Salir de evento
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

    // Verificar que la participación existe
    const participation = await prisma.eventParticipant.findUnique({
      where: {
        userId_eventId: {
          userId: user.userId,
          eventId: eventId,
        },
      },
      include: {
        event: true,
      },
    });

    if (!participation) {
      return NextResponse.json(
        { error: "You are not registered for this event" },
        { status: 404 }
      );
    }

    // Verificar que el evento no haya comenzado
    if (participation.event.status === "ONGOING") {
      return NextResponse.json(
        { error: "Cannot leave events that have already started" },
        { status: 409 }
      );
    }

    // Verificar que el evento no haya terminado
    if (participation.event.status === "COMPLETED") {
      return NextResponse.json(
        { error: "Cannot leave completed events" },
        { status: 409 }
      );
    }

    // Verificar límite de tiempo para salir (ej: no se puede salir 2 horas antes)
    const hoursBeforeEvent = 2;
    const timeLimit = new Date(
      participation.event.startDateTime.getTime() -
        hoursBeforeEvent * 60 * 60 * 1000
    );

    if (new Date() > timeLimit) {
      return NextResponse.json(
        {
          error: `Cannot leave event less than ${hoursBeforeEvent} hours before start time`,
        },
        { status: 409 }
      );
    }

    // TODO: Manejar reembolsos si el evento tenía precio

    // Eliminar la participación
    await prisma.eventParticipant.delete({
      where: {
        userId_eventId: {
          userId: user.userId,
          eventId: eventId,
        },
      },
    });

    return NextResponse.json({
      message: "Successfully left the event",
    });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json({ error: "Invalid event ID" }, { status: 400 });
    }

    console.error("Leave event error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
