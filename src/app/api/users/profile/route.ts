// src/app/api/users/profile/route.ts
import { NextRequest, NextResponse } from "next/server";
import { withAuth, AuthenticatedUser } from "@/lib/auth-middleware";
import { prisma } from "@/lib/prisma";
import { z } from "zod";
import bcrypt from "bcryptjs";

const updateProfileSchema = z.object({
  name: z.string().min(2, "Name must be at least 2 characters").optional(),
  phone: z.string().optional(),
  city: z.string().optional(),
  avatar: z.string().url("Invalid avatar URL").optional(),
  duprId: z.string().optional(),
  currentPassword: z.string().optional(),
  newPassword: z
    .string()
    .min(6, "Password must be at least 6 characters")
    .optional(),
});

// PUT - Actualizar perfil del usuario autenticado
export const PUT = withAuth(
  async (request: NextRequest, user: AuthenticatedUser) => {
    try {
      const body = await request.json();

      // Validar datos de entrada
      const validatedData = updateProfileSchema.parse(body);

      // Si se intenta cambiar la contraseña, verificar la actual
      if (validatedData.newPassword) {
        if (!validatedData.currentPassword) {
          return NextResponse.json(
            { error: "Current password is required to set a new password" },
            { status: 400 }
          );
        }

        // Obtener usuario con contraseña
        const userWithPassword = await prisma.user.findUnique({
          where: { id: user.userId },
          select: { password: true },
        });

        if (!userWithPassword?.password) {
          return NextResponse.json(
            {
              error:
                "Cannot change password for accounts created with social login",
            },
            { status: 400 }
          );
        }

        // Verificar contraseña actual
        const isPasswordValid = await bcrypt.compare(
          validatedData.currentPassword,
          userWithPassword.password
        );

        if (!isPasswordValid) {
          return NextResponse.json(
            { error: "Current password is incorrect" },
            { status: 401 }
          );
        }
      }

      // Si se proporciona duprId, verificar que no esté en uso por otro usuario
      if (validatedData.duprId) {
        const existingUser = await prisma.user.findFirst({
          where: {
            duprId: validatedData.duprId,
            id: { not: user.userId },
          },
        });

        if (existingUser) {
          return NextResponse.json(
            { error: "This DUPR ID is already in use by another user" },
            { status: 409 }
          );
        }
      }

      // Preparar datos para actualizar
      const updateData: any = {
        ...(validatedData.name && { name: validatedData.name }),
        ...(validatedData.phone !== undefined && {
          phone: validatedData.phone,
        }),
        ...(validatedData.city !== undefined && { city: validatedData.city }),
        ...(validatedData.avatar !== undefined && {
          avatar: validatedData.avatar,
        }),
        ...(validatedData.duprId !== undefined && {
          duprId: validatedData.duprId,
        }),
      };

      // Si hay nueva contraseña, hashearla
      if (validatedData.newPassword) {
        updateData.password = await bcrypt.hash(validatedData.newPassword, 12);
      }

      // Actualizar usuario
      const updatedUser = await prisma.user.update({
        where: { id: user.userId },
        data: updateData,
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
        },
      });

      return NextResponse.json({
        message: "Profile updated successfully",
        user: updatedUser,
      });
    } catch (error) {
      if (error instanceof z.ZodError) {
        return NextResponse.json(
          { error: "Validation error", details: error },
          { status: 400 }
        );
      }

      console.error("Update profile error:", error);
      return NextResponse.json(
        { error: "Internal server error" },
        { status: 500 }
      );
    }
  }
);
