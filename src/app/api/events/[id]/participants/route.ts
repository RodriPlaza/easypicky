// src/app/api/events/[id]/participants/route.ts
import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { z } from "zod";
import { verifyToken } from "@/lib/auth-middleware";

interface RouteParams {
  params: { id: string };
}

const listParticipantsSchema = z.object({
  page: z
    .string()
    .optional()
    .transform((val) => (val ? parseInt(val) : 1)),
  limit: z
    .string()
    .optional()
    .transform((val) => (val ? parseInt(val) : 20)),
  checkedIn: z
    .string()
    .optional()
    .transform((val) => val === "true"),
});

// GET - Obtener participantes del evento
export async function GET(request: NextRequest, { params }: RouteParams) {
  // Verificar autenticación manualmente
  const user = await verifyToken(request);
  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const { id } = await params;
    const { searchParams } = new URL(request.url);
    const queryParams = Object.fromEntries(searchParams.entries());

    // Validar ID y parámetros
    const eventId = z.string().cuid().parse(id);
    const { page, limit, checkedIn } =
      listParticipantsSchema.parse(queryParams);

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

    // Verificar permisos: creador del club, miembro activo o SUPER_ADMIN
    const isClubCreator = event.club.creatorId === user.userId;
    const isSuperAdmin = user.role === "SUPER_ADMIN";

    const membership = await prisma.clubMembership.findFirst({
      where: {
        userId: user.userId,
        clubId: event.clubId,
        status: "ACTIVE",
      },
    });

    if (!isClubCreator && !isSuperAdmin && !membership) {
      return NextResponse.json(
        {
          error:
            "Forbidden - You don't have permission to view event participants",
        },
        { status: 403 }
      );
    }

    const skip = (page - 1) * limit;

    // Construir filtros
    const where: any = {
      eventId: eventId,
    };

    if (checkedIn !== undefined) {
      where.checkedIn = checkedIn;
    }

    // Obtener participantes con paginación
    const [participants, totalCount] = await Promise.all([
      prisma.eventParticipant.findMany({
        where,
        skip,
        take: limit,
        include: {
          user: {
            select: {
              id: true,
              name: true,
              email: true,
              phone: true,
              avatar: true,
              city: true,
              duprRating: true,
            },
          },
        },
        orderBy: [{ checkedIn: "desc" }, { registeredAt: "asc" }],
      }),
      prisma.eventParticipant.count({ where }),
    ]);

    const totalPages = Math.ceil(totalCount / limit);

    // Estadísticas del evento
    const stats = await prisma.eventParticipant.groupBy({
      by: ["checkedIn"],
      where: { eventId: eventId },
      _count: {
        id: true,
      },
    });

    const checkedInCount =
      stats.find((s) => s.checkedIn === true)?._count.id || 0;
    const notCheckedInCount =
      stats.find((s) => s.checkedIn === false)?._count.id || 0;

    return NextResponse.json({
      event: {
        id: event.id,
        title: event.title,
        startDateTime: event.startDateTime,
        endDateTime: event.endDateTime,
        maxParticipants: event.maxParticipants,
        status: event.status,
      },
      participants,
      stats: {
        total: totalCount,
        checkedIn: checkedInCount,
        notCheckedIn: notCheckedInCount,
      },
      pagination: {
        page,
        limit,
        totalCount,
        totalPages,
        hasNextPage: page < totalPages,
        hasPreviousPage: page > 1,
      },
    });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: "Validation error", details: error },
        { status: 400 }
      );
    }

    console.error("Get event participants error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
