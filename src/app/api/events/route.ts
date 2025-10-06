// src/app/api/events/route.ts
import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { z } from "zod";
import { verifyToken } from "@/lib/auth-middleware";
import { EventType, EventVisibility, EventStatus } from "@prisma/client";

const createEventSchema = z
  .object({
    title: z
      .string()
      .min(1, "Event title is required")
      .max(100, "Event title too long"),
    description: z.string().optional(),
    type: z.nativeEnum(EventType, { error: "Event type is required" }),
    visibility: z.nativeEnum(EventVisibility).optional(),
    startDateTime: z
      .string()
      .datetime("Invalid start date format")
      .refine((date) => new Date(date) > new Date(), {
        message: "Start date must be in the future",
      }),
    endDateTime: z.string().datetime("Invalid end date format"),
    maxParticipants: z.number().int().positive().optional(),
    price: z.number().min(0, "Price cannot be negative").optional(),
    clubId: z.string().cuid("Invalid club ID"),
    courtId: z.string().cuid("Invalid court ID").optional(),
  })
  .refine((data) => new Date(data.endDateTime) > new Date(data.startDateTime), {
    message: "End date must be after start date",
    path: ["endDateTime"],
  });

const listEventsSchema = z.object({
  page: z
    .string()
    .optional()
    .transform((val) => (val ? parseInt(val) : 1)),
  limit: z
    .string()
    .optional()
    .transform((val) => (val ? parseInt(val) : 10)),
  clubId: z.string().cuid().optional(),
  type: z.nativeEnum(EventType).optional(),
  status: z.nativeEnum(EventStatus).optional(),
  city: z.string().optional(),
  startDate: z.string().datetime().optional(),
  endDate: z.string().datetime().optional(),
  upcoming: z
    .string()
    .optional()
    .transform((val) => val === "true"),
});

// POST - Crear evento
export async function POST(request: NextRequest) {
  // Verificar autenticación manualmente
  const user = await verifyToken(request);
  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const body = await request.json();

    // Validar datos de entrada
    const validatedData = createEventSchema.parse(body);

    // Verificar que el club existe
    const club = await prisma.club.findUnique({
      where: { id: validatedData.clubId },
    });

    if (!club) {
      return NextResponse.json({ error: "Club not found" }, { status: 404 });
    }

    // Verificar permisos: creador del club, miembro activo o SUPER_ADMIN
    const isCreator = club.creatorId === user.userId;
    const isSuperAdmin = user.role === "SUPER_ADMIN";

    if (!isCreator && !isSuperAdmin) {
      return NextResponse.json(
        {
          error:
            "Forbidden - Only club creator or super admin can create events",
        },
        { status: 403 }
      );
    }

    // Verificar que la pista existe (si se especifica)
    if (validatedData.courtId) {
      const court = await prisma.court.findFirst({
        where: {
          id: validatedData.courtId,
          clubId: validatedData.clubId,
          isActive: true,
        },
      });

      if (!court) {
        return NextResponse.json(
          { error: "Court not found or not active in this club" },
          { status: 404 }
        );
      }
    }

    // Crear el evento
    const event = await prisma.event.create({
      data: {
        ...validatedData,
        startDateTime: new Date(validatedData.startDateTime),
        endDateTime: new Date(validatedData.endDateTime),
        visibility: validatedData.visibility || "MEMBERS_ONLY",
      },
      include: {
        club: {
          select: {
            id: true,
            name: true,
            city: true,
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
    });

    return NextResponse.json(
      {
        message: "Event created successfully",
        event,
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

    console.error("Create event error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

// GET - Listar eventos
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const queryParams = Object.fromEntries(searchParams.entries());

    // Validar parámetros de query
    const {
      page,
      limit,
      clubId,
      type,
      status,
      city,
      startDate,
      endDate,
      upcoming,
    } = listEventsSchema.parse(queryParams);

    const skip = (page - 1) * limit;

    // Construir filtros
    const where: any = {};

    if (clubId) {
      where.clubId = clubId;
    }

    if (type) {
      where.type = type;
    }

    if (status) {
      where.status = status;
    }

    if (city) {
      where.club = {
        city: {
          contains: city,
          mode: "insensitive",
        },
      };
    }

    // Filtros de fecha
    if (startDate || endDate || upcoming) {
      where.startDateTime = {};

      if (upcoming) {
        where.startDateTime.gte = new Date();
      }

      if (startDate) {
        where.startDateTime.gte = new Date(startDate);
      }

      if (endDate) {
        where.startDateTime.lte = new Date(endDate);
      }
    }

    // Solo mostrar eventos públicos o de miembros (sin eventos privados para usuarios no autenticados)
    where.visibility = {
      in: ["OPEN", "MEMBERS_ONLY"],
    };

    // Obtener eventos con paginación
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

    return NextResponse.json({
      events,
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

    console.error("List events error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
