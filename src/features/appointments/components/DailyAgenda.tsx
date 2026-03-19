import React from "react";
import { type Appointment, AppointmentStatus } from "../types";

interface DailyAgendaProps {
  appointments: Appointment[];
  currentDate: string;
  startHour?: number;
  endHour?: number;
  onTimeSlotClick: (time: string) => void;
  onAppointmentClick: (appointment: Appointment) => void;
}

const generateTimeSlots = (start: number, end: number): string[] => {
  const slots: string[] = [];
  for (let i = start; i < end; i++) {
    const hour = i.toString().padStart(2, "0");
    slots.push(`${hour}:00`);
    slots.push(`${hour}:30`);
  }
  return slots;
};

// La Bomba Desactivada: Mapeo de colores dual (Claro / Oscuro) con opacidades controladas
const statusColors: Record<AppointmentStatus, string> = {
  [AppointmentStatus.PENDING]:
    "bg-yellow-50 hover:bg-yellow-100 border-yellow-300 dark:bg-yellow-900/20 dark:border-yellow-700 dark:hover:bg-yellow-900/40 dark:text-yellow-100",
  [AppointmentStatus.CONFIRMED]:
    "bg-green-50 hover:bg-green-100 border-green-400 dark:bg-green-900/20 dark:border-green-700 dark:hover:bg-green-900/40 dark:text-green-100",
  [AppointmentStatus.CANCELLED]:
    "bg-red-50 border-red-200 opacity-60 grayscale hover:grayscale-0 dark:bg-red-950/30 dark:border-red-900/50 dark:text-red-200",
  [AppointmentStatus.COMPLETED]:
    "bg-gray-100 border-gray-300 opacity-70 dark:bg-gray-800/50 dark:border-gray-700 dark:text-gray-300",
  [AppointmentStatus.NO_SHOW]:
    "bg-orange-50 hover:bg-orange-100 border-orange-400 dark:bg-orange-900/20 dark:border-orange-700 dark:hover:bg-orange-900/40 dark:text-orange-100",
};

export const DailyAgenda: React.FC<DailyAgendaProps> = ({
  appointments,
  currentDate,
  startHour = 10,
  endHour = 20,
  onTimeSlotClick,
  onAppointmentClick,
}) => {
  const timeSlots = generateTimeSlots(startHour, endHour);

  const getAppointmentsForSlot = (slotTime: string) => {
    return appointments.filter((app) => {
      const appDate = new Date(app.startTime);
      const appTime = `${appDate.getHours().toString().padStart(2, "0")}:${appDate.getMinutes().toString().padStart(2, "0")}`;
      return appTime === slotTime;
    });
  };

  const formattedDate = new Date(`${currentDate}T00:00:00`).toLocaleDateString(
    "es-AR",
    {
      weekday: "long",
      day: "numeric",
      month: "long",
    },
  );

  return (
    <div className="w-full mx-auto bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 overflow-hidden transition-colors">
      {/* HEADER */}
      <div className="bg-gray-50 dark:bg-gray-900/50 px-6 py-4 border-b border-gray-200 dark:border-gray-700 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2 transition-colors">
        <h2 className="text-xl font-black text-gray-800 dark:text-gray-100 flex items-baseline gap-3">
          Agenda del Día
          {currentDate && (
            <span className="text-sm font-semibold text-blue-600 dark:text-blue-400 capitalize">
              {formattedDate}
            </span>
          )}
        </h2>
        <span className="text-xs font-bold uppercase tracking-wider text-gray-500 dark:text-gray-400 bg-gray-200 dark:bg-gray-700 px-2 py-1 rounded transition-colors">
          Bloques de 30 min
        </span>
      </div>

      {/* TABLERO GRID */}
      <div className="p-4 grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4 bg-gray-50 dark:bg-gray-900 min-h-[500px] overflow-y-auto transition-colors">
        {timeSlots.map((time) => {
          const slotAppointments = getAppointmentsForSlot(time);

          return (
            <div key={time} className="h-32">
              {slotAppointments.length === 0 ? (
                /* CUADRADO VACÍO */
                <div
                  onClick={() => onTimeSlotClick(time)}
                  className="w-full h-full border-2 border-dashed border-gray-300 dark:border-gray-700 rounded-xl flex flex-col justify-center items-center cursor-pointer hover:border-blue-400 dark:hover:border-blue-500 hover:bg-blue-50 dark:hover:bg-blue-900/20 transition-all group"
                >
                  <span className="text-xl font-black text-gray-400 dark:text-gray-600 group-hover:text-blue-500 dark:group-hover:text-blue-400 transition-colors">
                    {time}
                  </span>
                  <span className="text-xs font-bold text-gray-400 dark:text-gray-500 group-hover:text-blue-500 dark:group-hover:text-blue-400 mt-1 opacity-0 group-hover:opacity-100 transition-opacity">
                    + Nuevo Turno
                  </span>
                </div>
              ) : (
                /* CUADRADO OCUPADO */
                <div className="w-full h-full relative">
                  {slotAppointments.map((app) => (
                    <div
                      key={app.id}
                      onClick={() => onAppointmentClick(app)}
                      className={`w-full h-full p-4 rounded-xl border-2 cursor-pointer transition-all shadow-sm hover:shadow-md flex flex-col justify-between ${statusColors[app.status]}`}
                    >
                      <div className="flex justify-between items-start">
                        <span className="text-lg font-black text-gray-900 dark:text-white transition-colors">
                          {time}
                        </span>
                        <span className="text-[9px] uppercase tracking-wider font-bold opacity-80 border border-current px-1.5 py-0.5 rounded bg-white dark:bg-black bg-opacity-50 dark:bg-opacity-30">
                          {app.status}
                        </span>
                      </div>

                      <div>
                        <p className="font-bold text-sm text-gray-900 dark:text-gray-100 capitalize truncate transition-colors">
                          {app.customerName || "Sin nombre"}
                        </p>
                        <p className="text-xs font-semibold text-gray-600 dark:text-gray-400 truncate transition-colors">
                          {app.services?.map((s) => s.name).join(" + ") ||
                            "Sin servicios"}
                        </p>
                      </div>

                      <div className="text-right">
                        <span className="text-sm font-black text-green-700 dark:text-green-400 transition-colors">
                          ${app.totalPrice}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
};
