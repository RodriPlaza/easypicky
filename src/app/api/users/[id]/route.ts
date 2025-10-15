// src/app/api/users/[id]/route.ts
import { NextRequest, NextResponse } from "next/server";
import { withRole, AuthenticatedUser } from "@/lib/auth-middleware";
import { prisma } from "@/lib/prisma";

interface RouteContext {
  params: {
    id: string;
  };
}

// GET - Obtener usuario específico (solo SUPER_ADMIN)
export const GET = withRole(
  ["SUPER_ADMIN"],
  async (
    request: NextRequest,
    user: AuthenticatedUser,
    context?: RouteContext
  ) => {
    try {
      if (!context?.params?.id) {
        return NextResponse.json(
          { error: "User ID is required" },
          { status: 400 }
        );
      }

      const userId = context.params.id;

      const userProfile = await prisma.user.findUnique({
        where: { id: userId },
        select: {
          id: true,
          email: true,
          name: true,
          phone: true,
          city: true,
          avatar: true,
          duprId: true,
          duprRating: true,
          role: true,
          createdAt: true,
          updatedAt: true,
          _count: {
            select: {
              clubMemberships: true,
              eventParticipations: true,
              matchParticipations: true,
              createdClubs: true,
              payments: true,
            },
          },
        },
      });

      if (!userProfile) {
        return NextResponse.json({ error: "User not found" }, { status: 404 });
      }

      return NextResponse.json({
        user: userProfile,
      });
    } catch (error) {
      console.error("Get user error:", error);
      return NextResponse.json(
        { error: "Internal server error" },
        { status: 500 }
      );
    }
  }
);

// DELETE - Eliminar usuario (solo SUPER_ADMIN)
export const DELETE = withRole(
  ["SUPER_ADMIN"],
  async (
    request: NextRequest,
    user: AuthenticatedUser,
    context?: RouteContext
  ) => {
    try {
      if (!context?.params?.id) {
        return NextResponse.json(
          { error: "User ID is required" },
          { status: 400 }
        );
      }

      const userId = context.params.id;

      // No permitir que un super admin se elimine a sí mismo
      if (userId === user.userId) {
        return NextResponse.json(
          { error: "Cannot delete your own account" },
          { status: 400 }
        );
      }

      // Verificar que el usuario existe
      const userToDelete = await prisma.user.findUnique({
        where: { id: userId },
        select: {
          id: true,
          email: true,
          name: true,
          _count: {
            select: {
              createdClubs: true,
            },
          },
        },
      });

      if (!userToDelete) {
        return NextResponse.json({ error: "User not found" }, { status: 404 });
      }

      // Verificar si el usuario es creador de algún club
      if (userToDelete._count.createdClubs > 0) {
        return NextResponse.json(
          {
            error: "Cannot delete user who is a club creator",
            details: {
              clubsCreated: userToDelete._count.createdClubs,
              suggestion:
                "Please transfer club ownership or delete the clubs first",
            },
          },
          { status: 409 }
        );
      }

      // Eliminar el usuario (las relaciones se eliminan en cascada según el schema)
      await prisma.user.delete({
        where: { id: userId },
      });

      return NextResponse.json({
        message: "User deleted successfully",
        deletedUser: {
          id: userToDelete.id,
          email: userToDelete.email,
          name: userToDelete.name,
        },
      });
    } catch (error) {
      console.error("Delete user error:", error);
      return NextResponse.json(
        { error: "Internal server error" },
        { status: 500 }
      );
    }
  }
);
