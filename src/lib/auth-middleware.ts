// src/lib/auth-middleware.ts

import { NextRequest, NextResponse } from "next/server";
import { verify } from "jsonwebtoken";
import { prisma } from "./prisma";
import { UserRole } from "@prisma/client";

export interface AuthenticatedUser {
  userId: string;
  email: string;
  role: UserRole;
}

// Función para extraer y verificar el token
export async function verifyToken(
  request: NextRequest
): Promise<AuthenticatedUser | null> {
  try {
    const authHeader = request.headers.get("authorization");

    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      return null;
    }

    const token = authHeader.substring(7); // Remove "Bearer "

    const decoded = verify(token, process.env.NEXTAUTH_SECRET!) as any;

    // Verificar que el usuario existe y está activo
    const user = await prisma.user.findUnique({
      where: { id: decoded.userId },
      select: { id: true, email: true, role: true },
    });

    if (!user) {
      return null;
    }

    return {
      userId: user.id,
      email: user.email,
      role: user.role,
    };
  } catch (error) {
    console.error("Token verification error:", error);
    return null;
  }
}

// Middleware para rutas protegidas
export function withAuth<T = any>(
  handler: (
    request: NextRequest,
    user: AuthenticatedUser,
    context?: T
  ) => Promise<NextResponse>
) {
  return async (request: NextRequest, context?: T) => {
    const user = await verifyToken(request);

    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    return handler(request, user, context);
  };
}

// Middleware para rutas que requieren rol específico
export function withRole<T = any>(
  roles: UserRole[],
  handler: (
    request: NextRequest,
    user: AuthenticatedUser,
    context?: T
  ) => Promise<NextResponse>
) {
  return async (request: NextRequest, context?: T) => {
    const user = await verifyToken(request);

    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    if (!roles.includes(user.role)) {
      return NextResponse.json(
        { error: "Forbidden - Insufficient permissions" },
        { status: 403 }
      );
    }

    return handler(request, user, context);
  };
}
