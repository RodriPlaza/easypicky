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
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { useToast } from "@/components/ui/use-toast";
import { api, ApiError } from "@/lib/api";
import { MatchForm } from "@/components/matches/MatchForm";
import type { Club } from "@/types/club";
import type { Court } from "@/types/court";

export default function NewClubMatchPage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const params = useParams();
  const { addToast } = useToast();

  const [club, setClub] = useState<Club | null>(null);
  const [courts, setCourts] = useState<Court[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const clubId = params.id as string;

  useEffect(() => {
    if (status === "unauthenticated") {
      router.push("/auth/signin");
    }
  }, [status, router]);

  useEffect(() => {
    if (session) {
      fetchClubData();
    }
  }, [session, clubId]);

  const fetchClubData = async () => {
    setIsLoading(true);
    try {
      // Obtener información del club
      const clubResponse = await api.get<{ club: Club }>(`/clubs/${clubId}`);
      const fetchedClub = clubResponse.club;

      // Verificar permisos
      if (
        fetchedClub.creatorId !== session?.user?.id &&
        session?.user?.role !== "SUPER_ADMIN"
      ) {
        addToast({
          title: "Acceso denegado",
          description: "Solo el creador del club puede registrar partidos",
          variant: "destructive",
        });
        router.push(`/clubs/${clubId}`);
        return;
      }

      setClub(fetchedClub);

      // Obtener pistas activas del club
      const courtsResponse = await api.get<{
        club: { id: string; name: string };
        courts: Court[];
      }>(`/clubs/${clubId}/courts?isActive=true`);

      setCourts(courtsResponse.courts);

      if (courtsResponse.courts.length === 0) {
        addToast({
          title: "Aviso",
          description:
            "El club no tiene pistas activas. Debes crear al menos una pista antes de registrar partidos.",
          variant: "warning",
        });
      }
    } catch (error) {
      if (error instanceof ApiError) {
        addToast({
          title: "Error",
          description: error.message,
          variant: "destructive",
        });
        router.push("/clubs");
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

  if (!session || !club) {
    return null;
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white border-b">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-4">
            <div>
              <h1 className="text-2xl font-bold">Registrar Partido de Club</h1>
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
        {/* Información */}
        <Alert variant="info" className="mb-6">
          <AlertTitle>Partido de Club</AlertTitle>
          <AlertDescription>
            Los partidos de club son partidos oficiales jugados en las
            instalaciones del club. Todos los participantes deben ser miembros
            activos del club. Es obligatorio seleccionar una pista.
          </AlertDescription>
        </Alert>

        {/* Alerta si no hay pistas */}
        {courts.length === 0 && (
          <Alert variant="warning" className="mb-6">
            <AlertTitle>No hay pistas disponibles</AlertTitle>
            <AlertDescription>
              Necesitas crear al menos una pista activa antes de registrar
              partidos.
              <Link href={`/clubs/${clubId}/courts`}>
                <Button variant="link" className="p-0 h-auto ml-1">
                  Ir a Pistas
                </Button>
              </Link>
            </AlertDescription>
          </Alert>
        )}

        {/* Formulario */}
        <Card>
          <CardHeader>
            <CardTitle>Información del Partido</CardTitle>
            <CardDescription>
              Completa los datos del partido. Los campos marcados con{" "}
              <span className="text-red-500">*</span> son obligatorios.
            </CardDescription>
          </CardHeader>
          <CardContent>
            {courts.length > 0 ? (
              <>
                {/* Selector de pista */}
                <div className="mb-6 p-4 bg-blue-50 rounded-lg">
                  <label className="block text-sm font-medium mb-2">
                    Selecciona una pista <span className="text-red-500">*</span>
                  </label>
                  <select
                    id="court-selector"
                    className="w-full px-3 py-2 border rounded-md"
                    defaultValue=""
                  >
                    <option value="" disabled>
                      -- Selecciona una pista --
                    </option>
                    {courts.map((court) => (
                      <option key={court.id} value={court.id}>
                        {court.name}
                      </option>
                    ))}
                  </select>
                  <p className="text-sm text-muted-foreground mt-2">
                    Selecciona la pista donde se jugará el partido. Una vez
                    seleccionada, completa el resto del formulario.
                  </p>
                </div>

                {/* Formulario de partido */}
                <MatchForm
                  mode="create"
                  clubId={clubId}
                  courtId={
                    (
                      document.getElementById(
                        "court-selector"
                      ) as HTMLSelectElement
                    )?.value
                  }
                  onSuccess={() => router.push(`/clubs/${clubId}/matches`)}
                />
              </>
            ) : (
              <div className="text-center py-8">
                <p className="text-muted-foreground mb-4">
                  No puedes registrar partidos sin pistas activas
                </p>
                <Link href={`/clubs/${clubId}/courts`}>
                  <Button>Gestionar Pistas</Button>
                </Link>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Ayuda */}
        {courts.length > 0 && (
          <Card className="mt-6">
            <CardHeader>
              <CardTitle className="text-base">
                Requisitos para partidos de club
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-2 text-sm">
              <ul className="list-disc list-inside space-y-1">
                <li>
                  Todos los participantes deben ser miembros activos del club
                </li>
                <li>Es obligatorio seleccionar una pista del club</li>
                <li>
                  Los participantes deben estar registrados en la plataforma
                  (necesitas sus IDs de usuario)
                </li>
              </ul>
              <p className="text-muted-foreground mt-4">
                Próximamente: búsqueda de miembros del club por nombre para
                facilitar la selección de participantes.
              </p>
            </CardContent>
          </Card>
        )}
      </main>
    </div>
  );
}
