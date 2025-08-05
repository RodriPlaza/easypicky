// src/app/api/auth/profile/route.ts

import { NextRequest, NextResponse } from "next/server";
import { withAuth } from "@/lib/auth-middleware";
import { prisma } from "@/lib/prisma";

export const GET = withAuth(async (request: NextRequest, user) => {
  try {
    const userProfile = await prisma.user.findUnique({
      where: { id: user.userId },
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
    console.error("Profile fetch error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
});
