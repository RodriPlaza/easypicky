// src/app/api/users/memberships/route.ts
import { NextRequest, NextResponse } from "next/server";
import { withAuth, AuthenticatedUser } from "@/lib/auth-middleware";
import { prisma } from "@/lib/prisma";
import { z } from "zod";

const listMembershipsSchema = z.object({
  page: z
    .string()
    .optional()
    .transform((val) => (val ? parseInt(val) : 1)),
  limit: z
    .string()
    .optional()
    .transform((val) => (val ? parseInt(val) : 20)),
  status: z.enum(["ACTIVE", "INACTIVE", "PENDING", "CANCELLED"]).optional(),
});

// GET - Obtener membresías del usuario autenticado
export const GET = withAuth(
  async (request: NextRequest, user: AuthenticatedUser) => {
    try {
      const { searchParams } = new URL(request.url);
      const queryParams = Object.fromEntries(searchParams.entries());

      const { page, limit, status } = listMembershipsSchema.parse(queryParams);

      const skip = (page - 1) * limit;

      // Construir filtros
      const where: any = {
        userId: user.userId,
      };

      if (status) {
        where.status = status;
      }

      // Obtener membresías con paginación
      const [memberships, totalCount] = await Promise.all([
        prisma.clubMembership.findMany({
          where,
          skip,
          take: limit,
          include: {
            club: {
              include: {
                _count: {
                  select: {
                    memberships: true,
                    events: true,
                    courts: true,
                  },
                },
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
        memberships,
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

      console.error("List memberships error:", error);
      return NextResponse.json(
        { error: "Internal server error" },
        { status: 500 }
      );
    }
  }
);
