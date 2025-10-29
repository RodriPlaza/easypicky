// src/app/api/clubs/[id]/members/route.ts
import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { z } from "zod";
import { verifyToken } from "@/lib/auth-middleware";
import { UserRole, MembershipStatus } from "@prisma/client";

const addMemberSchema = z.object({
  userId: z.string().cuid("Invalid user ID"),
  status: z.enum(["ACTIVE", "PENDING"]).optional().default("PENDING"),
  expiresAt: z
    .string()
    .datetime()
    .optional()
    .transform((val) => (val ? new Date(val) : undefined)),
});

const updateMemberSchema = z.object({
  status: z.enum(["ACTIVE", "INACTIVE", "PENDING", "CANCELLED"]),
  expiresAt: z
    .string()
    .datetime()
    .optional()
    .transform((val) => (val ? new Date(val) : undefined)),
});

const listMembersSchema = z.object({
  status: z.enum(["ACTIVE", "INACTIVE", "PENDING", "CANCELLED"]).optional(),
  page: z
    .string()
    .optional()
    .transform((val) => (val ? parseInt(val) : 1)),
  limit: z
    .string()
    .optional()
    .transform((val) => (val ? parseInt(val) : 20)),
});

interface RouteParams {
  params: {
    id: string;
  };
}

// Helper function to check if user can manage club members
async function canManageClubMembers(
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

// GET - Listar miembros del club
export async function GET(request: NextRequest, { params }: RouteParams) {
  // Verificar autenticación manualmente
  const user = await verifyToken(request);
  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  try {
    const { id: clubId } = params;

    if (!clubId) {
      return NextResponse.json(
        { error: "Club ID is required" },
        { status: 400 }
      );
    }

    // Verificar que el club existe
    const club = await prisma.club.findUnique({
      where: { id: clubId },
      select: { id: true, name: true },
    });

    if (!club) {
      return NextResponse.json({ error: "Club not found" }, { status: 404 });
    }

    // Verificar permisos
    const canManage = await canManageClubMembers(
      user.userId,
      clubId,
      user.role
    );
    if (!canManage) {
      return NextResponse.json(
        { error: "Forbidden - You don't have permission to view club members" },
        { status: 403 }
      );
    }

    const { searchParams } = new URL(request.url);
    const queryParams = Object.fromEntries(searchParams.entries());

    // Validar parámetros de query
    const { status, page, limit } = listMembersSchema.parse(queryParams);

    const skip = (page - 1) * limit;

    // Construir filtros
    const where: any = { clubId };
    if (status) {
      where.status = status;
    }

    // Obtener miembros con paginación
    const [memberships, totalCount] = await Promise.all([
      prisma.clubMembership.findMany({
        where,
        skip,
        take: limit,
        include: {
          user: {
            select: {
              id: true,
              name: true,
              email: true,
              phone: true,
              city: true,
              avatar: true,
              duprRating: true,
            },
          },
        },
        orderBy: {
          joinedAt: "desc",
        },
      }),
      prisma.clubMembership.count({ where }),
    ]);

    const totalPages = Math.ceil(totalCount / limit);

    return NextResponse.json({
      club: {
        id: club.id,
        name: club.name,
      },
      members: memberships,
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

    console.error("List club members error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

// POST - Agregar miembro al club
export async function POST(request: NextRequest, { params }: RouteParams) {
  // Verificar autenticación manualmente
  const user = await verifyToken(request);
  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  try {
    const { id: clubId } = await params;

    if (!clubId) {
      return NextResponse.json(
        { error: "Club ID is required" },
        { status: 400 }
      );
    }

    // Verificar permisos
    const canManage = await canManageClubMembers(
      user.userId,
      clubId,
      user.role
    );
    if (!canManage) {
      return NextResponse.json(
        {
          error: "Forbidden - You don't have permission to manage club members",
        },
        { status: 403 }
      );
    }

    const body = await request.json();

    // Validar datos de entrada
    const validatedData = addMemberSchema.parse(body);

    // Verificar que el usuario existe
    const targetUser = await prisma.user.findUnique({
      where: { id: validatedData.userId },
      select: { id: true, name: true, email: true },
    });

    if (!targetUser) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    // Verificar que el club existe
    const club = await prisma.club.findUnique({
      where: { id: clubId },
      select: { id: true, name: true },
    });

    if (!club) {
      return NextResponse.json({ error: "Club not found" }, { status: 404 });
    }

    // Verificar que no existe una membresía activa
    const existingMembership = await prisma.clubMembership.findUnique({
      where: {
        userId_clubId: {
          userId: validatedData.userId,
          clubId,
        },
      },
    });

    if (existingMembership) {
      return NextResponse.json(
        { error: "User is already a member of this club" },
        { status: 409 }
      );
    }

    // Crear la membresía
    const membership = await prisma.clubMembership.create({
      data: {
        userId: validatedData.userId,
        clubId,
        status: validatedData.status,
        expiresAt: validatedData.expiresAt,
      },
      include: {
        user: {
          select: {
            id: true,
            name: true,
            email: true,
            phone: true,
            city: true,
            avatar: true,
            duprRating: true,
          },
        },
      },
    });

    return NextResponse.json(
      {
        message: "Member added successfully",
        membership,
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

    console.error("Add club member error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

// PUT - Actualizar estado de membresía
export async function PUT(request: NextRequest, { params }: RouteParams) {
  // Verificar autenticación manualmente
  const user = await verifyToken(request);
  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  try {
    const { id: clubId } = params;
    const { searchParams } = new URL(request.url);
    const userId = searchParams.get("userId");

    if (!clubId || !userId) {
      return NextResponse.json(
        { error: "Club ID and User ID are required" },
        { status: 400 }
      );
    }

    // Verificar permisos
    const canManage = await canManageClubMembers(
      user.userId,
      clubId,
      user.role
    );
    if (!canManage) {
      return NextResponse.json(
        {
          error: "Forbidden - You don't have permission to manage club members",
        },
        { status: 403 }
      );
    }

    const body = await request.json();

    // Validar datos de entrada
    const validatedData = updateMemberSchema.parse(body);

    // Verificar que la membresía existe
    const existingMembership = await prisma.clubMembership.findUnique({
      where: {
        userId_clubId: {
          userId,
          clubId,
        },
      },
    });

    if (!existingMembership) {
      return NextResponse.json(
        { error: "Membership not found" },
        { status: 404 }
      );
    }

    // Actualizar la membresía
    const updatedMembership = await prisma.clubMembership.update({
      where: {
        userId_clubId: {
          userId,
          clubId,
        },
      },
      data: validatedData,
      include: {
        user: {
          select: {
            id: true,
            name: true,
            email: true,
            phone: true,
            city: true,
            avatar: true,
            duprRating: true,
          },
        },
      },
    });

    return NextResponse.json({
      message: "Membership updated successfully",
      membership: updatedMembership,
    });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: "Validation error", details: error },
        { status: 400 }
      );
    }

    console.error("Update club membership error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

// DELETE - Eliminar miembro del club
export async function DELETE(request: NextRequest, { params }: RouteParams) {
  // Verificar autenticación manualmente
  const user = await verifyToken(request);
  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  try {
    const { id: clubId } = params;
    const { searchParams } = new URL(request.url);
    const userId = searchParams.get("userId");

    if (!clubId || !userId) {
      return NextResponse.json(
        { error: "Club ID and User ID are required" },
        { status: 400 }
      );
    }

    // Verificar permisos
    const canManage = await canManageClubMembers(
      user.userId,
      clubId,
      user.role
    );
    if (!canManage) {
      return NextResponse.json(
        {
          error: "Forbidden - You don't have permission to manage club members",
        },
        { status: 403 }
      );
    }

    // Verificar que la membresía existe
    const existingMembership = await prisma.clubMembership.findUnique({
      where: {
        userId_clubId: {
          userId,
          clubId,
        },
      },
    });

    if (!existingMembership) {
      return NextResponse.json(
        { error: "Membership not found" },
        { status: 404 }
      );
    }

    // No permitir eliminar al creador del club
    const club = await prisma.club.findUnique({
      where: { id: clubId },
      select: { creatorId: true },
    });

    if (club?.creatorId === userId) {
      return NextResponse.json(
        { error: "Cannot remove the club creator from membership" },
        { status: 409 }
      );
    }

    // Eliminar la membresía
    await prisma.clubMembership.delete({
      where: {
        userId_clubId: {
          userId,
          clubId,
        },
      },
    });

    return NextResponse.json({
      message: "Member removed successfully",
    });
  } catch (error) {
    console.error("Remove club member error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
