"use client";

import { useState, useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ClubCard } from "@/components/clubs/ClubCard";
import { useToast } from "@/components/ui/use-toast";
import { api, ApiError } from "@/lib/api";
import type { ClubsResponse } from "@/types/club";

export default function ClubsPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { addToast } = useToast();

  const [data, setData] = useState<ClubsResponse | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [searchCity, setSearchCity] = useState(searchParams.get("city") || "");
  const [searchQuery, setSearchQuery] = useState(
    searchParams.get("search") || ""
  );

  const currentPage = parseInt(searchParams.get("page") || "1");

  const fetchClubs = async (page = 1) => {
    setIsLoading(true);
    try {
      const params = new URLSearchParams();
      params.append("page", page.toString());
      params.append("limit", "12");

      if (searchCity) params.append("city", searchCity);
      if (searchQuery) params.append("search", searchQuery);

      const response = await api.get<ClubsResponse>(
        `/clubs?${params.toString()}`,
        { requiresAuth: false }
      );
      setData(response);
    } catch (error) {
      if (error instanceof ApiError) {
        addToast({
          title: "Error",
          description: error.message,
          variant: "destructive",
        });
      }
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchClubs(currentPage);
  }, [currentPage, searchParams]);

  const handleSearch = () => {
    const params = new URLSearchParams();
    if (searchCity) params.append("city", searchCity);
    if (searchQuery) params.append("search", searchQuery);
    params.append("page", "1");

    router.push(`/clubs?${params.toString()}`);
  };

  const handlePageChange = (newPage: number) => {
    const params = new URLSearchParams(searchParams.toString());
    params.set("page", newPage.toString());
    router.push(`/clubs?${params.toString()}`);
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-4">
            <Link href="/dashboard">
              <h1 className="text-2xl font-bold cursor-pointer">EasyPicky</h1>
            </Link>
            <div className="flex gap-2">
              <Link href="/dashboard">
                <Button variant="outline">Volver al Dashboard</Button>
              </Link>
              <Link href="/clubs/new">
                <Button>Crear Club</Button>
              </Link>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-8">
          <h2 className="text-3xl font-bold mb-2">Clubes de Pickleball</h2>
          <p className="text-muted-foreground">
            Descubre clubes cerca de ti y únete a la comunidad
          </p>
        </div>

        {/* Search and Filters */}
        <div className="bg-white p-6 rounded-lg shadow-sm mb-8">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Input
              placeholder="Buscar por nombre..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              onKeyPress={(e) => e.key === "Enter" && handleSearch()}
            />
            <Input
              placeholder="Ciudad..."
              value={searchCity}
              onChange={(e) => setSearchCity(e.target.value)}
              onKeyPress={(e) => e.key === "Enter" && handleSearch()}
            />
            <Button onClick={handleSearch}>Buscar</Button>
          </div>
        </div>

        {/* Loading State */}
        {isLoading && (
          <div className="text-center py-12">
            <p className="text-lg text-muted-foreground">Cargando clubes...</p>
          </div>
        )}

        {/* Empty State */}
        {!isLoading && data && data.clubs.length === 0 && (
          <div className="text-center py-12">
            <p className="text-lg text-muted-foreground mb-4">
              No se encontraron clubes
            </p>
            <Link href="/clubs/new">
              <Button>Crear el Primer Club</Button>
            </Link>
          </div>
        )}

        {/* Clubs Grid */}
        {!isLoading && data && data.clubs.length > 0 && (
          <>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
              {data.clubs.map((club) => (
                <ClubCard key={club.id} club={club} />
              ))}
            </div>

            {/* Pagination */}
            {data.pagination.totalPages > 1 && (
              <div className="flex justify-center items-center gap-2">
                <Button
                  variant="outline"
                  onClick={() => handlePageChange(currentPage - 1)}
                  disabled={!data.pagination.hasPreviousPage}
                >
                  Anterior
                </Button>
                <span className="text-sm text-muted-foreground">
                  Página {data.pagination.page} de {data.pagination.totalPages}
                </span>
                <Button
                  variant="outline"
                  onClick={() => handlePageChange(currentPage + 1)}
                  disabled={!data.pagination.hasNextPage}
                >
                  Siguiente
                </Button>
              </div>
            )}
          </>
        )}
      </main>
    </div>
  );
}
