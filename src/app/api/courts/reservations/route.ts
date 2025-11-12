// src/app/api/courts/[id]/reservations/route.ts
import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { z } from "zod";
import { withAuth } from "@/lib/auth-middleware";
import { AuthenticatedUser } from "@/lib/auth-middleware";

const createReservationSchema = z.object({
  startTime: z.string().datetime("Invalid datetime format (ISO 8601)"),
  endTime: z.string().datetime("Invalid datetime format (ISO 8601)"),
});

interface RouteParams {
  params: { id: string };
}

// POST - Crear reserva de pista
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

      const { id: courtId } = await context.params;
      const body = await request.json();

      // Validar court ID
      z.string().min(1, "Court ID is required").parse(courtId);

      // Validar datos de entrada
      const validatedData = createReservationSchema.parse(body);

      const startTime = new Date(validatedData.startTime);
      const endTime = new Date(validatedData.endTime);

      // Validar que endTime sea posterior a startTime
      if (endTime <= startTime) {
        return NextResponse.json(
          { error: "End time must be after start time" },
          { status: 400 }
        );
      }

      // Verificar que la pista existe y está activa
      const court = await prisma.court.findUnique({
        where: { id: courtId },
        include: {
          club: {
            select: {
              id: true,
              name: true,
              creatorId: true,
            },
          },
        },
      });

      if (!court) {
        return NextResponse.json({ error: "Court not found" }, { status: 404 });
      }

      if (!court.isActive) {
        return NextResponse.json(
          { error: "Court is not active" },
          { status: 400 }
        );
      }

      // Verificar que el usuario es miembro del club o es el creador
      const isClubCreator = court.club.creatorId === user.userId;
      const isSuperAdmin = user.role === "SUPER_ADMIN";

      if (!isClubCreator && !isSuperAdmin) {
        // Verificar membresía activa
        const membership = await prisma.clubMembership.findUnique({
          where: {
            userId_clubId: {
              userId: user.userId,
              clubId: court.club.id,
            },
          },
        });

        if (!membership || membership.status !== "ACTIVE") {
          return NextResponse.json(
            {
              error:
                "Forbidden - You must be an active member of this club to make reservations",
            },
            { status: 403 }
          );
        }
      }

      // Validar que la reserva no sea en el pasado
      if (startTime < new Date()) {
        return NextResponse.json(
          { error: "Cannot create reservations in the past" },
          { status: 400 }
        );
      }

      // Validar que la reserva esté dentro del horario de la pista
      const reservationDate = new Date(startTime);
      const [openHour, openMin] = court.openTime.split(":").map(Number);
      const [closeHour, closeMin] = court.closeTime.split(":").map(Number);

      const openTime = new Date(reservationDate);
      openTime.setHours(openHour, openMin, 0, 0);

      const closeTime = new Date(reservationDate);
      closeTime.setHours(closeHour, closeMin, 0, 0);

      if (startTime < openTime || endTime > closeTime) {
        return NextResponse.json(
          {
            error: `Reservations must be within court hours (${court.openTime} - ${court.closeTime})`,
          },
          { status: 400 }
        );
      }

      // Validar duración de la reserva (debe ser múltiplo del slotDuration)
      const durationMinutes = (endTime.getTime() - startTime.getTime()) / 60000;
      if (durationMinutes % court.slotDuration !== 0) {
        return NextResponse.json(
          {
            error: `Reservation duration must be a multiple of ${court.slotDuration} minutes`,
          },
          { status: 400 }
        );
      }

      // Verificar que no haya conflictos de horario
      const existingReservation = await prisma.courtReservation.findFirst({
        where: {
          courtId,
          OR: [
            // Nueva reserva empieza durante una existente
            {
              AND: [
                { startTime: { lte: startTime } },
                { endTime: { gt: startTime } },
              ],
            },
            // Nueva reserva termina durante una existente
            {
              AND: [
                { startTime: { lt: endTime } },
                { endTime: { gte: endTime } },
              ],
            },
            // Nueva reserva envuelve completamente una existente
            {
              AND: [
                { startTime: { gte: startTime } },
                { endTime: { lte: endTime } },
              ],
            },
          ],
        },
        include: {
          user: {
            select: {
              name: true,
            },
          },
        },
      });

      if (existingReservation) {
        return NextResponse.json(
          {
            error: "This time slot is already reserved",
            details: {
              reservedBy: existingReservation.user.name,
              reservedFrom: existingReservation.startTime.toISOString(),
              reservedTo: existingReservation.endTime.toISOString(),
            },
          },
          { status: 409 }
        );
      }

      // Crear la reserva
      const reservation = await prisma.courtReservation.create({
        data: {
          courtId,
          userId: user.userId,
          startTime,
          endTime,
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
              club: {
                select: {
                  id: true,
                  name: true,
                },
              },
            },
          },
        },
      });

      return NextResponse.json(
        {
          message: "Reservation created successfully",
          reservation: {
            id: reservation.id,
            startTime: reservation.startTime.toISOString(),
            endTime: reservation.endTime.toISOString(),
            createdAt: reservation.createdAt.toISOString(),
            user: reservation.user,
            court: reservation.court,
          },
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

      console.error("Error creating reservation:", error);
      return NextResponse.json(
        { error: "Internal server error" },
        { status: 500 }
      );
    }
  }
);

// GET - Listar reservas de una pista
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

      const { id: courtId } = await context.params;
      const { searchParams } = new URL(request.url);

      // Validar court ID
      z.string().min(1, "Court ID is required").parse(courtId);

      // Verificar que la pista existe
      const court = await prisma.court.findUnique({
        where: { id: courtId },
        include: {
          club: {
            select: {
              id: true,
              name: true,
            },
          },
        },
      });

      if (!court) {
        return NextResponse.json({ error: "Court not found" }, { status: 404 });
      }

      // Construir filtros
      const where: any = {
        courtId,
      };

      // Filtrar por fecha si se proporciona
      const dateParam = searchParams.get("date");
      if (dateParam) {
        const date = new Date(dateParam);
        const startOfDay = new Date(date);
        startOfDay.setHours(0, 0, 0, 0);
        const endOfDay = new Date(date);
        endOfDay.setHours(23, 59, 59, 999);

        where.startTime = {
          gte: startOfDay,
          lte: endOfDay,
        };
      } else {
        // Por defecto, solo reservas futuras
        where.startTime = {
          gte: new Date(),
        };
      }

      // Obtener reservas
      const reservations = await prisma.courtReservation.findMany({
        where,
        include: {
          user: {
            select: {
              id: true,
              name: true,
              email: true,
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
              matchType: true,
            },
          },
        },
        orderBy: {
          startTime: "asc",
        },
      });

      return NextResponse.json({
        court: {
          id: court.id,
          name: court.name,
          club: court.club,
        },
        reservations: reservations.map((r) => ({
          id: r.id,
          startTime: r.startTime.toISOString(),
          endTime: r.endTime.toISOString(),
          createdAt: r.createdAt.toISOString(),
          user: r.user,
          event: r.event,
          match: r.match,
        })),
        totalCount: reservations.length,
      });
    } catch (error) {
      if (error instanceof z.ZodError) {
        return NextResponse.json(
          { error: "Validation error", details: error },
          { status: 400 }
        );
      }

      console.error("Error listing reservations:", error);
      return NextResponse.json(
        { error: "Internal server error" },
        { status: 500 }
      );
    }
  }
);
