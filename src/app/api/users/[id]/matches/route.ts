// src/app/api/users/[id]/matches/route.ts
import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { z } from "zod";
import { MatchType } from "@prisma/client";
import { verifyToken } from "@/lib/auth-middleware";

const listUserMatchesSchema = z.object({
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
  clubMatches: z
    .string()
    .optional()
    .transform((val) => val === "true"),
  informalMatches: z
    .string()
    .optional()
    .transform((val) => val === "true"),
});

interface RouteParams {
  params: { id: string };
}

// GET - Obtener historial de partidos de un usuario
export async function GET(request: NextRequest, context: RouteParams) {
  // Verificar autenticación
  const currentUser = await verifyToken(request);
  if (!currentUser) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const { id: userId } = await context.params;
    const { searchParams } = new URL(request.url);
    const queryParams = Object.fromEntries(searchParams.entries());

    const { page, limit, matchType, completed, clubMatches, informalMatches } =
      listUserMatchesSchema.parse(queryParams);

    // Verificar que el usuario existe
    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: {
        id: true,
        name: true,
        email: true,
        avatar: true,
        city: true,
        duprRating: true,
      },
    });

    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    // Solo el propio usuario o SUPER_ADMIN pueden ver el historial completo
    const canViewAll =
      currentUser.userId === userId || currentUser.role === "SUPER_ADMIN";

    if (!canViewAll) {
      return NextResponse.json(
        { error: "Forbidden - You can only view your own match history" },
        { status: 403 }
      );
    }

    const skip = (page - 1) * limit;

    // Construir filtros base
    const where: any = {
      participants: {
        some: {
          userId: userId,
        },
      },
    };

    // Filtro de tipo de partido
    if (matchType) {
      where.matchType = matchType;
    }

    // Filtro de completado
    if (completed !== undefined) {
      where.completed = completed;
    }

    // Filtro de partidos de club vs informales
    if (clubMatches && !informalMatches) {
      // Solo partidos de club (con courtId)
      where.courtId = { not: null };
    } else if (informalMatches && !clubMatches) {
      // Solo partidos informales (sin courtId)
      where.courtId = null;
    }
    // Si ambos son true o ambos son false, mostrar todos

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
              club: {
                select: {
                  id: true,
                  name: true,
                  city: true,
                },
              },
            },
          },
          event: {
            select: {
              id: true,
              title: true,
              type: true,
              startDateTime: true,
            },
          },
        },
        orderBy: [{ startTime: "desc" }, { createdAt: "desc" }],
      }),
      prisma.match.count({ where }),
    ]);

    const totalPages = Math.ceil(totalCount / limit);

    // Calcular estadísticas del usuario
    const userParticipation = await prisma.matchParticipant.findMany({
      where: { userId },
      include: {
        match: {
          select: {
            id: true,
            matchType: true,
            completed: true,
            courtId: true,
          },
        },
      },
    });

    const stats = {
      totalMatches: userParticipation.length,
      completedMatches: userParticipation.filter((p) => p.match.completed)
        .length,
      wins: userParticipation.filter((p) => p.isWinner && p.match.completed)
        .length,
      losses: userParticipation.filter((p) => !p.isWinner && p.match.completed)
        .length,
      singlesMatches: userParticipation.filter(
        (p) => p.match.matchType === "SINGLES"
      ).length,
      doublesMatches: userParticipation.filter(
        (p) => p.match.matchType === "DOUBLES"
      ).length,
      clubMatches: userParticipation.filter((p) => p.match.courtId !== null)
        .length,
      informalMatches: userParticipation.filter((p) => p.match.courtId === null)
        .length,
    };

    // Calcular win rate
    const completedMatchesCount = stats.completedMatches;
    const winRate =
      completedMatchesCount > 0
        ? ((stats.wins / completedMatchesCount) * 100).toFixed(1)
        : "0.0";

    return NextResponse.json({
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        avatar: user.avatar,
        city: user.city,
        duprRating: user.duprRating,
      },
      matches,
      stats: {
        ...stats,
        winRate: `${winRate}%`,
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

    console.error("List user matches error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
