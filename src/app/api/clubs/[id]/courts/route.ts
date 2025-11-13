// src/app/api/clubs/[id]/courts/route.ts
import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { z } from "zod";
import { withAuth } from "@/lib/auth-middleware";
import { AuthenticatedUser } from "@/lib/auth-middleware";

const createCourtSchema = z
  .object({
    name: z
      .string()
      .min(1, "Court name is required")
      .max(100, "Court name too long"),
    description: z.string().optional(),
    isActive: z.boolean().optional().default(true),
    isReservable: z.boolean().optional().default(true),
    openTime: z
      .string()
      .regex(/^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/, "Invalid time format (HH:mm)")
      .optional(),
    closeTime: z
      .string()
      .regex(/^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/, "Invalid time format (HH:mm)")
      .optional(),
    slotDuration: z
      .number()
      .min(15, "Minimum 15 minutes")
      .max(240, "Maximum 4 hours")
      .optional(),
  })
  .refine(
    (data) => {
      // Si es reservable, los campos de horario son obligatorios
      if (data.isReservable) {
        return !!(data.openTime && data.closeTime && data.slotDuration);
      }
      return true;
    },
    {
      message: "Time fields are required when court is reservable",
      path: ["openTime"],
    }
  );

const listCourtsSchema = z.object({
  page: z
    .string()
    .optional()
    .transform((val) => (val ? parseInt(val) : 1)),
  limit: z
    .string()
    .optional()
    .transform((val) => (val ? parseInt(val) : 20)),
  isActive: z
    .string()
    .optional()
    .transform((val) =>
      val === "true" ? true : val === "false" ? false : undefined
    ),
});

interface RouteParams {
  params: { id: string };
}

// POST - Crear pista en un club
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

      // Validar club ID
      z.string().cuid("Invalid club ID").parse(clubId);

      // Validar datos de entrada
      const validatedData = createCourtSchema.parse(body);

      // Verificar que el club existe
      const club = await prisma.club.findUnique({
        where: { id: clubId },
      });

      if (!club) {
        return NextResponse.json({ error: "Club not found" }, { status: 404 });
      }

      // Verificar permisos: creador del club o SUPER_ADMIN
      const isCreator = club.creatorId === user.userId;
      const isSuperAdmin = user.role === "SUPER_ADMIN";

      if (!isCreator && !isSuperAdmin) {
        return NextResponse.json(
          {
            error:
              "Forbidden - Only club creator or super admin can create courts",
          },
          { status: 403 }
        );
      }

      // Verificar si ya existe una pista con el mismo nombre en el club
      const existingCourt = await prisma.court.findFirst({
        where: {
          clubId,
          name: validatedData.name,
        },
      });

      if (existingCourt) {
        return NextResponse.json(
          {
            error: "A court with this name already exists in this club",
          },
          { status: 409 }
        );
      }

      // Solo validar horarios si isReservable = true
      if (validatedData.isReservable) {
        if (
          !validatedData.openTime ||
          !validatedData.closeTime ||
          !validatedData.slotDuration
        ) {
          return NextResponse.json(
            {
              error:
                "openTime, closeTime, and slotDuration are required when court is reservable",
            },
            { status: 400 }
          );
        }

        // Validar que closeTime sea mayor que openTime
        const [openHour, openMin] = validatedData.openTime
          .split(":")
          .map(Number);
        const [closeHour, closeMin] = validatedData.closeTime
          .split(":")
          .map(Number);
        const openMinutes = openHour * 60 + openMin;
        const closeMinutes = closeHour * 60 + closeMin;

        if (closeMinutes <= openMinutes) {
          return NextResponse.json(
            {
              error: "Close time must be after open time",
            },
            { status: 400 }
          );
        }
      }

      // Crear la pista con valores condicionales
      const courtData: any = {
        name: validatedData.name,
        description: validatedData.description,
        isActive: validatedData.isActive,
        isReservable: validatedData.isReservable,
        clubId,
      };

      // Solo agregar campos de horario si isReservable = true
      if (validatedData.isReservable) {
        courtData.openTime = validatedData.openTime;
        courtData.closeTime = validatedData.closeTime;
        courtData.slotDuration = validatedData.slotDuration;
      } else {
        // Valores por defecto para pistas no reservables (necesarios por el schema)
        courtData.openTime = "08:00";
        courtData.closeTime = "23:00";
        courtData.slotDuration = 90;
      }

      const court = await prisma.court.create({
        data: courtData,
        include: {
          club: {
            select: {
              id: true,
              name: true,
              city: true,
            },
          },
          _count: {
            select: {
              events: true,
              matches: true,
            },
          },
        },
      });

      return NextResponse.json(
        {
          message: "Court created successfully",
          court,
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

      console.error("Create court error:", error);
      return NextResponse.json(
        { error: "Internal server error" },
        { status: 500 }
      );
    }
  }
);

// GET - Listar pistas de un club
export async function GET(request: NextRequest, context: RouteParams) {
  try {
    const { id: clubId } = await context.params;
    const { searchParams } = new URL(request.url);
    const queryParams = Object.fromEntries(searchParams.entries());

    // Validar club ID
    z.string().cuid("Invalid club ID").parse(clubId);

    // Validar parámetros de query
    const { page, limit, isActive } = listCourtsSchema.parse(queryParams);

    // Verificar que el club existe
    const club = await prisma.club.findUnique({
      where: { id: clubId },
      select: {
        id: true,
        name: true,
        city: true,
      },
    });

    if (!club) {
      return NextResponse.json({ error: "Club not found" }, { status: 404 });
    }

    const skip = (page - 1) * limit;

    // Construir filtros
    const where: any = {
      clubId,
    };

    if (isActive !== undefined) {
      where.isActive = isActive;
    }

    // Obtener pistas con paginación
    const [courts, totalCount] = await Promise.all([
      prisma.court.findMany({
        where,
        skip,
        take: limit,
        include: {
          _count: {
            select: {
              events: true,
              matches: true,
            },
          },
        },
        orderBy: [
          { isActive: "desc" }, // Pistas activas primero
          { name: "asc" },
        ],
      }),
      prisma.court.count({ where }),
    ]);

    const totalPages = Math.ceil(totalCount / limit);

    return NextResponse.json({
      club,
      courts,
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

    console.error("List courts error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
