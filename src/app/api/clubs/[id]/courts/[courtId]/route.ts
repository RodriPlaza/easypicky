// src/app/api/clubs/[id]/courts/[courtId]/route.ts
import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { z } from "zod";
import { verifyToken } from "@/lib/auth-middleware";

const updateCourtSchema = z.object({
  name: z
    .string()
    .min(1, "Court name is required")
    .max(100, "Court name too long")
    .optional(),
  description: z.string().optional(),
  isActive: z.boolean().optional(),
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
});

interface RouteParams {
  params: { id: string; courtId: string };
}

// GET - Obtener pista específica
export async function GET(request: NextRequest, context: RouteParams) {
  try {
    const { id: clubId, courtId } = await context.params;

    // Validar IDs (cuid2 es más flexible que cuid)
    z.string().min(1, "Club ID is required").parse(clubId);
    z.string().min(1, "Court ID is required").parse(courtId);

    // Verificar que el club existe
    const club = await prisma.club.findUnique({
      where: { id: clubId },
    });

    if (!club) {
      return NextResponse.json({ error: "Club not found" }, { status: 404 });
    }

    // Buscar la pista asegurando que pertenece al club
    const court = await prisma.court.findFirst({
      where: {
        id: courtId,
        clubId: clubId,
      },
      include: {
        club: {
          select: {
            id: true,
            name: true,
            city: true,
            address: true,
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

    if (!court) {
      return NextResponse.json(
        { error: "Court not found in this club" },
        { status: 404 }
      );
    }

    return NextResponse.json({ court });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json({ error: "Invalid ID format" }, { status: 400 });
    }

    console.error("Get court error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

// PUT - Actualizar pista
export async function PUT(request: NextRequest, context: RouteParams) {
  // Verificar autenticación
  const user = await verifyToken(request);
  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const { id: clubId, courtId } = await context.params;
    const body = await request.json();

    // Validar IDs y datos
    z.string().min(1, "Club ID is required").parse(clubId);
    z.string().min(1, "Court ID is required").parse(courtId);
    const validatedData = updateCourtSchema.parse(body);

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
            "Forbidden - Only club creator or super admin can update courts",
        },
        { status: 403 }
      );
    }

    // Verificar que la pista existe y pertenece al club
    const existingCourt = await prisma.court.findFirst({
      where: {
        id: courtId,
        clubId: clubId,
      },
    });

    if (!existingCourt) {
      return NextResponse.json(
        { error: "Court not found in this club" },
        { status: 404 }
      );
    }

    // Verificar si el nuevo nombre ya existe en el club (si se está cambiando el nombre)
    if (validatedData.name && validatedData.name !== existingCourt.name) {
      const duplicateCourt = await prisma.court.findFirst({
        where: {
          clubId: clubId,
          name: validatedData.name,
          id: { not: courtId }, // Excluir la pista actual
        },
      });

      if (duplicateCourt) {
        return NextResponse.json(
          {
            error: "A court with this name already exists in this club",
          },
          { status: 409 }
        );
      }
    }

    // Validar horarios si se están actualizando
    const finalOpenTime = validatedData.openTime || existingCourt.openTime;
    const finalCloseTime = validatedData.closeTime || existingCourt.closeTime;

    const [openHour, openMin] = finalOpenTime.split(":").map(Number);
    const [closeHour, closeMin] = finalCloseTime.split(":").map(Number);
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

    // Si se está desactivando la pista, verificar eventos futuros
    if (validatedData.isActive === false && existingCourt.isActive === true) {
      const futureEvents = await prisma.event.count({
        where: {
          courtId: courtId,
          startDateTime: {
            gte: new Date(),
          },
          status: {
            in: ["SCHEDULED", "ONGOING"],
          },
        },
      });

      if (futureEvents > 0) {
        return NextResponse.json(
          {
            error: "Cannot deactivate court with scheduled or ongoing events",
            details: {
              futureEvents,
              suggestion:
                "Please cancel or reassign events before deactivating the court",
            },
          },
          { status: 409 }
        );
      }
    }

    // Actualizar la pista
    const updatedCourt = await prisma.court.update({
      where: { id: courtId },
      data: validatedData,
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

    return NextResponse.json({
      message: "Court updated successfully",
      court: updatedCourt,
    });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: "Validation error", details: error },
        { status: 400 }
      );
    }

    console.error("Update court error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

// DELETE - Eliminar pista
export async function DELETE(request: NextRequest, context: RouteParams) {
  // Verificar autenticación
  const user = await verifyToken(request);
  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const { id: clubId, courtId } = await context.params;

    // Validar IDs
    z.string().min(1, "Club ID is required").parse(clubId);
    z.string().min(1, "Court ID is required").parse(courtId);

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
            "Forbidden - Only club creator or super admin can delete courts",
        },
        { status: 403 }
      );
    }

    // Verificar que la pista existe y pertenece al club
    const existingCourt = await prisma.court.findFirst({
      where: {
        id: courtId,
        clubId: clubId,
      },
      include: {
        _count: {
          select: {
            events: true,
            matches: true,
            reservations: true,
          },
        },
      },
    });

    if (!existingCourt) {
      return NextResponse.json(
        { error: "Court not found in this club" },
        { status: 404 }
      );
    }

    // Verificar que no tenga eventos futuros
    const futureEvents = await prisma.event.count({
      where: {
        courtId: courtId,
        startDateTime: {
          gte: new Date(),
        },
        status: {
          in: ["SCHEDULED", "ONGOING"],
        },
      },
    });

    if (futureEvents > 0) {
      return NextResponse.json(
        {
          error: "Cannot delete court with scheduled or ongoing events",
          details: {
            futureEvents,
            suggestion:
              "Please cancel or reassign events before deleting the court, or deactivate it instead",
          },
        },
        { status: 409 }
      );
    }

    // Verificar que no tenga partidos sin completar
    const incompleteMatches = await prisma.match.count({
      where: {
        courtId: courtId,
        completed: false,
      },
    });

    if (incompleteMatches > 0) {
      return NextResponse.json(
        {
          error: "Cannot delete court with incomplete matches",
          details: {
            incompleteMatches,
            suggestion:
              "Please complete or delete matches before deleting the court",
          },
        },
        { status: 409 }
      );
    }

    // Verificar que no tenga reservas futuras
    const futureReservations = await prisma.courtReservation.count({
      where: {
        courtId: courtId,
        startTime: {
          gte: new Date(),
        },
      },
    });

    if (futureReservations > 0) {
      return NextResponse.json(
        {
          error: "Cannot delete court with future reservations",
          details: {
            futureReservations,
            suggestion:
              "Please cancel future reservations before deleting the court",
          },
        },
        { status: 409 }
      );
    }

    // Eliminar la pista
    await prisma.court.delete({
      where: { id: courtId },
    });

    return NextResponse.json({
      message: "Court deleted successfully",
      deletedCourt: {
        id: existingCourt.id,
        name: existingCourt.name,
        club: {
          id: club.id,
          name: club.name,
        },
      },
      stats: {
        eventsDeleted: existingCourt._count.events,
        matchesDeleted: existingCourt._count.matches,
        reservationsDeleted: existingCourt._count.reservations,
      },
    });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json({ error: "Invalid ID format" }, { status: 400 });
    }

    console.error("Delete court error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
