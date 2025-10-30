"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useSession } from "next-auth/react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { ClubForm } from "@/components/clubs/ClubForm";
import { useToast } from "@/components/ui/use-toast";
import { api, ApiError } from "@/lib/api";
import type { Club } from "@/types/club";

interface EditClubPageProps {
  params: {
    id: string;
  };
}

export default function EditClubPage({ params }: EditClubPageProps) {
  const router = useRouter();
  const { data: session, status } = useSession();
  const { addToast } = useToast();

  const [club, setClub] = useState<Club | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (status === "unauthenticated") {
      router.push("/auth/signin");
      return;
    }

    if (status === "authenticated") {
      fetchClub();
    }
  }, [status, params.id]);

  const fetchClub = async () => {
    setIsLoading(true);
    try {
      const response = await api.get<{ club: Club }>(`/clubs/${params.id}`);

      // Verificar permisos
      const isCreator = session?.user?.id === response.club.creatorId;
      const isSuperAdmin = session?.user?.role === "SUPER_ADMIN";

      if (!isCreator && !isSuperAdmin) {
        addToast({
          title: "Acceso Denegado",
          description: "No tienes permisos para editar este club",
          variant: "destructive",
        });
        router.push(`/clubs/${params.id}`);
        return;
      }

      setClub(response.club);
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
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-4">
            <Link href="/dashboard">
              <h1 className="text-2xl font-bold cursor-pointer">EasyPicky</h1>
            </Link>
            <Link href={`/clubs/${club.id}`}>
              <Button variant="outline">Cancelar</Button>
            </Link>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <Card>
          <CardHeader>
            <CardTitle>Editar Club</CardTitle>
            <CardDescription>
              Actualiza la información de {club.name}
            </CardDescription>
          </CardHeader>
          <CardContent>
            <ClubForm mode="edit" club={club} />
          </CardContent>
        </Card>
      </main>
    </div>
  );
}
