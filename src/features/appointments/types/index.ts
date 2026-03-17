// Const object estricto para evitar errores de tipeo en la base de datos
export const AppointmentStatus = {
  PENDING: "PENDING",
  CONFIRMED: "CONFIRMED",
  CANCELLED: "CANCELLED",
  COMPLETED: "COMPLETED",
  NO_SHOW: "NO_SHOW", // Clave para las métricas de la barbería
} as const;

export type AppointmentStatus =
  (typeof AppointmentStatus)[keyof typeof AppointmentStatus];

export interface Customer {
  id: string;
  fullName: string;
  phoneNumber: string;
  totalNoShows: number; // UX: Si es mayor a 2, la UI debe mostrar una alerta roja al empleado
}

export interface Service {
  id: string;
  name: string; // Ej: "Corte + Barba"
  durationMinutes: number; // Esencial para calcular el bloque visual en la grilla
  price: number;
}

export interface Appointment {
  id: string;
  customerId: string;
  barberId: string;
  serviceIds: string[]; // Un cliente puede pedir múltiples servicios
  startTime: string; // Formato estricto ISO 8601: '2026-03-11T15:00:00Z'
  endTime: string;
  status: AppointmentStatus;
  notes: string | null;
  customerName?: string;
  services?: { id: string; name: string }[];
  totalPrice: number;
}

// Validación pura sin librerías externas listas para el submit del form
export const validateAppointmentPayload = (
  appointment: Partial<Appointment>,
): string | null => {
  if (!appointment.customerId) return "Error: Seleccioná un cliente.";
  if (!appointment.barberId) return "Error: Asigná un barbero.";
  if (!appointment.serviceIds || appointment.serviceIds.length === 0)
    return "Error: Seleccioná al menos un servicio.";

  const start = new Date(appointment.startTime as string);
  if (isNaN(start.getTime())) return "Error: El horario de inicio es inválido.";
  if (start < new Date())
    return "Error: No podés agendar un turno en el pasado.";

  return null; // Null = Validación exitosa
};
