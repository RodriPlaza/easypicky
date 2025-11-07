// src/app/api/clubs/[id]/join/route.ts
import { NextRequest, NextResponse } from "next/server";
import { withAuth, AuthenticatedUser } from "@/lib/auth-middleware";
import { prisma } from "@/lib/prisma";

interface RouteContext {
  params: Promise<{ id: string }>;
}

// POST - Solicitar unirse a un club
export const POST = withAuth(
  async (
    request: NextRequest,
    user: AuthenticatedUser,
    context?: RouteContext
  ) => {
    try {
      if (!context) {
        return NextResponse.json(
          { error: "Invalid request context" },
          { status: 400 }
        );
      }
      const { id: clubId } = await context.params;

      // Verificar que el club existe
      const club = await prisma.club.findUnique({
        where: { id: clubId },
        select: { id: true, name: true },
      });

      if (!club) {
        return NextResponse.json({ error: "Club not found" }, { status: 404 });
      }

      // Verificar si ya existe una membresía
      const existingMembership = await prisma.clubMembership.findUnique({
        where: {
          userId_clubId: {
            userId: user.userId,
            clubId: clubId,
          },
        },
      });

      if (existingMembership) {
        // Si ya existe, verificar el estado
        if (existingMembership.status === "ACTIVE") {
          return NextResponse.json(
            { error: "You are already a member of this club" },
            { status: 409 }
          );
        }

        if (existingMembership.status === "PENDING") {
          return NextResponse.json(
            { error: "You already have a pending membership request" },
            { status: 409 }
          );
        }

        // Si estaba INACTIVE o CANCELLED, reactivar como PENDING
        const updatedMembership = await prisma.clubMembership.update({
          where: { id: existingMembership.id },
          data: {
            status: "PENDING",
            joinedAt: new Date(),
            expiresAt: null,
          },
        });

        return NextResponse.json({
          message: "Membership request submitted successfully",
          membership: updatedMembership,
        });
      }

      // Crear nueva membresía con estado PENDING
      const membership = await prisma.clubMembership.create({
        data: {
          userId: user.userId,
          clubId: clubId,
          status: "PENDING",
        },
      });

      return NextResponse.json(
        {
          message: "Membership request submitted successfully",
          membership,
        },
        { status: 201 }
      );
    } catch (error) {
      console.error("Join club error:", error);
      return NextResponse.json(
        { error: "Internal server error" },
        { status: 500 }
      );
    }
  }
);

// DELETE - Salir de un club / Cancelar solicitud
export const DELETE = withAuth(
  async (
    request: NextRequest,
    user: AuthenticatedUser,
    context?: RouteContext
  ) => {
    try {
      if (!context) {
        return NextResponse.json(
          { error: "Invalid request context" },
          { status: 400 }
        );
      }

      const { id: clubId } = await context.params;

      // Verificar que el club existe
      const club = await prisma.club.findUnique({
        where: { id: clubId },
        select: { id: true, name: true, creatorId: true },
      });

      if (!club) {
        return NextResponse.json({ error: "Club not found" }, { status: 404 });
      }

      // No permitir que el creador del club salga
      if (club.creatorId === user.userId) {
        return NextResponse.json(
          { error: "Club creators cannot leave their club" },
          { status: 403 }
        );
      }

      // Buscar la membresía
      const membership = await prisma.clubMembership.findUnique({
        where: {
          userId_clubId: {
            userId: user.userId,
            clubId: clubId,
          },
        },
      });

      if (!membership) {
        return NextResponse.json(
          { error: "You are not a member of this club" },
          { status: 404 }
        );
      }

      // Si está PENDING, eliminar. Si está ACTIVE, cambiar a CANCELLED
      if (membership.status === "PENDING") {
        await prisma.clubMembership.delete({
          where: { id: membership.id },
        });

        return NextResponse.json({
          message: "Membership request cancelled successfully",
        });
      }

      // Actualizar a CANCELLED
      await prisma.clubMembership.update({
        where: { id: membership.id },
        data: {
          status: "CANCELLED",
        },
      });

      return NextResponse.json({
        message: "Successfully left the club",
      });
    } catch (error) {
      console.error("Leave club error:", error);
      return NextResponse.json(
        { error: "Internal server error" },
        { status: 500 }
      );
    }
  }
);
