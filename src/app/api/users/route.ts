// src/app/api/users/route.ts
import { NextRequest, NextResponse } from "next/server";
import { withRole } from "@/lib/auth-middleware";
import { prisma } from "@/lib/prisma";
import { z } from "zod";

const listUsersSchema = z.object({
  page: z
    .string()
    .optional()
    .transform((val) => (val ? parseInt(val) : 1)),
  limit: z
    .string()
    .optional()
    .transform((val) => (val ? Math.min(parseInt(val) || 20, 100) : 20)),
  search: z.string().optional(),
  city: z.string().optional(),
  role: z.enum(["USER", "SUPER_ADMIN"]).optional(),
});

// GET - Listar usuarios (solo SUPER_ADMIN)
export const GET = withRole(["SUPER_ADMIN"], async (request: NextRequest) => {
  try {
    const { searchParams } = new URL(request.url);
    const queryParams = Object.fromEntries(searchParams.entries());

    // Validar parámetros de query
    const { page, limit, search, city, role } =
      listUsersSchema.parse(queryParams);

    const skip = (page - 1) * limit;

    // Construir filtros
    const where: any = {};

    if (search) {
      where.OR = [
        { name: { contains: search, mode: "insensitive" } },
        { email: { contains: search, mode: "insensitive" } },
      ];
    }

    if (city) {
      where.city = {
        contains: city,
        mode: "insensitive",
      };
    }

    if (role) {
      where.role = role;
    }

    // Obtener usuarios con paginación
    const [users, totalCount] = await Promise.all([
      prisma.user.findMany({
        where,
        skip,
        take: limit,
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
            },
          },
        },
        orderBy: [{ createdAt: "desc" }],
      }),
      prisma.user.count({ where }),
    ]);

    const totalPages = Math.ceil(totalCount / limit);

    return NextResponse.json({
      users,
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

    console.error("List users error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
});
