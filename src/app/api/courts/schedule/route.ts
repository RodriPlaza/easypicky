// src/app/api/courts/[id]/schedule/route.ts
import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { z } from "zod";
import { withAuth } from "@/lib/auth-middleware";
import { AuthenticatedUser } from "@/lib/auth-middleware";

const scheduleQuerySchema = z.object({
  date: z
    .string()
    .regex(/^\d{4}-\d{2}-\d{2}$/, "Invalid date format (YYYY-MM-DD)"),
});

interface RouteParams {
  params: { id: string };
}

// GET - Obtener horario de una pista para un día específico
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
      const queryParams = Object.fromEntries(searchParams.entries());

      // Validar court ID
      z.string().min(1, "Court ID is required").parse(courtId);

      // Validar parámetros de query
      const { date: dateParam } = scheduleQuerySchema.parse(queryParams);

      // Obtener la pista
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

      if (!court.isActive) {
        return NextResponse.json(
          { error: "Court is not active" },
          { status: 400 }
        );
      }

      // Parsear fecha
      const date = new Date(dateParam);
      const startOfDay = new Date(date);
      startOfDay.setHours(0, 0, 0, 0);
      const endOfDay = new Date(date);
      endOfDay.setHours(23, 59, 59, 999);

      // Obtener todas las reservas de ese día
      const reservations = await prisma.courtReservation.findMany({
        where: {
          courtId: courtId,
          startTime: {
            gte: startOfDay,
            lte: endOfDay,
          },
        },
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

      // Generar slots de tiempo
      const slots = [];
      const [openHour, openMinute] = court.openTime.split(":").map(Number);
      const [closeHour, closeMinute] = court.closeTime.split(":").map(Number);

      let currentTime = new Date(date);
      currentTime.setHours(openHour, openMinute, 0, 0);

      const closeTime = new Date(date);
      closeTime.setHours(closeHour, closeMinute, 0, 0);

      while (currentTime < closeTime) {
        const slotTime = currentTime.toTimeString().slice(0, 5); // "HH:mm"
        const slotEnd = new Date(
          currentTime.getTime() + court.slotDuration * 60000
        );

        // Verificar si hay una reserva en este slot
        const reservation = reservations.find((r) => {
          const resStart = new Date(r.startTime);
          const resEnd = new Date(r.endTime);
          return currentTime >= resStart && currentTime < resEnd;
        });

        slots.push({
          time: slotTime,
          isAvailable: !reservation,
          reservation: reservation
            ? {
                id: reservation.id,
                startTime: reservation.startTime.toISOString(),
                endTime: reservation.endTime.toISOString(),
                user: reservation.user,
                event: reservation.event,
                match: reservation.match,
              }
            : undefined,
        });

        currentTime = slotEnd;
      }

      return NextResponse.json({
        court: {
          id: court.id,
          name: court.name,
          openTime: court.openTime,
          closeTime: court.closeTime,
          slotDuration: court.slotDuration,
          club: court.club,
        },
        date: dateParam,
        slots,
      });
    } catch (error) {
      if (error instanceof z.ZodError) {
        return NextResponse.json(
          { error: "Validation error", details: error },
          { status: 400 }
        );
      }

      console.error("Error getting court schedule:", error);
      return NextResponse.json(
        { error: "Internal server error" },
        { status: 500 }
      );
    }
  }
);
