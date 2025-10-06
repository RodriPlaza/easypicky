// src/app/api/events/nearby/route.ts
import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { z } from "zod";
import { EventType } from "@prisma/client";

const nearbyEventsSchema = z.object({
  city: z.string().min(1, "City is required"),
  page: z
    .string()
    .optional()
    .transform((val) => (val ? parseInt(val) : 1)),
  limit: z
    .string()
    .optional()
    .transform((val) => (val ? parseInt(val) : 10))
    .refine((val) => val <= 50, "Limit cannot exceed 50"),
  type: z.nativeEnum(EventType).optional(),
  daysAhead: z
    .string()
    .optional()
    .transform((val) => (val ? parseInt(val) : 7))
    .refine(
      (val) => val >= 1 && val <= 30,
      "Days ahead must be between 1 and 30"
    ),
  openOnly: z
    .string()
    .optional()
    .transform((val) => val === "true"),
});

// GET - Obtener eventos cercanos
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const queryParams = Object.fromEntries(searchParams.entries());

    // Validar parámetros de query
    const { city, page, limit, type, daysAhead, openOnly } =
      nearbyEventsSchema.parse(queryParams);

    const skip = (page - 1) * limit;

    // Calcular fecha límite
    const endDate = new Date();
    endDate.setDate(endDate.getDate() + daysAhead);
    endDate.setHours(23, 59, 59, 999);

    // Construir filtros
    const where: any = {
      // Solo eventos futuros
      startDateTime: {
        gte: new Date(),
        lte: endDate,
      },
      // Solo eventos activos
      status: "SCHEDULED",
      // Filtrar por ciudad
      club: {
        city: {
          contains: city,
          mode: "insensitive",
        },
      },
    };

    // Filtro de visibilidad
    if (openOnly) {
      where.visibility = "OPEN";
    } else {
      // Solo eventos públicos y de miembros (sin privados)
      where.visibility = {
        in: ["OPEN", "MEMBERS_ONLY"],
      };
    }

    // Filtro por tipo de evento
    if (type) {
      where.type = type;
    }

    // Obtener eventos cercanos con paginación
    const [events, totalCount] = await Promise.all([
      prisma.event.findMany({
        where,
        skip,
        take: limit,
        include: {
          club: {
            select: {
              id: true,
              name: true,
              city: true,
              address: true,
              logo: true,
            },
          },
          court: {
            select: {
              id: true,
              name: true,
            },
          },
          _count: {
            select: {
              participants: true,
            },
          },
        },
        orderBy: [{ startDateTime: "asc" }, { createdAt: "desc" }],
      }),
      prisma.event.count({ where }),
    ]);

    const totalPages = Math.ceil(totalCount / limit);

    // Agregar información de distancia relativa (en futuras versiones se podría usar geolocalización real)
    const eventsWithDistance = events.map((event) => ({
      ...event,
      distanceInfo: {
        city: event.club.city,
        isLocal: event.club.city.toLowerCase().includes(city.toLowerCase()),
      },
    }));

    return NextResponse.json({
      events: eventsWithDistance,
      searchParams: {
        city,
        daysAhead,
        type,
        openOnly,
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

    console.error("Nearby events error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
