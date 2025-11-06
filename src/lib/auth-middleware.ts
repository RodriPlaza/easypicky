// src/lib/auth-middleware.ts

import { NextRequest, NextResponse } from "next/server";
import { verify, JsonWebTokenError, TokenExpiredError } from "jsonwebtoken";
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
      console.warn("[Auth] Missing or invalid authorization header", {
        timestamp: new Date().toISOString(),
        path: request.nextUrl.pathname,
        hasHeader: !!authHeader,
      });
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
      console.warn("[Auth] User not found in database", {
        timestamp: new Date().toISOString(),
        userId: decoded.userId,
        path: request.nextUrl.pathname,
      });
      return null;
    }

    return {
      userId: user.id,
      email: user.email,
      role: user.role,
    };
  } catch (error) {
    // Manejo específico de errores de JWT
    if (error instanceof TokenExpiredError) {
      console.warn("[Auth] Token expired", {
        timestamp: new Date().toISOString(),
        expiredAt: error.expiredAt.toISOString(),
        path: request.nextUrl.pathname,
      });
    } else if (error instanceof JsonWebTokenError) {
      console.warn("[Auth] Invalid token", {
        timestamp: new Date().toISOString(),
        error: error.message,
        path: request.nextUrl.pathname,
      });
    } else {
      // Error inesperado
      console.error("[Auth] Unexpected error during token verification", {
        timestamp: new Date().toISOString(),
        error: error instanceof Error ? error.message : "Unknown error",
        stack: error instanceof Error ? error.stack : undefined,
        path: request.nextUrl.pathname,
      });
    }
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
      console.warn("[Auth] Insufficient permissions", {
        timestamp: new Date().toISOString(),
        userId: user.userId,
        userRole: user.role,
        requiredRoles: roles,
        path: request.nextUrl.pathname,
      });
      return NextResponse.json(
        { error: "Forbidden - Insufficient permissions" },
        { status: 403 }
      );
    }

    return handler(request, user, context);
  };
}
