"use client";

import { useState, useEffect } from "react";
import { useSession } from "next-auth/react";
import { useRouter, useParams } from "next/navigation";
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

export default function EditMatchPage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const params = useParams();
  const { addToast } = useToast();

  const [match, setMatch] = useState<Match | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  const matchId = params.id as string;

  useEffect(() => {
    if (status === "unauthenticated") {
      router.push("/auth/signin");
    }
  }, [status, router]);

  useEffect(() => {
    if (session) {
      fetchMatch();
    }
  }, [session, matchId]);

  const fetchMatch = async () => {
    setIsLoading(true);
    try {
      const response = await api.get<{ match: Match }>(`/matches/${matchId}`);
      const fetchedMatch = response.match;

      // Verificar permisos
      if (fetchedMatch.creatorId !== session?.user?.id) {
        addToast({
          title: "Acceso denegado",
          description: "No tienes permisos para editar este partido",
          variant: "destructive",
        });
        router.push(`/matches/${matchId}`);
        return;
      }

      setMatch(fetchedMatch);
    } catch (error) {
      if (error instanceof ApiError) {
        addToast({
          title: "Error",
          description: error.message,
          variant: "destructive",
        });
        router.push("/my-matches");
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

  if (!session || !match) {
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
              <p className="text-sm text-muted-foreground">
                Actualiza la información del partido
              </p>
            </div>
            <Button variant="outline" onClick={() => router.back()}>
              Volver
            </Button>
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
            <MatchForm mode="edit" match={match} />
          </CardContent>
        </Card>
      </main>
    </div>
  );
}
