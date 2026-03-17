// /src/features/appointments/components/TimeSlotGrid.tsx

import React, { useMemo } from "react";
import type { Appointment } from "../types";

interface TimeSlotGridProps {
  selectedDate: string; // YYYY-MM-DD
  appointments: Appointment[];
  serviceDurationMinutes: number;
  selectedTime: string | null;
  onSelectTime: (time: string) => void;
}

export const TimeSlotGrid: React.FC<TimeSlotGridProps> = ({
  selectedDate,
  appointments,
  serviceDurationMinutes,
  selectedTime,
  onSelectTime,
}) => {
  // Horario de la barbería (Hardcodeado por ahora, después puede venir de la DB)
  const OPENING_HOUR = 10;
  const CLOSING_HOUR = 19;
  const SLOT_INTERVAL = 30; // Turnos cada 30 min

  const timeSlots = useMemo(() => {
    if (!selectedDate) return [];

    const slots = [];
    // Armamos la hora de apertura en la zona horaria local del cliente
    let currentTime = new Date(
      `${selectedDate}T${String(OPENING_HOUR).padStart(2, "0")}:00:00`,
    );
    const endTime = new Date(
      `${selectedDate}T${String(CLOSING_HOUR).padStart(2, "0")}:00:00`,
    );

    while (currentTime < endTime) {
      const timeString = currentTime.toLocaleTimeString("es-AR", {
        hour: "2-digit",
        minute: "2-digit",
        hour12: false,
      });

      // Calculamos cuándo terminaría ESTE servicio si el cliente lo elige
      const potentialEndTime = new Date(currentTime);
      potentialEndTime.setMinutes(
        currentTime.getMinutes() + serviceDurationMinutes,
      );

      // Motor de Colisiones: ¿Choca este bloque de tiempo con algún turno de la DB?
      const isOccupied = appointments.some((app) => {
        const appStart = new Date(app.startTime);
        const appEnd = new Date(app.endTime);

        // La lógica: Un turno se superpone si empieza antes de que termine el nuestro,
        // y termina después de que empiece el nuestro.
        return currentTime < appEnd && potentialEndTime > appStart;
      });

      slots.push({ time: timeString, isOccupied });

      // Avanzamos 30 minutos para el próximo botón
      currentTime.setMinutes(currentTime.getMinutes() + SLOT_INTERVAL);
    }

    return slots;
  }, [selectedDate, appointments, serviceDurationMinutes]);

  if (!selectedDate)
    return (
      <p className="text-gray-500 text-sm">
        Elegí un día para ver los horarios.
      </p>
    );

  return (
    <div className="grid grid-cols-3 gap-3">
      {timeSlots.map(({ time, isOccupied }) => (
        <button
          key={time}
          type="button"
          disabled={isOccupied}
          onClick={() => onSelectTime(time)}
          className={`py-3 rounded-xl font-bold text-sm transition-all ${
            isOccupied
              ? "bg-gray-100 text-gray-400 cursor-not-allowed opacity-60 line-through"
              : time === selectedTime
                ? "bg-black text-white shadow-md scale-105"
                : "bg-white border-2 border-gray-200 text-gray-700 hover:border-black"
          }`}
        >
          {time}
        </button>
      ))}
    </div>
  );
};
