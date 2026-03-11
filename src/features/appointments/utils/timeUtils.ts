// Convierte '15:30' a 930 (minutos)
export const timeToMinutes = (timeStr: string): number => {
  const [hours, minutes] = timeStr.split(":").map(Number);
  return hours * 60 + minutes;
};

// Convierte 930 a '15:30'
export const minutesToTime = (minutes: number): string => {
  const h = Math.floor(minutes / 60)
    .toString()
    .padStart(2, "0");
  const m = (minutes % 60).toString().padStart(2, "0");
  return `${h}:${m}`;
};

// La bomba desactivada: Calcula los huecos exactos
export const getAvailableSlots = (
  bookedAppointments: { startTime: string; endTime: string }[],
  serviceDurationMins: number,
  openTime = "09:00",
  closeTime = "20:00",
  intervalMins = 30,
): string[] => {
  const openMins = timeToMinutes(openTime);
  const closeMins = timeToMinutes(closeTime);
  const availableSlots: string[] = [];

  // Mapeamos los turnos ocupados a minutos para comparar fácil (Asumimos que vienen en ISO del backend, extraemos la hora)
  const bookedIntervals = bookedAppointments.map((app) => {
    const startDate = new Date(app.startTime);
    const endDate = new Date(app.endTime);
    return {
      start: startDate.getUTCHours() * 60 + startDate.getUTCMinutes(),
      end: endDate.getUTCHours() * 60 + endDate.getUTCMinutes(),
    };
  });

  // Iteramos cada posible bloque del día
  for (
    let current = openMins;
    current + serviceDurationMins <= closeMins;
    current += intervalMins
  ) {
    const proposedEnd = current + serviceDurationMins;

    // Verificamos si este bloque choca con algún turno ya guardado
    const hasConflict = bookedIntervals.some(
      (booked) =>
        (current >= booked.start && current < booked.end) ||
        (proposedEnd > booked.start && proposedEnd <= booked.end) ||
        (current <= booked.start && proposedEnd >= booked.end),
    );

    if (!hasConflict) {
      availableSlots.push(minutesToTime(current));
    }
  }

  return availableSlots;
};
