import React from "react";
import { type Appointment, AppointmentStatus } from "../types";

interface DailyAgendaProps {
  appointments: Appointment[];
  startHour?: number; // Ej: 9 (09:00 AM)
  endHour?: number; // Ej: 20 (08:00 PM)
  onTimeSlotClick: (time: string) => void;
  onAppointmentClick: (appointment: Appointment) => void;
}

// Generador puro de bloques horarios para no depender de date-fns/moment en la vista
const generateTimeSlots = (start: number, end: number): string[] => {
  const slots: string[] = [];
  for (let i = start; i < end; i++) {
    const hour = i.toString().padStart(2, "0");
    slots.push(`${hour}:00`);
    slots.push(`${hour}:30`);
  }
  return slots;
};

// Mapeo estricto de colores. Si agregás un estado nuevo al Enum y te olvidás de agregarlo acá, TypeScript va a chillar.
const statusColors: Record<AppointmentStatus, string> = {
  [AppointmentStatus.PENDING]:
    "bg-yellow-100 border-yellow-400 text-yellow-800",
  [AppointmentStatus.CONFIRMED]:
    "bg-green-100 border-green-500 text-green-900 font-medium",
  [AppointmentStatus.CANCELLED]:
    "bg-red-50 border-red-200 text-red-500 line-through",
  [AppointmentStatus.COMPLETED]: "bg-gray-100 border-gray-400 text-gray-600",
  [AppointmentStatus.NO_SHOW]:
    "bg-red-200 border-red-600 text-red-900 font-bold",
};

export const DailyAgenda: React.FC<DailyAgendaProps> = ({
  appointments,
  startHour = 9,
  endHour = 20,
  onTimeSlotClick,
  onAppointmentClick,
}) => {
  const timeSlots = generateTimeSlots(startHour, endHour);

  // Filtramos y agrupamos turnos por hora de inicio para renderizado rápido (O(n) en vez de O(n^2) en el map)
  const getAppointmentsForSlot = (slotTime: string) => {
    return appointments.filter((app) => {
      const appDate = new Date(app.startTime);
      const appTime = `${appDate.getUTCHours().toString().padStart(2, "0")}:${appDate.getUTCMinutes().toString().padStart(2, "0")}`;
      return appTime === slotTime;
    });
  };

  return (
    <div className="w-full max-w-4xl mx-auto bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
      <div className="bg-gray-50 px-6 py-4 border-b border-gray-200 flex justify-between items-center">
        <h2 className="text-lg font-bold text-gray-800">Agenda del Día</h2>
        <span className="text-sm font-medium text-gray-500">
          Bloques de 30 min
        </span>
      </div>

      <div className="divide-y divide-gray-100 h-[600px] overflow-y-auto">
        {timeSlots.map((time) => {
          const slotAppointments = getAppointmentsForSlot(time);

          return (
            <div
              key={time}
              className="flex min-h-[80px] hover:bg-gray-50 transition-colors"
            >
              {/* Columna de la Hora estática */}
              <div className="w-24 flex-shrink-0 border-r border-gray-100 p-4 flex flex-col justify-start items-end">
                <span className="text-sm font-semibold text-gray-600">
                  {time}
                </span>
              </div>

              {/* Área interactiva del turno */}
              <div
                className="flex-1 p-2 relative cursor-pointer"
                onClick={() =>
                  slotAppointments.length === 0 && onTimeSlotClick(time)
                }
              >
                {slotAppointments.length === 0 ? (
                  <div className="h-full w-full flex items-center pl-4 opacity-0 hover:opacity-100 transition-opacity">
                    <span className="text-xs font-medium text-blue-500">
                      + Nuevo Turno
                    </span>
                  </div>
                ) : (
                  <div className="flex flex-col gap-2">
                    {slotAppointments.map((app) => (
                      <div
                        key={app.id}
                        onClick={(e) => {
                          e.stopPropagation(); // Evita que se dispare el click del fondo vacío
                          onAppointmentClick(app);
                        }}
                        className={`p-3 rounded-lg border-l-4 shadow-sm cursor-pointer transition-transform hover:-translate-y-0.5 ${statusColors[app.status]}`}
                      >
                        <div className="flex justify-between items-start">
                          <div>
                            <p className="font-bold text-sm">
                              Cliente ID: {app.customerId}
                            </p>
                            {/* Acá iría el nombre del servicio cruzando datos, por ahora mostramos el precio total para el cajero */}
                            <p className="text-xs mt-1 opacity-90">
                              Total: ${app.totalPrice}
                            </p>
                          </div>
                          <span className="text-[10px] uppercase tracking-wider font-bold opacity-80">
                            {app.status}
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
