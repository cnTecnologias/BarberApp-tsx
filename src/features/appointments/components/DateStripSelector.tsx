// /src/features/appointments/components/DateStripSelector.tsx

import React, { useState, useEffect } from "react";

// Este componente es un selector horizontal de fechas que muestra los próximos días a partir de hoy.
// Es el primer paso para reservar un turno, y al seleccionar una fecha, se muestra la DailyAgenda correspondiente a ese día.

interface DateStripProps {
  selectedDate: string; // Formato esperado: YYYY-MM-DD
  onSelect: (date: string) => void;
  daysToShow?: number; // Cuántos días a futuro le dejamos reservar
}

export const DateStripSelector: React.FC<DateStripProps> = ({
  selectedDate,
  onSelect,
  daysToShow = 14,
}) => {
  const [dates, setDates] = useState<
    { iso: string; dayName: string; dayNum: number; monthName: string }[]
  >([]);

  useEffect(() => {
    const generateDates = () => {
      const result = [];
      const today = new Date();

      for (let i = 0; i < daysToShow; i++) {
        // Clonamos la fecha de hoy y le sumamos 'i' días
        const nextDate = new Date(today);
        nextDate.setDate(today.getDate() + i);

        // Armamos el ISO manual local para evitar que el UTC nos corra el día
        const year = nextDate.getFullYear();
        const month = String(nextDate.getMonth() + 1).padStart(2, "0");
        const day = String(nextDate.getDate()).padStart(2, "0");
        const iso = `${year}-${month}-${day}`;

        // Usamos la API nativa del navegador para los nombres en español
        const rawDayName = new Intl.DateTimeFormat("es-AR", {
          weekday: "short",
        }).format(nextDate);
        const rawMonthName = new Intl.DateTimeFormat("es-AR", {
          month: "short",
        }).format(nextDate);

        result.push({
          iso,
          dayName: rawDayName.charAt(0).toUpperCase() + rawDayName.slice(1), // Ej: Lun
          dayNum: nextDate.getDate(), // Ej: 17
          monthName:
            rawMonthName.charAt(0).toUpperCase() + rawMonthName.slice(1), // Ej: Mar
        });
      }
      return result;
    };

    setDates(generateDates());
  }, [daysToShow]);

  return (
    // scrollbar-hide asume que tenés ocultas las barras de scroll en tu CSS global, si no, se ve igual pero con barra
    <div className="flex overflow-x-auto gap-3 pb-4 pt-1 w-full snap-x">
      {dates.map((d) => {
        const isSelected = selectedDate === d.iso;
        return (
          <button
            key={d.iso}
            type="button"
            onClick={() => onSelect(d.iso)}
            className={`snap-start flex-shrink-0 flex flex-col items-center justify-center w-20 h-24 rounded-2xl border-2 transition-all ${
              isSelected
                ? "bg-black text-white border-black shadow-md scale-105"
                : "bg-white text-gray-500 border-gray-200 hover:border-gray-400"
            }`}
          >
            <span
              className={`text-xs font-bold uppercase ${isSelected ? "text-gray-200" : "text-gray-400"}`}
            >
              {d.dayName}
            </span>
            <span className="text-3xl font-black my-1">{d.dayNum}</span>
            <span className="text-xs font-medium">{d.monthName}</span>
          </button>
        );
      })}
    </div>
  );
};
