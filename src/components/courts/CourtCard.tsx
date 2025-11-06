"use client";

import { Court } from "@/types/court";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

interface CourtCardProps {
  court: Court;
  clubId: string;
  canManage?: boolean;
  onEdit?: (court: Court) => void;
  onToggleActive?: (court: Court) => void;
  onDelete?: (court: Court) => void;
}

export function CourtCard({
  court,
  clubId,
  canManage = false,
  onEdit,
  onToggleActive,
  onDelete,
}: CourtCardProps) {
  return (
    <Card className={!court.isActive ? "opacity-60" : ""}>
      <CardHeader>
        <div className="flex justify-between items-start">
          <div className="flex-1">
            <CardTitle className="flex items-center gap-2">
              {court.name}
              {court.isActive ? (
                <Badge variant="success" className="text-xs">
                  Activa
                </Badge>
              ) : (
                <Badge variant="outline" className="text-xs">
                  Inactiva
                </Badge>
              )}
            </CardTitle>
            {court.description && (
              <CardDescription className="mt-2">
                {court.description}
              </CardDescription>
            )}
          </div>

          {canManage && (
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="sm">
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    width="16"
                    height="16"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  >
                    <circle cx="12" cy="12" r="1"></circle>
                    <circle cx="12" cy="5" r="1"></circle>
                    <circle cx="12" cy="19" r="1"></circle>
                  </svg>
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                {onEdit && (
                  <DropdownMenuItem onClick={() => onEdit(court)}>
                    Editar
                  </DropdownMenuItem>
                )}
                {onToggleActive && (
                  <DropdownMenuItem onClick={() => onToggleActive(court)}>
                    {court.isActive ? "Desactivar" : "Activar"}
                  </DropdownMenuItem>
                )}
                {onDelete && (
                  <>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem
                      className="text-red-600"
                      onClick={() => onDelete(court)}
                    >
                      Eliminar
                    </DropdownMenuItem>
                  </>
                )}
              </DropdownMenuContent>
            </DropdownMenu>
          )}
        </div>
      </CardHeader>

      <CardContent>
        <div className="flex gap-4 text-sm text-muted-foreground">
          {court._count && (
            <>
              <div className="flex items-center gap-1">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  width="14"
                  height="14"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                >
                  <rect x="3" y="4" width="18" height="18" rx="2" ry="2"></rect>
                  <line x1="16" y1="2" x2="16" y2="6"></line>
                  <line x1="8" y1="2" x2="8" y2="6"></line>
                  <line x1="3" y1="10" x2="21" y2="10"></line>
                </svg>
                <span>
                  {court._count.events}{" "}
                  {court._count.events === 1 ? "evento" : "eventos"}
                </span>
              </div>
              <div className="flex items-center gap-1">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  width="14"
                  height="14"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                >
                  <circle cx="12" cy="12" r="10"></circle>
                  <polyline points="12 6 12 12 16 14"></polyline>
                </svg>
                <span>
                  {court._count.matches}{" "}
                  {court._count.matches === 1 ? "partido" : "partidos"}
                </span>
              </div>
            </>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
