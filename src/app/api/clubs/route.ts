// src/app/api/clubs/route.ts
import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { z } from "zod";
import { withAuth } from "@/lib/auth-middleware";

const createClubSchema = z
  .object({
    name: z
      .string()
      .min(1, "Club name is required")
      .max(100, "Club name too long"),
    description: z.string().optional(),
    address: z.string().min(1, "Address is required"),
    city: z.string().min(1, "City is required"),
    phone: z.string().optional(),
    email: z.string().email("Invalid email address").optional(),
    website: z.string().url("Invalid website URL").optional(),
    logo: z.string().url("Invalid logo URL").optional(),
  })
  .transform((data) => ({
    ...data,
    description: data.description || undefined,
    phone: data.phone || undefined,
    email: data.email || undefined,
    website: data.website || undefined,
    logo: data.logo || undefined,
  }));

const listClubsSchema = z.object({
  page: z
    .string()
    .optional()
    .transform((val) => (val ? parseInt(val) : 1)),
  limit: z
    .string()
    .optional()
    .transform((val) => (val ? parseInt(val) : 10)),
  city: z.string().optional(),
  search: z.string().optional(),
});

// POST - Crear club
export const POST = withAuth(async (request: NextRequest, user) => {
  try {
    const body = await request.json();

    // Validar datos de entrada
    const validatedData = createClubSchema.parse(body);

    // Verificar que no existe un club con el mismo nombre en la misma ciudad
    const existingClub = await prisma.club.findFirst({
      where: {
        name: validatedData.name,
        city: validatedData.city,
      },
    });

    if (existingClub) {
      return NextResponse.json(
        { error: "A club with this name already exists in this city" },
        { status: 409 }
      );
    }

    // Crear el club
    const club = await prisma.club.create({
      data: {
        ...validatedData,
        creatorId: user.userId,
      },
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

    // Crear membresía automática para el creador como admin
    await prisma.clubMembership.create({
      data: {
        userId: user.userId,
        clubId: club.id,
        status: "ACTIVE",
      },
    });

    return NextResponse.json(
      {
        message: "Club created successfully",
        club,
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

    console.error("Create club error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
});

// GET - Listar clubes
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const queryParams = Object.fromEntries(searchParams.entries());

    // Validar parámetros de query
    const { page, limit, city, search } = listClubsSchema.parse(queryParams);

    const skip = (page - 1) * limit;

    // Construir filtros
    const where: any = {};

    if (city) {
      where.city = {
        contains: city,
        mode: "insensitive",
      };
    }

    if (search) {
      where.OR = [
        {
          name: {
            contains: search,
            mode: "insensitive",
          },
        },
        {
          description: {
            contains: search,
            mode: "insensitive",
          },
        },
      ];
    }

    // Obtener clubes con paginación
    const [clubs, totalCount] = await Promise.all([
      prisma.club.findMany({
        where,
        skip,
        take: limit,
        include: {
          creator: {
            select: {
              id: true,
              name: true,
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
        orderBy: {
          createdAt: "desc",
        },
      }),
      prisma.club.count({ where }),
    ]);

    const totalPages = Math.ceil(totalCount / limit);

    return NextResponse.json({
      clubs,
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

    console.error("List clubs error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
