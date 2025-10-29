// src/app/api/clubs/[id]/matches/[matchId]/route.ts
import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { z } from "zod";
import { MatchType } from "@prisma/client";
import { withAuth, AuthenticatedUser } from "@/lib/auth-middleware";

const scoreRegex = /^\d{1,2}-\d{1,2}(,\d{1,2}-\d{1,2}){0,4}$/;

const updateClubMatchSchema = z
  .object({
    matchType: z.nativeEnum(MatchType).optional(),
    courtId: z.string().cuid("Invalid court ID").optional(),
    startTime: z.string().datetime().optional(),
    endTime: z.string().datetime().optional(),
    score: z
      .string()
      .regex(
        scoreRegex,
        "Invalid score format. Use: '21-19' or '21-19,19-21' (1-5 sets)"
      )
      .optional(),
    completed: z.boolean().optional(),
    eventId: z.string().cuid("Invalid event ID").optional().nullable(),
    participants: z
      .array(
        z.object({
          userId: z.string().cuid(),
          team: z.number().int().min(1).max(2),
          isWinner: z.boolean(),
        })
      )
      .optional(),
  })
  .refine(
    (data) => {
      if (data.endTime && data.startTime) {
        return new Date(data.endTime) > new Date(data.startTime);
      }
      return true;
    },
    {
      message: "End time must be after start time",
      path: ["endTime"],
    }
  );

interface RouteParams {
  params: { id: string; matchId: string };
}

// GET - Obtener partido específico del club
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
      const { id: clubId, matchId } = await context.params;

      // Verificar que el club existe
      const club = await prisma.club.findUnique({
        where: { id: clubId },
      });

      if (!club) {
        return NextResponse.json({ error: "Club not found" }, { status: 404 });
      }

      // Buscar el partido asegurando que pertenece al club
      const match = await prisma.match.findFirst({
        where: {
          id: matchId,
          court: {
            clubId: clubId,
          },
        },
        include: {
          creator: {
            select: {
              id: true,
              name: true,
              email: true,
              avatar: true,
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
              endDateTime: true,
            },
          },
        },
      });

      if (!match) {
        return NextResponse.json(
          { error: "Match not found in this club" },
          { status: 404 }
        );
      }

      // Verificar permisos: creador del club, participante, o SUPER_ADMIN
      const isClubCreator = club.creatorId === user.userId;
      const isParticipant = match.participants.some(
        (p) => p.userId === user.userId
      );
      const isSuperAdmin = user.role === "SUPER_ADMIN";

      if (!isClubCreator && !isParticipant && !isSuperAdmin) {
        // Verificar si es miembro del club
        const membership = await prisma.clubMembership.findFirst({
          where: {
            clubId: clubId,
            userId: user.userId,
            status: "ACTIVE",
          },
        });

        if (!membership) {
          return NextResponse.json(
            { error: "Forbidden - You don't have access to this match" },
            { status: 403 }
          );
        }
      }

      return NextResponse.json({ match });
    } catch (error) {
      console.error("Get club match error:", error);
      return NextResponse.json(
        { error: "Internal server error" },
        { status: 500 }
      );
    }
  }
);

// PUT - Actualizar partido del club
export const PUT = withAuth(
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
      const { id: clubId, matchId } = await context.params;
      const body = await request.json();

      const validatedData = updateClubMatchSchema.parse(body);

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
              "Forbidden - Only club creator or super admin can update club matches",
          },
          { status: 403 }
        );
      }

      // Verificar que el partido existe y pertenece al club
      const existingMatch = await prisma.match.findFirst({
        where: {
          id: matchId,
          court: {
            clubId: clubId,
          },
        },
        include: {
          participants: true,
          court: true,
        },
      });

      if (!existingMatch) {
        return NextResponse.json(
          { error: "Match not found in this club" },
          { status: 404 }
        );
      }

      // Si se actualiza la pista, verificar que pertenece al club y está activa
      if (
        validatedData.courtId &&
        validatedData.courtId !== existingMatch.courtId
      ) {
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
      }

      // Si se actualiza el evento, verificar que pertenece al club
      if (validatedData.eventId !== undefined) {
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
      }

      // Si se actualizan participantes, validar
      if (validatedData.participants) {
        const participantCount = validatedData.participants.length;
        const matchType = validatedData.matchType || existingMatch.matchType;

        if (matchType === "SINGLES" && participantCount > 2) {
          return NextResponse.json(
            { error: "SINGLES matches allow maximum 2 participants" },
            { status: 400 }
          );
        }

        if (matchType === "DOUBLES" && participantCount > 4) {
          return NextResponse.json(
            { error: "DOUBLES matches allow maximum 4 participants" },
            { status: 400 }
          );
        }

        // Verificar que todos los usuarios existen
        const participantIds = validatedData.participants.map((p) => p.userId);
        const users = await prisma.user.findMany({
          where: { id: { in: participantIds } },
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

        // Verificar que todos son miembros activos del club
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
      }

      // Preparar datos de actualización
      const updateData: any = {};

      if (validatedData.matchType)
        updateData.matchType = validatedData.matchType;
      if (validatedData.courtId) updateData.courtId = validatedData.courtId;
      if (validatedData.startTime)
        updateData.startTime = new Date(validatedData.startTime);
      if (validatedData.endTime)
        updateData.endTime = new Date(validatedData.endTime);
      if (validatedData.score !== undefined)
        updateData.score = validatedData.score;
      if (validatedData.completed !== undefined)
        updateData.completed = validatedData.completed;
      if (validatedData.eventId !== undefined) {
        updateData.eventId = validatedData.eventId;
      }

      // Si se actualizan participantes, primero eliminar los existentes
      if (validatedData.participants) {
        await prisma.matchParticipant.deleteMany({
          where: { matchId },
        });

        updateData.participants = {
          create: validatedData.participants.map((p) => ({
            userId: p.userId,
            team: p.team,
            isWinner: p.isWinner,
          })),
        };
      }

      // Actualizar el partido
      const updatedMatch = await prisma.match.update({
        where: { id: matchId },
        data: updateData,
        include: {
          creator: {
            select: {
              id: true,
              name: true,
              email: true,
              avatar: true,
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
              club: {
                select: {
                  id: true,
                  name: true,
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

      return NextResponse.json({
        message: "Club match updated successfully",
        match: updatedMatch,
      });
    } catch (error) {
      if (error instanceof z.ZodError) {
        return NextResponse.json(
          { error: "Validation error", details: error },
          { status: 400 }
        );
      }

      console.error("Update club match error:", error);
      return NextResponse.json(
        { error: "Internal server error" },
        { status: 500 }
      );
    }
  }
);

// DELETE - Eliminar partido del club
export const DELETE = withAuth(
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
      const { id: clubId, matchId } = await context.params;

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
              "Forbidden - Only club creator or super admin can delete club matches",
          },
          { status: 403 }
        );
      }

      // Verificar que el partido existe y pertenece al club
      const match = await prisma.match.findFirst({
        where: {
          id: matchId,
          court: {
            clubId: clubId,
          },
        },
        select: {
          id: true,
          matchType: true,
          score: true,
          completed: true,
          court: {
            select: {
              name: true,
            },
          },
        },
      });

      if (!match) {
        return NextResponse.json(
          { error: "Match not found in this club" },
          { status: 404 }
        );
      }

      // Eliminar el partido (los participantes se eliminan en cascada)
      await prisma.match.delete({
        where: { id: matchId },
      });

      return NextResponse.json({
        message: "Club match deleted successfully",
        deletedMatch: {
          id: match.id,
          matchType: match.matchType,
          completed: match.completed,
          court: match.court?.name,
        },
      });
    } catch (error) {
      console.error("Delete club match error:", error);
      return NextResponse.json(
        { error: "Internal server error" },
        { status: 500 }
      );
    }
  }
);
