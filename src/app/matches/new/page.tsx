"use client";

import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { useEffect } from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { MatchForm } from "@/components/matches/MatchForm";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";

export default function NewMatchPage() {
  const { data: session, status } = useSession();
  const router = useRouter();

  useEffect(() => {
    if (status === "unauthenticated") {
      router.push("/auth/signin");
    }
  }, [status, router]);

  if (status === "loading") {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <p className="text-lg">Cargando...</p>
      </div>
    );
  }

  if (!session) {
    return null;
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white border-b">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-4">
            <div>
              <h1 className="text-2xl font-bold">Registrar Partido</h1>
              <p className="text-sm text-muted-foreground">
                Registra un partido informal de pickleball
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
        {/* Información */}
        <Alert variant="info" className="mb-6">
          <AlertTitle>Partido Informal</AlertTitle>
          <AlertDescription>
            Los partidos informales son partidos que registras tú mismo sin
            estar vinculados a un club específico. Puedes registrar tanto
            partidos Singles (1vs1) como Doubles (2vs2).
          </AlertDescription>
        </Alert>

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
            <MatchForm mode="create" />
          </CardContent>
        </Card>

        {/* Ayuda */}
        <Card className="mt-6">
          <CardHeader>
            <CardTitle className="text-base">
              ¿Cómo registrar participantes?
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-2 text-sm">
            <p>
              Para agregar participantes, necesitas conocer el{" "}
              <span className="font-semibold">ID de usuario</span> de cada
              jugador. Los jugadores deben estar registrados en la plataforma.
            </p>
            <p className="text-muted-foreground">
              Próximamente: búsqueda de usuarios por nombre o email para
              facilitar la selección de participantes.
            </p>
          </CardContent>
        </Card>
      </main>
    </div>
  );
}
