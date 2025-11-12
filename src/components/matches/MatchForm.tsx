"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import * as z from "zod";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from "@/components/ui/use-toast";
import { api, ApiError } from "@/lib/api";
import type {
  Match,
  CreateMatchData,
  UpdateMatchData,
  CreateClubMatchData,
  CreateMatchParticipantData,
} from "@/types/match";
import { Badge } from "@/components/ui/badge";
import { MatchType } from "@prisma/client";

// Esquema de validación para score
const scoreRegex = /^\d{1,2}-\d{1,2}(,\d{1,2}-\d{1,2}){0,4}$/;

const matchSchema = z
  .object({
    matchType: z.enum(["SINGLES", "DOUBLES"], {
      message: "Selecciona el tipo de partido",
    }),
    startTime: z.string().optional(),
    endTime: z.string().optional(),
    score: z
      .string()
      .regex(scoreRegex, "Formato inválido. Ejemplo: 21-19,19-21,11-9")
      .optional()
      .or(z.literal("")),
    completed: z.boolean().default(false),
    courtId: z.string().optional(),
    eventId: z.string().optional(),
    // Participantes
    participant1UserId: z.string().min(1, "Participante 1 requerido"),
    participant2UserId: z.string().min(1, "Participante 2 requerido"),
    participant3UserId: z.string().optional(),
    participant4UserId: z.string().optional(),
    // Ganadores
    team1Winner: z.boolean().default(false),
    team2Winner: z.boolean().default(false),
  })
  .refine(
    (data) => {
      // Si es SINGLES, solo debe haber 2 participantes
      if (data.matchType === "SINGLES") {
        return !data.participant3UserId && !data.participant4UserId;
      }
      return true;
    },
    {
      message: "En partidos SINGLES solo puede haber 2 participantes",
      path: ["matchType"],
    }
  )
  .refine(
    (data) => {
      // Si es DOUBLES, debe haber 4 participantes
      if (data.matchType === "DOUBLES") {
        return data.participant3UserId && data.participant4UserId;
      }
      return true;
    },
    {
      message: "En partidos DOUBLES debe haber 4 participantes",
      path: ["matchType"],
    }
  )
  .refine(
    (data) => {
      // Los participantes no pueden repetirse
      const ids = [
        data.participant1UserId,
        data.participant2UserId,
        data.participant3UserId,
        data.participant4UserId,
      ].filter(Boolean);
      return new Set(ids).size === ids.length;
    },
    {
      message: "No puede haber participantes duplicados",
      path: ["participant2UserId"],
    }
  )
  .refine(
    (data) => {
      // Solo un equipo puede ser ganador
      if (data.team1Winner && data.team2Winner) {
        return false;
      }
      return true;
    },
    {
      message: "Solo un equipo puede ser el ganador",
      path: ["team1Winner"],
    }
  )
  .refine(
    (data) => {
      // Si endTime está definido, debe ser mayor que startTime
      if (data.startTime && data.endTime) {
        return new Date(data.endTime) > new Date(data.startTime);
      }
      return true;
    },
    {
      message: "La hora de fin debe ser posterior a la hora de inicio",
      path: ["endTime"],
    }
  );

type MatchFormData = z.infer<typeof matchSchema>;

interface MatchFormProps {
  match?: Match;
  mode: "create" | "edit";
  clubId?: string; // Si está presente, es un partido de club
  courtId?: string; // Court ID predefinido (para partidos de club)
  eventId?: string; // Event ID predefinido
  onSuccess?: () => void;
}

export function MatchForm({
  match,
  mode,
  clubId,
  courtId,
  eventId,
  onSuccess,
}: MatchFormProps) {
  const router = useRouter();
  const { addToast } = useToast();
  const [isLoading, setIsLoading] = useState(false);

  const isClubMatch = !!clubId;

  const {
    register,
    handleSubmit,
    watch,
    setValue,
    formState: { errors },
  } = useForm<MatchFormData>({
    resolver: zodResolver(matchSchema) as any,
    defaultValues: match
      ? {
          matchType: match.matchType,
          startTime: match.startTime
            ? new Date(match.startTime).toISOString().slice(0, 16)
            : undefined,
          endTime: match.endTime
            ? new Date(match.endTime).toISOString().slice(0, 16)
            : undefined,
          score: match.score || "",
          completed: match.completed,
          courtId: match.courtId || courtId,
          eventId: match.eventId || eventId,
          participant1UserId: match.participants[0]?.userId || "",
          participant2UserId: match.participants[1]?.userId || "",
          participant3UserId: match.participants[2]?.userId || "",
          participant4UserId: match.participants[3]?.userId || "",
          team1Winner:
            match.participants.some((p) => p.team === 1 && p.isWinner) || false,
          team2Winner:
            match.participants.some((p) => p.team === 2 && p.isWinner) || false,
        }
      : {
          matchType: "SINGLES",
          completed: false,
          courtId: courtId,
          eventId: eventId,
          team1Winner: false,
          team2Winner: false,
        },
  });

  const matchType = watch("matchType");
  const team1Winner = watch("team1Winner");
  const team2Winner = watch("team2Winner");

  // Sincronizar ganadores: si se marca un equipo, desmarcar el otro
  useEffect(() => {
    if (team1Winner) {
      setValue("team2Winner", false);
    }
  }, [team1Winner, setValue]);

  useEffect(() => {
    if (team2Winner) {
      setValue("team1Winner", false);
    }
  }, [team2Winner, setValue]);

  const onSubmit = async (data: MatchFormData) => {
    setIsLoading(true);

    try {
      // Construir array de participantes
      const participants: CreateMatchParticipantData[] = [];

      // Team 1
      if (data.participant1UserId) {
        participants.push({
          userId: data.participant1UserId,
          team: 1,
          isWinner: data.team1Winner,
        });
      }

      if (data.participant3UserId) {
        participants.push({
          userId: data.participant3UserId,
          team: 1,
          isWinner: data.team1Winner,
        });
      }

      // Team 2
      if (data.participant2UserId) {
        participants.push({
          userId: data.participant2UserId,
          team: 2,
          isWinner: data.team2Winner,
        });
      }

      if (data.participant4UserId) {
        participants.push({
          userId: data.participant4UserId,
          team: 2,
          isWinner: data.team2Winner,
        });
      }

      const matchData = {
        matchType: data.matchType,
        startTime: data.startTime || undefined,
        endTime: data.endTime || undefined,
        score: data.score || undefined,
        completed: data.completed,
        courtId: data.courtId || undefined,
        eventId: data.eventId || undefined,
        participants,
      };

      if (mode === "create") {
        if (isClubMatch) {
          // Crear partido de club
          const clubMatchData: CreateClubMatchData = {
            ...matchData,
            courtId: data.courtId!, // Obligatorio en partidos de club
          };
          await api.post(`/clubs/${clubId}/matches`, clubMatchData);
        } else {
          // Crear partido informal
          await api.post<{ match: Match }>("/matches", matchData);
        }

        addToast({
          title: "¡Éxito!",
          description: "Partido registrado correctamente",
          variant: "success",
        });

        if (onSuccess) {
          onSuccess();
        } else {
          router.push("/my-matches");
        }
      } else {
        // Actualizar partido
        const updateData: UpdateMatchData = {
          matchType: data.matchType,
          startTime: data.startTime || undefined,
          endTime: data.endTime || undefined,
          score: data.score || undefined,
          completed: data.completed,
          courtId: data.courtId || undefined,
          participants,
        };

        if (isClubMatch) {
          await api.put(`/clubs/${clubId}/matches/${match?.id}`, updateData);
        } else {
          await api.put(`/matches/${match?.id}`, updateData);
        }

        addToast({
          title: "¡Éxito!",
          description: "Partido actualizado correctamente",
          variant: "success",
        });

        if (onSuccess) {
          onSuccess();
        } else {
          router.back();
        }
      }
    } catch (error) {
      if (error instanceof ApiError) {
        addToast({
          title: "Error",
          description: error.message,
          variant: "destructive",
        });
      } else {
        addToast({
          title: "Error",
          description: "Ocurrió un error inesperado",
          variant: "destructive",
        });
      }
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
      {/* Tipo de Partido */}
      <div className="space-y-2">
        <Label>
          Tipo de Partido <span className="text-red-500">*</span>
        </Label>
        <div className="flex gap-4">
          <label className="flex items-center gap-2 cursor-pointer">
            <input
              type="radio"
              value="SINGLES"
              {...register("matchType")}
              disabled={isLoading}
              className="w-4 h-4"
            />
            <span>Singles (1vs1)</span>
          </label>
          <label className="flex items-center gap-2 cursor-pointer">
            <input
              type="radio"
              value="DOUBLES"
              {...register("matchType")}
              disabled={isLoading}
              className="w-4 h-4"
            />
            <span>Doubles (2vs2)</span>
          </label>
        </div>
        {errors.matchType && (
          <p className="text-sm text-red-600">{errors.matchType.message}</p>
        )}
      </div>

      {/* Participantes */}
      <div className="space-y-4">
        <div className="flex items-center gap-2">
          <Label className="text-lg font-semibold">Participantes</Label>
          <Badge variant="info">
            {matchType === "SINGLES" ? "2 jugadores" : "4 jugadores"}
          </Badge>
        </div>

        {/* Team 1 */}
        <div className="border rounded-lg p-4 space-y-3">
          <div className="flex items-center justify-between">
            <Label className="font-semibold text-blue-600">Equipo 1</Label>
            <label className="flex items-center gap-2 cursor-pointer">
              <input
                type="checkbox"
                {...register("team1Winner")}
                disabled={isLoading}
                className="w-4 h-4"
              />
              <span className="text-sm">Ganador</span>
            </label>
          </div>

          <div className="space-y-2">
            <Label htmlFor="participant1">
              Jugador 1 (ID) <span className="text-red-500">*</span>
            </Label>
            <Input
              id="participant1"
              placeholder="ID del usuario"
              {...register("participant1UserId")}
              disabled={isLoading}
            />
            {errors.participant1UserId && (
              <p className="text-sm text-red-600">
                {errors.participant1UserId.message}
              </p>
            )}
          </div>

          {matchType === "DOUBLES" && (
            <div className="space-y-2">
              <Label htmlFor="participant3">
                Jugador 2 (ID) <span className="text-red-500">*</span>
              </Label>
              <Input
                id="participant3"
                placeholder="ID del usuario"
                {...register("participant3UserId")}
                disabled={isLoading}
              />
              {errors.participant3UserId && (
                <p className="text-sm text-red-600">
                  {errors.participant3UserId.message}
                </p>
              )}
            </div>
          )}
        </div>

        {/* Team 2 */}
        <div className="border rounded-lg p-4 space-y-3">
          <div className="flex items-center justify-between">
            <Label className="font-semibold text-green-600">Equipo 2</Label>
            <label className="flex items-center gap-2 cursor-pointer">
              <input
                type="checkbox"
                {...register("team2Winner")}
                disabled={isLoading}
                className="w-4 h-4"
              />
              <span className="text-sm">Ganador</span>
            </label>
          </div>

          <div className="space-y-2">
            <Label htmlFor="participant2">
              Jugador 1 (ID) <span className="text-red-500">*</span>
            </Label>
            <Input
              id="participant2"
              placeholder="ID del usuario"
              {...register("participant2UserId")}
              disabled={isLoading}
            />
            {errors.participant2UserId && (
              <p className="text-sm text-red-600">
                {errors.participant2UserId.message}
              </p>
            )}
          </div>

          {matchType === "DOUBLES" && (
            <div className="space-y-2">
              <Label htmlFor="participant4">
                Jugador 2 (ID) <span className="text-red-500">*</span>
              </Label>
              <Input
                id="participant4"
                placeholder="ID del usuario"
                {...register("participant4UserId")}
                disabled={isLoading}
              />
              {errors.participant4UserId && (
                <p className="text-sm text-red-600">
                  {errors.participant4UserId.message}
                </p>
              )}
            </div>
          )}
        </div>
      </div>

      {/* Resultado */}
      <div className="space-y-2">
        <Label htmlFor="score">
          Resultado
          <span className="text-muted-foreground text-sm ml-2">
            (Formato: 21-19,19-21,11-9)
          </span>
        </Label>
        <Input
          id="score"
          placeholder="21-19,19-21,11-9"
          {...register("score")}
          disabled={isLoading}
        />
        {errors.score && (
          <p className="text-sm text-red-600">{errors.score.message}</p>
        )}
      </div>

      {/* Fechas */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="startTime">Hora de inicio</Label>
          <Input
            id="startTime"
            type="datetime-local"
            {...register("startTime")}
            disabled={isLoading}
          />
          {errors.startTime && (
            <p className="text-sm text-red-600">{errors.startTime.message}</p>
          )}
        </div>

        <div className="space-y-2">
          <Label htmlFor="endTime">Hora de fin</Label>
          <Input
            id="endTime"
            type="datetime-local"
            {...register("endTime")}
            disabled={isLoading}
          />
          {errors.endTime && (
            <p className="text-sm text-red-600">{errors.endTime.message}</p>
          )}
        </div>
      </div>

      {/* IDs opcionales (solo en modo edición o si no están predefinidos) */}
      {!courtId && !isClubMatch && (
        <div className="space-y-2">
          <Label htmlFor="courtId">Court ID (opcional)</Label>
          <Input
            id="courtId"
            placeholder="ID de la pista"
            {...register("courtId")}
            disabled={isLoading}
          />
        </div>
      )}

      {!eventId && (
        <div className="space-y-2">
          <Label htmlFor="eventId">Event ID (opcional)</Label>
          <Input
            id="eventId"
            placeholder="ID del evento"
            {...register("eventId")}
            disabled={isLoading}
          />
        </div>
      )}

      {/* Completado */}
      <div className="flex items-center gap-2">
        <input
          type="checkbox"
          id="completed"
          {...register("completed")}
          disabled={isLoading}
          className="w-4 h-4"
        />
        <Label htmlFor="completed" className="cursor-pointer">
          Marcar como completado
        </Label>
      </div>

      {/* Botones */}
      <div className="flex gap-4">
        <Button
          type="button"
          variant="outline"
          onClick={() => (onSuccess ? onSuccess() : router.back())}
          disabled={isLoading}
        >
          Cancelar
        </Button>
        <Button type="submit" disabled={isLoading}>
          {isLoading
            ? mode === "create"
              ? "Registrando..."
              : "Guardando..."
            : mode === "create"
            ? "Registrar Partido"
            : "Guardar Cambios"}
        </Button>
      </div>
    </form>
  );
}
