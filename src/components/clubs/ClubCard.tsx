"use client";

import { useState } from "react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/components/ui/use-toast";
import { api, ApiError } from "@/lib/api";
import type { Club } from "@/types/club";

interface ClubCardProps {
  club: Club;
  membershipStatus?: "ACTIVE" | "INACTIVE" | "PENDING" | "CANCELLED" | null;
  onMembershipChange?: () => void;
}

export function ClubCard({
  club,
  membershipStatus,
  onMembershipChange,
}: ClubCardProps) {
  const { data: session } = useSession();
  const router = useRouter();
  const { addToast } = useToast();
  const [isJoining, setIsJoining] = useState(false);

  const handleJoinClub = async () => {
    if (!session) {
      router.push("/auth/signin");
      return;
    }

    setIsJoining(true);
    try {
      await api.post(`/clubs/${club.id}/join`);

      addToast({
        title: "¡Solicitud enviada!",
        description:
          "Tu solicitud para unirte al club ha sido enviada. Espera la aprobación del administrador.",
        variant: "success",
      });

      if (onMembershipChange) {
        onMembershipChange();
      }
    } catch (error) {
      if (error instanceof ApiError) {
        addToast({
          title: "Error",
          description: error.message,
          variant: "destructive",
        });
      }
    } finally {
      setIsJoining(false);
    }
  };

  const getMembershipButton = () => {
    if (!membershipStatus) {
      return (
        <Button
          variant="default"
          size="sm"
          onClick={handleJoinClub}
          disabled={isJoining}
        >
          {isJoining ? "Enviando..." : "Unirse"}
        </Button>
      );
    }

    switch (membershipStatus) {
      case "ACTIVE":
        return (
          <Badge variant="success" className="cursor-default">
            Miembro
          </Badge>
        );
      case "PENDING":
        return (
          <Badge variant="warning" className="cursor-default">
            Pendiente
          </Badge>
        );
      case "INACTIVE":
      case "CANCELLED":
        return (
          <Button
            variant="outline"
            size="sm"
            onClick={handleJoinClub}
            disabled={isJoining}
          >
            {isJoining ? "Enviando..." : "Volver a unirse"}
          </Button>
        );
    }
  };

  return (
    <Card className="h-full flex flex-col">
      <CardHeader>
        <div className="flex items-start justify-between">
          <div className="flex-1">
            <CardTitle className="text-lg">{club.name}</CardTitle>
            <CardDescription className="mt-1">{club.city}</CardDescription>
          </div>
          {club.logo && (
            <img
              src={club.logo}
              alt={club.name}
              className="w-12 h-12 rounded-lg object-cover"
            />
          )}
        </div>
      </CardHeader>
      <CardContent className="flex-1 flex flex-col">
        {club.description && (
          <p className="text-sm text-muted-foreground mb-4 line-clamp-2">
            {club.description}
          </p>
        )}

        <div className="flex gap-4 text-sm text-muted-foreground mb-4">
          <div>
            <span className="font-semibold">
              {club._count?.memberships || 0}
            </span>{" "}
            miembros
          </div>
          <div>
            <span className="font-semibold">{club._count?.courts || 0}</span>{" "}
            pistas
          </div>
          <div>
            <span className="font-semibold">{club._count?.events || 0}</span>{" "}
            eventos
          </div>
        </div>

        <div className="mt-auto flex gap-2">
          <Link href={`/clubs/${club.id}`} className="flex-1">
            <Button variant="outline" className="w-full">
              Ver Detalles
            </Button>
          </Link>
          {session && getMembershipButton()}
        </div>
      </CardContent>
    </Card>
  );
}
