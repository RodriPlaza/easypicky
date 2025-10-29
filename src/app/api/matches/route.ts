// src/app/api/matches/route.ts
import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { z } from "zod";
import { MatchType } from "@prisma/client";
import { withAuth, AuthenticatedUser } from "@/lib/auth-middleware";

// Validación de score: 1-5 sets en formato "21-19" o "21-19,19-21,11-9"
const scoreRegex = /^\d{1,2}-\d{1,2}(,\d{1,2}-\d{1,2}){0,4}$/;

const createMatchSchema = z
  .object({
    matchType: z.nativeEnum(MatchType, {
      error: "Match type must be SINGLES or DOUBLES",
    }),
    startTime: z.string().datetime("Invalid start time format").optional(),
    endTime: z.string().datetime("Invalid end time format").optional(),
    score: z
      .string()
      .regex(
        scoreRegex,
        "Invalid score format. Use: '21-19' or '21-19,19-21' (1-5 sets)"
      )
      .optional(),
    completed: z.boolean().optional(),
    courtId: z.string().cuid("Invalid court ID").optional(),
    eventId: z.string().cuid("Invalid event ID").optional(),
    participants: z
      .array(
        z.object({
          userId: z.string().cuid("Invalid user ID"),
          team: z.number().int().min(1).max(2, "Team must be 1 or 2"),
          isWinner: z.boolean().default(false),
        })
      )
      .min(1, "At least one participant is required")
      .max(4, "Maximum 4 participants allowed"),
  })
  .refine(
    (data) => {
      // Validar número de participantes según tipo de partido
      const participantCount = data.participants.length;
      if (data.matchType === "SINGLES" && participantCount > 2) {
        return false;
      }
      if (data.matchType === "DOUBLES" && participantCount > 4) {
        return false;
      }
      return true;
    },
    {
      message: "SINGLES matches allow max 2 participants, DOUBLES allow max 4",
      path: ["participants"],
    }
  )
  .refine(
    (data) => {
      // Si hay endTime, debe haber startTime y endTime > startTime
      if (data.endTime && !data.startTime) {
        return false;
      }
      if (data.startTime && data.endTime) {
        return new Date(data.endTime) > new Date(data.startTime);
      }
      return true;
    },
    {
      message: "End time must be after start time",
      path: ["endTime"],
    }
  );

const listMatchesSchema = z.object({
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
  userId: z.string().cuid().optional(), // Filtrar por participante
});

// POST - Crear partido informal
export const POST = withAuth(
  async (request: NextRequest, user: AuthenticatedUser) => {
    try {
      const body = await request.json();
      const validatedData = createMatchSchema.parse(body);

      // Verificar que todos los usuarios participantes existen
      const participantIds = validatedData.participants.map((p) => p.userId);
      const users = await prisma.user.findMany({
        where: { id: { in: participantIds } },
        select: { id: true },
      });

      if (users.length !== participantIds.length) {
        return NextResponse.json(
          { error: "One or more participants not found" },
          { status: 404 }
        );
      }

      // Verificar que no hay usuarios duplicados
      const uniqueIds = new Set(participantIds);
      if (uniqueIds.size !== participantIds.length) {
        return NextResponse.json(
          { error: "Duplicate participants are not allowed" },
          { status: 400 }
        );
      }

      // Si hay courtId, verificar que la pista existe y está activa
      if (validatedData.courtId) {
        const court = await prisma.court.findFirst({
          where: {
            id: validatedData.courtId,
            isActive: true,
          },
        });

        if (!court) {
          return NextResponse.json(
            { error: "Court not found or not active" },
            { status: 404 }
          );
        }
      }

      // Si hay eventId, verificar que el evento existe
      if (validatedData.eventId) {
        const event = await prisma.event.findUnique({
          where: { id: validatedData.eventId },
        });

        if (!event) {
          return NextResponse.json(
            { error: "Event not found" },
            { status: 404 }
          );
        }
      }

      // Crear el partido con participantes
      const match = await prisma.match.create({
        data: {
          matchType: validatedData.matchType,
          startTime: validatedData.startTime
            ? new Date(validatedData.startTime)
            : null,
          endTime: validatedData.endTime
            ? new Date(validatedData.endTime)
            : null,
          score: validatedData.score,
          completed: validatedData.completed || false,
          creatorId: user.userId,
          courtId: validatedData.courtId,
          eventId: validatedData.eventId,
          participants: {
            create: validatedData.participants.map((p) => ({
              userId: p.userId,
              team: p.team,
              isWinner: p.isWinner,
            })),
          },
        },
        include: {
          creator: {
            select: {
              id: true,
              name: true,
              email: true,
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
          },
          court: {
            select: {
              id: true,
              name: true,
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
            },
          },
        },
      });

      return NextResponse.json(
        {
          message: "Match created successfully",
          match,
        },
        { status: 201 }
      );
    } catch (error) {
      if (error instanceof z.ZodError) {
        return NextResponse.json(
          { error: "Validation error", details: error },
          { status: 400 }
        );
      }

      console.error("Create match error:", error);
      return NextResponse.json(
        { error: "Internal server error" },
        { status: 500 }
      );
    }
  }
);

// GET - Listar partidos informales del usuario
export const GET = withAuth(
  async (request: NextRequest, user: AuthenticatedUser) => {
    try {
      const { searchParams } = new URL(request.url);
      const queryParams = Object.fromEntries(searchParams.entries());

      const { page, limit, matchType, completed, userId } =
        listMatchesSchema.parse(queryParams);

      const skip = (page - 1) * limit;

      // Construir filtros
      const where: any = {
        // Por defecto, mostrar partidos donde el usuario es creador o participante
        OR: [
          { creatorId: user.userId },
          {
            participants: {
              some: {
                userId: user.userId,
              },
            },
          },
        ],
      };

      // Si se especifica userId (para ver partidos de otro usuario), cambiar filtro
      if (userId) {
        where.OR = [
          { creatorId: userId },
          {
            participants: {
              some: {
                userId: userId,
              },
            },
          },
        ];
      }

      // Filtros adicionales
      if (matchType) {
        where.matchType = matchType;
      }

      if (completed !== undefined) {
        where.completed = completed;
      }

      // Solo partidos informales (sin club)
      where.courtId = null;

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
            event: {
              select: {
                id: true,
                title: true,
                type: true,
              },
            },
          },
          orderBy: [{ startTime: "desc" }, { createdAt: "desc" }],
        }),
        prisma.match.count({ where }),
      ]);

      const totalPages = Math.ceil(totalCount / limit);

      return NextResponse.json({
        matches,
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

      console.error("List matches error:", error);
      return NextResponse.json(
        { error: "Internal server error" },
        { status: 500 }
      );
    }
  }
);
