import React, { useState } from "react";
import { type Appointment, AppointmentStatus } from "../types";

interface ActionSheetProps {
  appointment: Appointment | null;
  isOpen: boolean;
  onClose: () => void;
  // Pasamos la función asíncrona desde el padre para mantener este componente puro visualmente
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
      onClose(); // Solo cerramos si la promesa se resolvió con éxito
    } catch (err) {
      // Capturamos el error real del backend (ej: si se cortó internet justo al cobrar)
      setError(
        err instanceof Error ? err.message : "Error al actualizar el turno.",
      );
    } finally {
      setIsUpdating(false);
    }
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-black/60 backdrop-blur-sm transition-opacity"
      onClick={onClose}
    >
      <div
        className="bg-white w-full sm:w-96 rounded-t-2xl sm:rounded-2xl p-6 shadow-xl transform transition-transform"
        onClick={(e) => e.stopPropagation()} // Evita que un clic adentro cierre el modal
      >
        <div className="mb-6">
          <h3 className="text-xl font-bold text-gray-900">Gestionar Turno</h3>
          <p className="text-sm text-gray-500 mt-1">
            Cliente:{" "}
            <span className="font-semibold text-gray-700">
              {appointment.customerId}
            </span>
          </p>
          <p className="text-sm font-bold text-gray-900 mt-2 text-2xl">
            Total: ${appointment.totalPrice}
          </p>
        </div>

        {error && (
          <div className="mb-4 p-3 bg-red-50 border border-red-200 text-red-600 text-sm rounded-lg font-medium">
            {error}
          </div>
        )}

        {/* UX: Los botones más críticos arriba y más grandes. 
          Se deshabilitan solos mientras isUpdating es true para evitar doble cobro.
        */}
        <div className="flex flex-col gap-3">
          <button
            disabled={
              isUpdating || appointment.status === AppointmentStatus.COMPLETED
            }
            onClick={() => handleAction(AppointmentStatus.COMPLETED)}
            className="w-full py-4 bg-green-600 hover:bg-green-700 disabled:bg-green-300 text-white font-bold rounded-xl text-lg shadow-sm transition-colors"
          >
            {isUpdating ? "Procesando..." : "Cobrar / Completado"}
          </button>

          <button
            disabled={
              isUpdating || appointment.status === AppointmentStatus.NO_SHOW
            }
            onClick={() => handleAction(AppointmentStatus.NO_SHOW)}
            className="w-full py-4 bg-orange-100 hover:bg-orange-200 disabled:bg-gray-100 text-orange-800 font-bold rounded-xl transition-colors"
          >
            Marcó Ausente (No Show)
          </button>

          <button
            disabled={
              isUpdating || appointment.status === AppointmentStatus.CANCELLED
            }
            onClick={() => handleAction(AppointmentStatus.CANCELLED)}
            className="w-full py-4 bg-red-50 hover:bg-red-100 disabled:bg-gray-50 text-red-600 font-bold rounded-xl transition-colors"
          >
            Cancelar Turno
          </button>

          <button
            disabled={isUpdating}
            onClick={onClose}
            className="w-full py-3 mt-2 text-gray-500 font-semibold hover:text-gray-800 transition-colors"
          >
            Cerrar
          </button>
        </div>
      </div>
    </div>
  );
};
