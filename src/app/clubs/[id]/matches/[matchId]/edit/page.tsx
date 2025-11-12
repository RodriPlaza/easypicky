"use client";

import { useState, useEffect } from "react";
import { useSession } from "next-auth/react";
import { useRouter, useParams } from "next/navigation";
import Link from "next/link";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useToast } from "@/components/ui/use-toast";
import { api, ApiError } from "@/lib/api";
import { MatchForm } from "@/components/matches/MatchForm";
import type { Match } from "@/types/match";
import type { Club } from "@/types/club";
import type { Court } from "@/types/court";

export default function EditClubMatchPage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const params = useParams();
  const { addToast } = useToast();

  const [club, setClub] = useState<Club | null>(null);
  const [match, setMatch] = useState<Match | null>(null);
  const [courts, setCourts] = useState<Court[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const clubId = params.id as string;
  const matchId = params.matchId as string;

  useEffect(() => {
    if (status === "unauthenticated") {
      router.push("/auth/signin");
    }
  }, [status, router]);

  useEffect(() => {
    if (session) {
      fetchData();
    }
  }, [session, clubId, matchId]);

  const fetchData = async () => {
    setIsLoading(true);
    try {
      // Obtener información del club
      const clubResponse = await api.get<{ club: Club }>(`/clubs/${clubId}`);
      const fetchedClub = clubResponse.club;
      setClub(fetchedClub);

      // Obtener partido
      const matchResponse = await api.get<{ match: Match }>(
        `/clubs/${clubId}/matches/${matchId}`
      );
      const fetchedMatch = matchResponse.match;

      // Verificar permisos
      if (
        fetchedClub.creatorId !== session?.user?.id &&
        session?.user?.role !== "SUPER_ADMIN"
      ) {
        addToast({
          title: "Acceso denegado",
          description: "Solo el creador del club puede editar partidos",
          variant: "destructive",
        });
        router.push(`/clubs/${clubId}/matches`);
        return;
      }

      setMatch(fetchedMatch);

      // Obtener pistas activas del club
      const courtsResponse = await api.get<{
        club: { id: string; name: string };
        courts: Court[];
      }>(`/clubs/${clubId}/courts?isActive=true`);

      setCourts(courtsResponse.courts);
    } catch (error) {
      if (error instanceof ApiError) {
        addToast({
          title: "Error",
          description: error.message,
          variant: "destructive",
        });
        router.push(`/clubs/${clubId}/matches`);
      }
    } finally {
      setIsLoading(false);
    }
  };

  if (status === "loading" || isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <p className="text-lg">Cargando...</p>
      </div>
    );
  }

  if (!session || !club || !match) {
    return null;
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white border-b">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-4">
            <div>
              <h1 className="text-2xl font-bold">Editar Partido</h1>
              <p className="text-sm text-muted-foreground">{club.name}</p>
            </div>
            <Link href={`/clubs/${clubId}/matches`}>
              <Button variant="outline">Volver</Button>
            </Link>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <Card>
          <CardHeader>
            <CardTitle>Información del Partido</CardTitle>
            <CardDescription>
              Modifica los datos del partido. Los campos marcados con{" "}
              <span className="text-red-500">*</span> son obligatorios.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <MatchForm
              mode="edit"
              match={match}
              clubId={clubId}
              onSuccess={() => router.push(`/clubs/${clubId}/matches`)}
            />
          </CardContent>
        </Card>
      </main>
    </div>
  );
}
