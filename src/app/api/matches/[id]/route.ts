// src/app/api/matches/[id]/route.ts
import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { z } from "zod";
import { MatchType } from "@prisma/client";
import { withAuth, AuthenticatedUser } from "@/lib/auth-middleware";

const scoreRegex = /^\d{1,2}-\d{1,2}(,\d{1,2}-\d{1,2}){0,4}$/;

const updateMatchSchema = z
  .object({
    matchType: z.nativeEnum(MatchType).optional(),
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
  params: { id: string };
}

// GET - Obtener partido específico
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
      const { id } = await context.params;

      const match = await prisma.match.findUnique({
        where: { id },
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
            },
          },
        },
      });

      if (!match) {
        return NextResponse.json({ error: "Match not found" }, { status: 404 });
      }

      // Verificar que el usuario tiene acceso (creador o participante)
      const isCreator = match.creatorId === user.userId;
      const isParticipant = match.participants.some(
        (p) => p.userId === user.userId
      );

      if (!isCreator && !isParticipant && user.role !== "SUPER_ADMIN") {
        return NextResponse.json(
          { error: "Forbidden - You don't have access to this match" },
          { status: 403 }
        );
      }

      return NextResponse.json({ match });
    } catch (error) {
      console.error("Get match error:", error);
      return NextResponse.json(
        { error: "Internal server error" },
        { status: 500 }
      );
    }
  }
);

// PUT - Actualizar partido
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
      const { id } = await context.params;
      const body = await request.json();

      const validatedData = updateMatchSchema.parse(body);

      // Verificar que el partido existe
      const existingMatch = await prisma.match.findUnique({
        where: { id },
        include: {
          participants: true,
        },
      });

      if (!existingMatch) {
        return NextResponse.json({ error: "Match not found" }, { status: 404 });
      }

      // Solo el creador puede actualizar
      if (
        existingMatch.creatorId !== user.userId &&
        user.role !== "SUPER_ADMIN"
      ) {
        return NextResponse.json(
          { error: "Forbidden - Only the match creator can update this match" },
          { status: 403 }
        );
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
      }

      // Preparar datos de actualización
      const updateData: any = {};

      if (validatedData.matchType)
        updateData.matchType = validatedData.matchType;
      if (validatedData.startTime)
        updateData.startTime = new Date(validatedData.startTime);
      if (validatedData.endTime)
        updateData.endTime = new Date(validatedData.endTime);
      if (validatedData.score !== undefined)
        updateData.score = validatedData.score;
      if (validatedData.completed !== undefined)
        updateData.completed = validatedData.completed;

      // Si se actualizan participantes, primero eliminar los existentes
      if (validatedData.participants) {
        await prisma.matchParticipant.deleteMany({
          where: { matchId: id },
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
        where: { id },
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
        message: "Match updated successfully",
        match: updatedMatch,
      });
    } catch (error) {
      if (error instanceof z.ZodError) {
        return NextResponse.json(
          { error: "Validation error", details: error },
          { status: 400 }
        );
      }

      console.error("Update match error:", error);
      return NextResponse.json(
        { error: "Internal server error" },
        { status: 500 }
      );
    }
  }
);

// DELETE - Eliminar partido
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
      const { id } = await context.params;

      // Verificar que el partido existe
      const match = await prisma.match.findUnique({
        where: { id },
        select: {
          id: true,
          creatorId: true,
          matchType: true,
          score: true,
          completed: true,
        },
      });

      if (!match) {
        return NextResponse.json({ error: "Match not found" }, { status: 404 });
      }

      // Solo el creador o SUPER_ADMIN pueden eliminar
      if (match.creatorId !== user.userId && user.role !== "SUPER_ADMIN") {
        return NextResponse.json(
          { error: "Forbidden - Only the match creator can delete this match" },
          { status: 403 }
        );
      }

      // Eliminar el partido (los participantes se eliminan en cascada)
      await prisma.match.delete({
        where: { id },
      });

      return NextResponse.json({
        message: "Match deleted successfully",
        deletedMatch: {
          id: match.id,
          matchType: match.matchType,
          completed: match.completed,
        },
      });
    } catch (error) {
      console.error("Delete match error:", error);
      return NextResponse.json(
        { error: "Internal server error" },
        { status: 500 }
      );
    }
  }
);
