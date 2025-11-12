// src/app/api/courts/[id]/reservations/[reservationId]/route.ts
import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { z } from "zod";
import { withAuth } from "@/lib/auth-middleware";
import { AuthenticatedUser } from "@/lib/auth-middleware";

interface RouteParams {
  params: {
    id: string;
    reservationId: string;
  };
}

// GET - Obtener detalles de una reserva específica
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

      const { id: courtId, reservationId } = await context.params;

      // Validar IDs
      z.string().min(1, "Court ID is required").parse(courtId);
      z.string().min(1, "Reservation ID is required").parse(reservationId);

      // Buscar la reserva
      const reservation = await prisma.courtReservation.findUnique({
        where: { id: reservationId },
        include: {
          user: {
            select: {
              id: true,
              name: true,
              email: true,
            },
          },
          court: {
            include: {
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
              startDateTime: true,
            },
          },
          match: {
            select: {
              id: true,
              matchType: true,
              startTime: true,
            },
          },
        },
      });

      if (!reservation) {
        return NextResponse.json(
          { error: "Reservation not found" },
          { status: 404 }
        );
      }

      if (reservation.courtId !== courtId) {
        return NextResponse.json(
          { error: "Reservation does not belong to this court" },
          { status: 400 }
        );
      }

      return NextResponse.json({
        reservation: {
          id: reservation.id,
          startTime: reservation.startTime.toISOString(),
          endTime: reservation.endTime.toISOString(),
          createdAt: reservation.createdAt.toISOString(),
          updatedAt: reservation.updatedAt.toISOString(),
          user: reservation.user,
          court: {
            id: reservation.court.id,
            name: reservation.court.name,
            club: reservation.court.club,
          },
          event: reservation.event
            ? {
                id: reservation.event.id,
                title: reservation.event.title,
                startDateTime: reservation.event.startDateTime.toISOString(),
              }
            : null,
          match: reservation.match
            ? {
                id: reservation.match.id,
                matchType: reservation.match.matchType,
                startTime: reservation.match.startTime?.toISOString(),
              }
            : null,
        },
      });
    } catch (error) {
      if (error instanceof z.ZodError) {
        return NextResponse.json(
          { error: "Invalid ID format" },
          { status: 400 }
        );
      }

      console.error("Error getting reservation:", error);
      return NextResponse.json(
        { error: "Internal server error" },
        { status: 500 }
      );
    }
  }
);

// DELETE - Cancelar/eliminar reserva
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

      const { id: courtId, reservationId } = await context.params;

      // Validar IDs
      z.string().min(1, "Court ID is required").parse(courtId);
      z.string().min(1, "Reservation ID is required").parse(reservationId);

      // Buscar la reserva
      const reservation = await prisma.courtReservation.findUnique({
        where: { id: reservationId },
        include: {
          court: {
            include: {
              club: {
                select: {
                  id: true,
                  name: true,
                  creatorId: true,
                },
              },
            },
          },
          event: {
            select: {
              id: true,
              title: true,
            },
          },
          match: {
            select: {
              id: true,
            },
          },
        },
      });

      if (!reservation) {
        return NextResponse.json(
          { error: "Reservation not found" },
          { status: 404 }
        );
      }

      if (reservation.courtId !== courtId) {
        return NextResponse.json(
          { error: "Reservation does not belong to this court" },
          { status: 400 }
        );
      }

      // Verificar permisos:
      // 1. El creador de la reserva
      // 2. El creador del club
      // 3. SUPER_ADMIN
      const isOwner = reservation.userId === user.userId;
      const isClubCreator = reservation.court.club.creatorId === user.userId;
      const isSuperAdmin = user.role === "SUPER_ADMIN";

      if (!isOwner && !isClubCreator && !isSuperAdmin) {
        return NextResponse.json(
          {
            error:
              "Forbidden - Only the reservation owner, club creator, or super admin can cancel this reservation",
          },
          { status: 403 }
        );
      }

      // Verificar si la reserva está asociada a un evento o partido
      if (reservation.eventId || reservation.matchId) {
        // Solo el creador del club o SUPER_ADMIN pueden cancelar estas reservas
        if (!isClubCreator && !isSuperAdmin) {
          return NextResponse.json(
            {
              error:
                "Cannot cancel reservation associated with an event or match. Only club creator or super admin can do this.",
              details: {
                eventId: reservation.eventId,
                matchId: reservation.matchId,
                suggestion:
                  "Contact the club administrator or cancel the event/match first",
              },
            },
            { status: 403 }
          );
        }
      }

      // Verificar que la reserva no sea en el pasado
      // (opcional, pero recomendado para mantener historial)
      const now = new Date();
      if (reservation.endTime < now && !isClubCreator && !isSuperAdmin) {
        return NextResponse.json(
          {
            error: "Cannot cancel past reservations",
            details: {
              suggestion:
                "Only club creator or super admin can delete historical reservations",
            },
          },
          { status: 400 }
        );
      }

      // Eliminar la reserva
      await prisma.courtReservation.delete({
        where: { id: reservationId },
      });

      return NextResponse.json({
        message: "Reservation cancelled successfully",
        cancelledReservation: {
          id: reservation.id,
          startTime: reservation.startTime.toISOString(),
          endTime: reservation.endTime.toISOString(),
          court: {
            id: reservation.court.id,
            name: reservation.court.name,
          },
          club: {
            id: reservation.court.club.id,
            name: reservation.court.club.name,
          },
        },
      });
    } catch (error) {
      if (error instanceof z.ZodError) {
        return NextResponse.json(
          { error: "Invalid ID format" },
          { status: 400 }
        );
      }

      console.error("Error cancelling reservation:", error);
      return NextResponse.json(
        { error: "Internal server error" },
        { status: 500 }
      );
    }
  }
);

// PUT - Actualizar reserva (opcional - para cambiar horarios)
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

      const { id: courtId, reservationId } = await context.params;
      const body = await request.json();

      // Validar IDs
      z.string().min(1, "Court ID is required").parse(courtId);
      z.string().min(1, "Reservation ID is required").parse(reservationId);

      const updateSchema = z.object({
        startTime: z.string().datetime().optional(),
        endTime: z.string().datetime().optional(),
      });

      const validatedData = updateSchema.parse(body);

      // Buscar la reserva
      const reservation = await prisma.courtReservation.findUnique({
        where: { id: reservationId },
        include: {
          court: {
            include: {
              club: {
                select: {
                  creatorId: true,
                },
              },
            },
          },
        },
      });

      if (!reservation) {
        return NextResponse.json(
          { error: "Reservation not found" },
          { status: 404 }
        );
      }

      if (reservation.courtId !== courtId) {
        return NextResponse.json(
          { error: "Reservation does not belong to this court" },
          { status: 400 }
        );
      }

      // Verificar permisos
      const isOwner = reservation.userId === user.userId;
      const isClubCreator = reservation.court.club.creatorId === user.userId;
      const isSuperAdmin = user.role === "SUPER_ADMIN";

      if (!isOwner && !isClubCreator && !isSuperAdmin) {
        return NextResponse.json(
          {
            error:
              "Forbidden - Only the reservation owner, club creator, or super admin can update this reservation",
          },
          { status: 403 }
        );
      }

      // No permitir actualizar reservas asociadas a eventos/partidos
      if (reservation.eventId || reservation.matchId) {
        return NextResponse.json(
          {
            error:
              "Cannot update reservation associated with an event or match",
          },
          { status: 400 }
        );
      }

      const newStartTime = validatedData.startTime
        ? new Date(validatedData.startTime)
        : reservation.startTime;
      const newEndTime = validatedData.endTime
        ? new Date(validatedData.endTime)
        : reservation.endTime;

      // Validar que endTime sea posterior a startTime
      if (newEndTime <= newStartTime) {
        return NextResponse.json(
          { error: "End time must be after start time" },
          { status: 400 }
        );
      }

      // Verificar conflictos (excluyendo la reserva actual)
      const existingReservation = await prisma.courtReservation.findFirst({
        where: {
          courtId,
          id: { not: reservationId },
          OR: [
            {
              AND: [
                { startTime: { lte: newStartTime } },
                { endTime: { gt: newStartTime } },
              ],
            },
            {
              AND: [
                { startTime: { lt: newEndTime } },
                { endTime: { gte: newEndTime } },
              ],
            },
            {
              AND: [
                { startTime: { gte: newStartTime } },
                { endTime: { lte: newEndTime } },
              ],
            },
          ],
        },
      });

      if (existingReservation) {
        return NextResponse.json(
          { error: "New time slot conflicts with another reservation" },
          { status: 409 }
        );
      }

      // Actualizar la reserva
      const updatedReservation = await prisma.courtReservation.update({
        where: { id: reservationId },
        data: {
          startTime: newStartTime,
          endTime: newEndTime,
        },
        include: {
          user: {
            select: {
              id: true,
              name: true,
              email: true,
            },
          },
          court: {
            select: {
              id: true,
              name: true,
            },
          },
        },
      });

      return NextResponse.json({
        message: "Reservation updated successfully",
        reservation: {
          id: updatedReservation.id,
          startTime: updatedReservation.startTime.toISOString(),
          endTime: updatedReservation.endTime.toISOString(),
          updatedAt: updatedReservation.updatedAt.toISOString(),
          user: updatedReservation.user,
          court: updatedReservation.court,
        },
      });
    } catch (error) {
      if (error instanceof z.ZodError) {
        return NextResponse.json(
          { error: "Validation error", details: error },
          { status: 400 }
        );
      }

      console.error("Error updating reservation:", error);
      return NextResponse.json(
        { error: "Internal server error" },
        { status: 500 }
      );
    }
  }
);
