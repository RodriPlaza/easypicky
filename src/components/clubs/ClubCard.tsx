"use client";

import Link from "next/link";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import type { Club } from "@/types/club";

interface ClubCardProps {
  club: Club;
}

export function ClubCard({ club }: ClubCardProps) {
  return (
    <Card className="hover:shadow-lg transition-shadow">
      <CardHeader>
        <div className="flex items-start justify-between">
          <div className="flex-1">
            <CardTitle className="text-xl mb-1">{club.name}</CardTitle>
            <CardDescription className="flex items-center gap-2">
              <span>📍 {club.city}</span>
            </CardDescription>
          </div>
          {club.logo && (
            <img
              src={club.logo}
              alt={`Logo de ${club.name}`}
              className="w-12 h-12 rounded-full object-cover"
            />
          )}
        </div>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {club.description && (
            <p className="text-sm text-muted-foreground line-clamp-2">
              {club.description}
            </p>
          )}

          <div className="text-sm space-y-1">
            <p className="text-muted-foreground">{club.address}</p>
            {club.phone && (
              <p className="text-muted-foreground">📞 {club.phone}</p>
            )}
          </div>

          {club._count && (
            <div className="flex gap-2 flex-wrap">
              <Badge variant="secondary">
                👥 {club._count.memberships} miembros
              </Badge>
              <Badge variant="secondary">🎾 {club._count.courts} pistas</Badge>
              <Badge variant="secondary">📅 {club._count.events} eventos</Badge>
            </div>
          )}

          <div className="pt-2">
            <Link href={`/clubs/${club.id}`}>
              <Button className="w-full">Ver Detalles</Button>
            </Link>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
