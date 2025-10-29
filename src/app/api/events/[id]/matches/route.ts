// src/app/api/events/[id]/matches/route.ts
import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { z } from "zod";
import { MatchType } from "@prisma/client";
import { verifyToken } from "@/lib/auth-middleware";

const listEventMatchesSchema = z.object({
  page: z
    .string()
    .optional()
    .transform((val) => (val ? parseInt(val) : 1)),
  limit: z
    .string()
    .optional()
    .transform((val) => (val ? parseInt(val) : 20)),
  matchType: z.nativeEnum(MatchType).optional(),
  completed: z
    .string()
    .optional()
    .transform((val) =>
      val === "true" ? true : val === "false" ? false : undefined
    ),
});

interface RouteParams {
  params: { id: string };
}

// GET - Listar partidos de un evento
export async function GET(request: NextRequest, context: RouteParams) {
  try {
    const { id: eventId } = await context.params;
    const { searchParams } = new URL(request.url);
    const queryParams = Object.fromEntries(searchParams.entries());

    const { page, limit, matchType, completed } =
      listEventMatchesSchema.parse(queryParams);

    // Verificar que el evento existe
    const event = await prisma.event.findUnique({
      where: { id: eventId },
      include: {
        club: {
          select: {
            id: true,
            name: true,
            city: true,
            creatorId: true,
          },
        },
      },
    });

    if (!event) {
      return NextResponse.json({ error: "Event not found" }, { status: 404 });
    }

    // Verificar permisos según visibilidad del evento
    if (event.visibility === "PRIVATE") {
      const user = await verifyToken(request);

      if (!user) {
        return NextResponse.json(
          { error: "Unauthorized - Private event" },
          { status: 401 }
        );
      }

      // Verificar si es creador del club, miembro activo, o SUPER_ADMIN
      const isClubCreator = event.club.creatorId === user.userId;
      const isSuperAdmin = user.role === "SUPER_ADMIN";

      let isMember = false;
      if (!isClubCreator && !isSuperAdmin) {
        const membership = await prisma.clubMembership.findFirst({
          where: {
            clubId: event.clubId,
            userId: user.userId,
            status: "ACTIVE",
          },
        });
        isMember = !!membership;
      }

      if (!isClubCreator && !isMember && !isSuperAdmin) {
        return NextResponse.json(
          { error: "Forbidden - You don't have access to this private event" },
          { status: 403 }
        );
      }
    }

    const skip = (page - 1) * limit;

    // Construir filtros
    const where: any = {
      eventId: eventId,
    };

    if (matchType) {
      where.matchType = matchType;
    }

    if (completed !== undefined) {
      where.completed = completed;
    }

    // Obtener partidos con paginación
    const [matches, totalCount] = await Promise.all([
      prisma.match.findMany({
        where,
        skip,
        take: limit,
        include: {
          creator: {
            select: {
              id: true,
              name: true,
              avatar: true,
            },
          },
          participants: {
            include: {
              user: {
                select: {
                  id: true,
                  name: true,
                  avatar: true,
                  duprRating: true,
                },
              },
            },
            orderBy: [{ team: "asc" }, { userId: "asc" }],
          },
          court: {
            select: {
              id: true,
              name: true,
              description: true,
            },
          },
        },
        orderBy: [{ startTime: "desc" }, { createdAt: "desc" }],
      }),
      prisma.match.count({ where }),
    ]);

    const totalPages = Math.ceil(totalCount / limit);

    // Calcular estadísticas
    const stats = {
      total: totalCount,
      completed: await prisma.match.count({
        where: { eventId, completed: true },
      }),
      inProgress: await prisma.match.count({
        where: { eventId, completed: false },
      }),
      singles: await prisma.match.count({
        where: { eventId, matchType: "SINGLES" },
      }),
      doubles: await prisma.match.count({
        where: { eventId, matchType: "DOUBLES" },
      }),
    };

    return NextResponse.json({
      event: {
        id: event.id,
        title: event.title,
        type: event.type,
        startDateTime: event.startDateTime,
        endDateTime: event.endDateTime,
        club: {
          id: event.club.id,
          name: event.club.name,
          city: event.club.city,
        },
      },
      matches,
      stats,
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

    console.error("List event matches error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
