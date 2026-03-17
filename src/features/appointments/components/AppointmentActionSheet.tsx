import React, { useState } from "react";
import { type Appointment, AppointmentStatus } from "../types";

interface ActionSheetProps {
  appointment: Appointment | null;
  isOpen: boolean;
  onClose: () => void;
  onUpdateStatus: (
    id: string,
    newStatus: (typeof AppointmentStatus)[keyof typeof AppointmentStatus],
  ) => Promise<void>;
}

export const AppointmentActionSheet: React.FC<ActionSheetProps> = ({
  appointment,
  isOpen,
  onClose,
  onUpdateStatus,
}) => {
  const [isUpdating, setIsUpdating] = useState(false);
  const [error, setError] = useState<string | null>(null);

  if (!isOpen || !appointment) return null;

  const handleAction = async (
    status: (typeof AppointmentStatus)[keyof typeof AppointmentStatus],
  ) => {
    setIsUpdating(true);
    setError(null);
    try {
      await onUpdateStatus(appointment.id, status);
      onClose();
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Error al actualizar el turno.",
      );
    } finally {
      setIsUpdating(false);
    }
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-black/60 backdrop-blur-sm transition-opacity p-4 sm:p-0"
      onClick={onClose}
    >
      <div
        className="bg-white w-full sm:w-[400px] rounded-2xl p-6 shadow-2xl transform transition-transform"
        onClick={(e) => e.stopPropagation()}
      >
        <h3 className="text-xl font-black text-gray-900 mb-4">
          Gestionar Turno
        </h3>

        {/* TARJETA DE RESUMEN (TICKET UX) */}
        <div className="bg-gray-50 p-5 rounded-xl border border-gray-200 mb-6">
          <div className="flex justify-between items-start mb-3 border-b border-gray-200 pb-3">
            <div>
              <h3 className="text-lg font-bold text-gray-900 capitalize leading-tight">
                {appointment.customerName || "Cliente sin nombre"}
              </h3>
              {/* Acceso rápido a WhatsApp */}
              <a
                href={`https://wa.me/${appointment.customerId.replace(/\D/g, "")}`}
                target="_blank"
                rel="noopener noreferrer"
                className="text-sm font-bold text-blue-600 hover:text-blue-800 transition-colors mt-1 inline-block"
              >
                📱 {appointment.customerId.replace("cust-", "")}
              </a>
            </div>
            <span className="bg-black text-white text-[10px] font-bold px-2 py-1 rounded uppercase tracking-wider">
              {appointment.status}
            </span>
          </div>

          <div className="flex justify-between items-end mt-2">
            <div>
              <p className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-0.5">
                Servicio
              </p>
              <p className="text-sm font-semibold text-gray-800">
                {appointment.services?.map((s) => s.name).join(" + ") ||
                  "Sin servicios"}
              </p>
              <p className="text-xs font-medium text-gray-500 mt-1">
                📅{" "}
                {new Date(appointment.startTime).toLocaleTimeString("es-AR", {
                  hour: "2-digit",
                  minute: "2-digit",
                  hour12: false,
                })}{" "}
                hs
              </p>
            </div>
            <div className="text-right">
              <p className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-0.5">
                Total
              </p>
              <p className="text-2xl font-black text-green-600 leading-none">
                ${appointment.totalPrice}
              </p>
            </div>
          </div>
        </div>

        {error && (
          <div className="mb-4 p-3 bg-red-50 border border-red-200 text-red-600 text-sm rounded-lg font-bold text-center">
            {error}
          </div>
        )}

        {/* ZONA DE ACCIONES */}
        <div className="flex flex-col gap-3">
          <button
            disabled={
              isUpdating || appointment.status === AppointmentStatus.COMPLETED
            }
            onClick={() => handleAction(AppointmentStatus.COMPLETED)}
            className="w-full py-4 bg-green-600 hover:bg-green-700 disabled:bg-gray-200 disabled:text-gray-400 text-white font-bold rounded-xl text-lg transition-colors flex justify-center items-center h-16 cursor-pointer disabled:cursor-not-allowed"
          >
            {isUpdating ? "Procesando..." : "Cobrar / Completado"}
          </button>

          <div className="grid grid-cols-2 gap-3">
            <button
              disabled={
                isUpdating || appointment.status === AppointmentStatus.NO_SHOW
              }
              onClick={() => handleAction(AppointmentStatus.NO_SHOW)}
              className="py-3 bg-orange-50 hover:bg-orange-100 disabled:bg-gray-50 disabled:text-gray-300 disabled:border-gray-100 border border-orange-200 text-orange-700 font-bold text-sm rounded-xl transition-colors cursor-pointer disabled:cursor-not-allowed"
            >
              No Show (Faltó)
            </button>

            <button
              disabled={
                isUpdating || appointment.status === AppointmentStatus.CANCELLED
              }
              onClick={() => handleAction(AppointmentStatus.CANCELLED)}
              className="py-3 bg-red-50 hover:bg-red-100 disabled:bg-gray-50 disabled:text-gray-300 disabled:border-gray-100 border border-red-200 text-red-600 font-bold text-sm rounded-xl transition-colors cursor-pointer disabled:cursor-not-allowed"
            >
              Cancelar Turno
            </button>
          </div>

          <button
            disabled={isUpdating}
            onClick={onClose}
            className="w-full py-3 mt-1 text-gray-400 font-bold hover:text-gray-800 transition-colors cursor-pointer disabled:cursor-not-allowed"
          >
            Volver
          </button>
        </div>
      </div>
    </div>
  );
};
