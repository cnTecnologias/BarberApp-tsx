import React, { useEffect, useState } from "react";
import { useAppointments } from "../api/useAppointments";
import { DailyAgenda } from "./DailyAgenda";
import { AppointmentActionSheet } from "./AppointmentActionSheet";
import type { Appointment } from "../types";

export const AdminView = () => {
  const {
    appointments,
    isLoading,
    error,
    fetchDailyAppointments,
    updateAppointmentStatus,
  } = useAppointments();

  const [selectedApp, setSelectedApp] = useState<Appointment | null>(null);
  const [isSheetOpen, setIsSheetOpen] = useState(false);

  // Hardcodeamos el ID de Franco y la fecha de hoy para probar
  const BARBER_ID = "barber-123";
  const TODAY = new Date().toISOString().split("T")[0];

  useEffect(() => {
    fetchDailyAppointments(BARBER_ID, TODAY);
  }, [fetchDailyAppointments]);

  const handleAppointmentClick = (app: Appointment) => {
    setSelectedApp(app);
    setIsSheetOpen(true);
  };

  if (isLoading)
    return <div className="p-10 text-center font-bold">Cargando agenda...</div>;
  if (error)
    return (
      <div className="p-10 text-center text-red-600 font-bold">
        Error: {error}
      </div>
    );

  return (
    <div className="max-w-6xl mx-auto">
      <div className="mb-6 flex justify-between items-center">
        <h1 className="text-2xl font-black text-gray-800">Panel de Control</h1>
        <button
          onClick={() => fetchDailyAppointments(BARBER_ID, TODAY)}
          className="px-4 py-2 bg-black text-white rounded-lg text-sm font-bold cursor-pointer"
        >
          ↻ Refrescar
        </button>
      </div>
      <button
        onClick={() => {
          localStorage.removeItem("evonec_admin_token");
          window.location.href = "/login"; // Forzamos recarga dura para limpiar estados
        }}
        className="text-red-500 font-bold text-sm cursor-pointer"
      >
        Cerrar Sesión
      </button>

      <DailyAgenda
        appointments={appointments}
        onTimeSlotClick={(time) =>
          console.log("Acá abrirías un modal para crear turno manual:", time)
        }
        onAppointmentClick={handleAppointmentClick}
      />

      <AppointmentActionSheet
        appointment={selectedApp}
        isOpen={isSheetOpen}
        onClose={() => setIsSheetOpen(false)}
        onUpdateStatus={updateAppointmentStatus}
      />
    </div>
  );
};
