// src/app/api/clubs/[id]/route.ts
import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { z } from "zod";
import { verifyToken } from "@/lib/auth-middleware";
import { UserRole } from "@prisma/client";

const updateClubSchema = z.object({
  name: z
    .string()
    .min(1, "Club name is required")
    .max(100, "Club name too long")
    .optional(),
  description: z.string().optional(),
  address: z.string().min(1, "Address is required").optional(),
  city: z.string().min(1, "City is required").optional(),
  phone: z.string().optional(),
  email: z.string().email("Invalid email address").optional(),
  website: z.string().url("Invalid website URL").optional(),
  logo: z.string().url("Invalid logo URL").optional(),
});

interface RouteParams {
  params: {
    id: string;
  };
}

// Helper function to check if user can manage club
async function canManageClub(
  userId: string,
  clubId: string,
  userRole: UserRole
): Promise<boolean> {
  if (userRole === "SUPER_ADMIN") return true;

  const club = await prisma.club.findUnique({
    where: { id: clubId },
    select: { creatorId: true },
  });

  if (!club) return false;

  // Es el creador del club
  if (club.creatorId === userId) return true;

  return false;
}

// GET - Obtener club específico
export async function GET(request: NextRequest, { params }: RouteParams) {
  try {
    const { id } = await params;

    if (!id) {
      return NextResponse.json(
        { error: "Club ID is required" },
        { status: 400 }
      );
    }

    const club = await prisma.club.findUnique({
      where: { id },
      include: {
        creator: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
        courts: {
          where: { isActive: true },
          select: {
            id: true,
            name: true,
            description: true,
          },
        },
        subscription: {
          select: {
            id: true,
            status: true,
            currentPeriodStart: true,
            currentPeriodEnd: true,
          },
        },
        _count: {
          select: {
            memberships: {
              where: { status: "ACTIVE" },
            },
            events: {
              where: { status: "SCHEDULED" },
            },
          },
        },
      },
    });

    if (!club) {
      return NextResponse.json({ error: "Club not found" }, { status: 404 });
    }

    return NextResponse.json({ club });
  } catch (error) {
    console.error("Get club error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

// PUT - Actualizar club
export async function PUT(request: NextRequest, { params }: RouteParams) {
  // Verificar autenticación manualmente
  const user = await verifyToken(request);
  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  try {
    const { id } = await params;

    if (!id) {
      return NextResponse.json(
        { error: "Club ID is required" },
        { status: 400 }
      );
    }

    // Verificar permisos
    const canManage = await canManageClub(user.userId, id, user.role);
    if (!canManage) {
      return NextResponse.json(
        { error: "Forbidden - You don't have permission to manage this club" },
        { status: 403 }
      );
    }

    const body = await request.json();

    // Validar datos de entrada
    const validatedData = updateClubSchema.parse(body);

    // Si se actualiza el nombre, verificar que no exista otro club con el mismo nombre en la misma ciudad
    if (validatedData.name || validatedData.city) {
      const currentClub = await prisma.club.findUnique({
        where: { id },
        select: { name: true, city: true },
      });

      if (!currentClub) {
        return NextResponse.json({ error: "Club not found" }, { status: 404 });
      }

      const nameToCheck = validatedData.name || currentClub.name;
      const cityToCheck = validatedData.city || currentClub.city;

      const existingClub = await prisma.club.findFirst({
        where: {
          id: { not: id },
          name: nameToCheck,
          city: cityToCheck,
        },
      });

      if (existingClub) {
        return NextResponse.json(
          { error: "A club with this name already exists in this city" },
          { status: 409 }
        );
      }
    }

    // Actualizar el club
    const updatedClub = await prisma.club.update({
      where: { id },
      data: validatedData,
      include: {
        creator: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
        _count: {
          select: {
            memberships: true,
            events: true,
            courts: true,
          },
        },
      },
    });

    return NextResponse.json({
      message: "Club updated successfully",
      club: updatedClub,
    });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: "Validation error", details: error },
        { status: 400 }
      );
    }

    console.error("Update club error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

// DELETE - Eliminar club
export async function DELETE(request: NextRequest, { params }: RouteParams) {
  // Verificar autenticación manualmente
  const user = await verifyToken(request);
  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  try {
    const { id } = await params;

    if (!id) {
      return NextResponse.json(
        { error: "Club ID is required" },
        { status: 400 }
      );
    }

    // Solo el creador del club o SUPER_ADMIN pueden eliminar
    const club = await prisma.club.findUnique({
      where: { id },
      select: {
        creatorId: true,
        name: true,
        _count: {
          select: {
            memberships: { where: { status: "ACTIVE" } },
            events: { where: { status: { in: ["SCHEDULED", "ONGOING"] } } },
          },
        },
      },
    });

    if (!club) {
      return NextResponse.json({ error: "Club not found" }, { status: 404 });
    }

    if (user.role !== "SUPER_ADMIN" && club.creatorId !== user.userId) {
      return NextResponse.json(
        {
          error:
            "Forbidden - Only the club creator or super admin can delete this club",
        },
        { status: 403 }
      );
    }

    // Eliminar el club (las relaciones se eliminarán en cascada según el schema)
    await prisma.club.delete({
      where: { id },
    });

    return NextResponse.json({
      message: "Club deleted successfully",
    });
  } catch (error) {
    console.error("Delete club error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
