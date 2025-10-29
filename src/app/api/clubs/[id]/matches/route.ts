// src/app/api/clubs/[id]/matches/route.ts
import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { z } from "zod";
import { MatchType } from "@prisma/client";
import { withAuth, AuthenticatedUser } from "@/lib/auth-middleware";

const scoreRegex = /^\d{1,2}-\d{1,2}(,\d{1,2}-\d{1,2}){0,4}$/;

const createClubMatchSchema = z
  .object({
    matchType: z.nativeEnum(MatchType, {
      error: "Match type must be SINGLES or DOUBLES",
    }),
    courtId: z.string().cuid("Invalid court ID"), // Obligatorio para partidos de club
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

const listClubMatchesSchema = z.object({
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
  courtId: z.string().cuid().optional(),
  eventId: z.string().cuid().optional(),
});

interface RouteParams {
  params: { id: string };
}

// POST - Crear partido de club
export const POST = withAuth(
  async (
    request: NextRequest,
    user: AuthenticatedUser,
    context?: RouteParams
  ) => {
    try {
      if (!context) {
        return NextResponse.json(
          { error: "Invalid request context" },
          { status: 400 }
        );
      }

      const { id: clubId } = await context.params;
      const body = await request.json();

      const validatedData = createClubMatchSchema.parse(body);

      // Verificar que el club existe
      const club = await prisma.club.findUnique({
        where: { id: clubId },
      });

      if (!club) {
        return NextResponse.json({ error: "Club not found" }, { status: 404 });
      }

      // Verificar permisos: creador del club o SUPER_ADMIN
      const isClubCreator = club.creatorId === user.userId;
      const isSuperAdmin = user.role === "SUPER_ADMIN";

      if (!isClubCreator && !isSuperAdmin) {
        return NextResponse.json(
          {
            error:
              "Forbidden - Only club creator or super admin can create club matches",
          },
          { status: 403 }
        );
      }

      // Verificar que la pista existe, está activa y pertenece al club
      const court = await prisma.court.findFirst({
        where: {
          id: validatedData.courtId,
          clubId: clubId,
          isActive: true,
        },
      });

      if (!court) {
        return NextResponse.json(
          {
            error:
              "Court not found, not active, or doesn't belong to this club",
          },
          { status: 404 }
        );
      }

      // Si hay eventId, verificar que el evento existe y pertenece al club
      if (validatedData.eventId) {
        const event = await prisma.event.findFirst({
          where: {
            id: validatedData.eventId,
            clubId: clubId,
          },
        });

        if (!event) {
          return NextResponse.json(
            { error: "Event not found or doesn't belong to this club" },
            { status: 404 }
          );
        }
      }

      // Verificar que todos los participantes existen
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

      // Verificar duplicados
      const uniqueIds = new Set(participantIds);
      if (uniqueIds.size !== participantIds.length) {
        return NextResponse.json(
          { error: "Duplicate participants are not allowed" },
          { status: 400 }
        );
      }

      // Verificar que todos los participantes son miembros activos del club
      const memberships = await prisma.clubMembership.findMany({
        where: {
          clubId: clubId,
          userId: { in: participantIds },
          status: "ACTIVE",
        },
      });

      if (memberships.length !== participantIds.length) {
        const nonMembers = participantIds.filter(
          (id) => !memberships.find((m) => m.userId === id)
        );

        return NextResponse.json(
          {
            error: "All participants must be active members of the club",
            details: {
              nonMemberIds: nonMembers,
            },
          },
          { status: 403 }
        );
      }

      // Crear el partido de club
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
            orderBy: [{ team: "asc" }, { userId: "asc" }],
          },
          court: {
            select: {
              id: true,
              name: true,
              description: true,
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
      });

      return NextResponse.json(
        {
          message: "Club match created successfully",
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

      console.error("Create club match error:", error);
      return NextResponse.json(
        { error: "Internal server error" },
        { status: 500 }
      );
    }
  }
);

// GET - Listar partidos del club
export const GET = withAuth(
  async (
    request: NextRequest,
    user: AuthenticatedUser,
    context?: RouteParams
  ) => {
    try {
      if (!context) {
        return NextResponse.json(
          { error: "Invalid request context" },
          { status: 400 }
        );
      }

      const { id: clubId } = await context.params;
      const { searchParams } = new URL(request.url);
      const queryParams = Object.fromEntries(searchParams.entries());

      const { page, limit, matchType, completed, courtId, eventId } =
        listClubMatchesSchema.parse(queryParams);

      // Verificar que el club existe
      const club = await prisma.club.findUnique({
        where: { id: clubId },
      });

      if (!club) {
        return NextResponse.json({ error: "Club not found" }, { status: 404 });
      }

      // Verificar permisos: creador del club, miembro activo, o SUPER_ADMIN
      const isClubCreator = club.creatorId === user.userId;
      const isSuperAdmin = user.role === "SUPER_ADMIN";

      let isMember = false;
      if (!isClubCreator && !isSuperAdmin) {
        const membership = await prisma.clubMembership.findFirst({
          where: {
            clubId: clubId,
            userId: user.userId,
            status: "ACTIVE",
          },
        });
        isMember = !!membership;
      }

      if (!isClubCreator && !isMember && !isSuperAdmin) {
        return NextResponse.json(
          {
            error: "Forbidden - You must be a club member to view club matches",
          },
          { status: 403 }
        );
      }

      const skip = (page - 1) * limit;

      // Construir filtros
      const where: any = {
        court: {
          clubId: clubId,
        },
      };

      if (matchType) {
        where.matchType = matchType;
      }

      if (completed !== undefined) {
        where.completed = completed;
      }

      if (courtId) {
        where.courtId = courtId;
      }

      if (eventId) {
        where.eventId = eventId;
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

      return NextResponse.json({
        club: {
          id: club.id,
          name: club.name,
          city: club.city,
        },
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

      console.error("List club matches error:", error);
      return NextResponse.json(
        { error: "Internal server error" },
        { status: 500 }
      );
    }
  }
);
