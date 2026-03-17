import { useState, useCallback, useRef } from "react";
import { type Appointment, AppointmentStatus } from "../types";

// Tipamos la respuesta de error de tu backend
interface ApiError {
  message: string;
  status?: number;
}

// Definimos qué datos esperamos para la creación (DTO)
interface CreateAppointmentDTO {
  customerInfo: {
    fullName: string;
    phone: string;
  };
  barberId: string;
  serviceIds: string[];
  startTime: string;
  endTime: string;
  totalPrice: number;
  status: string;
}

export const useAppointments = () => {
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  // Ref para cancelar peticiones duplicadas si el empleado hace doble clic
  const abortControllerRef = useRef<AbortController | null>(null);

  // 1. Fetch de la agenda del día
  const fetchDailyAppointments = useCallback(
    async (barberId: string, dateIso: string) => {
      setIsLoading(true);
      setError(null);

      try {
        // Buscamos la pulsera en el navegador
        const token = localStorage.getItem("evonec_admin_token");
        //URL del Cloudflare Worker / API
        const response = await fetch(
          `https://worker-barberias.fedepedano2003.workers.dev/api/appointments?barberId=${barberId}&date=${dateIso}`,
          {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          },
        );
        if (response.status === 401)
          throw new Error("Sesión expirada o no autorizada.");
        if (!response.ok) {
          throw new Error("Error al cargar la agenda. Actualizá la página.");
        }

        const data: Appointment[] = await response.json();
        setAppointments(data);
      } catch (err) {
        setError(
          err instanceof Error ? err.message : "Error de red desconocido.",
        );
      } finally {
        setIsLoading(false);
      }
    },
    [],
  );

  // 2. Crear turno (La prueba de fuego de la Race Condition)
  const createAppointment = useCallback(
    async (newAppointment: CreateAppointmentDTO) => {
      // Si hay una petición en vuelo, la abortamos para evitar spam
      if (abortControllerRef.current) {
        abortControllerRef.current.abort();
      }
      abortControllerRef.current = new AbortController();

      setError(null);

      try {
        const response = await fetch(
          "https://worker-barberias.fedepedano2003.workers.dev/api/appointments",
          {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(newAppointment),
            signal: abortControllerRef.current.signal,
          },
        );

        // ACA ESTÁ LA MAGIA: Capturamos la Race Condition exacta
        if (response.status === 409) {
          throw new Error(
            "Este horario acaba de ser ocupado por otro cliente. Por favor, elegí otro.",
          );
        }

        if (!response.ok) {
          throw new Error("Error al crear el turno. Intentá de nuevo.");
        }

        const createdAppointment: Appointment = await response.json();

        // Actualizamos el estado local sumando el nuevo turno confirmado (Pessimistic UI)
        setAppointments((prev) => [...prev, createdAppointment]);

        return true; // Éxito
      } catch (err: unknown) {
        if (err instanceof DOMException && err.name === "AbortError") {
          console.log("Petición abortada por el usuario (spam prevention)");
          return false;
        }
        const errorMessage =
          err instanceof Error ? err.message : "Error inesperado";
        setError(errorMessage);
        throw new Error(errorMessage); // Lanzamos para que el Modal lo atrape y muestre la alerta
      }
    },
    [],
  );

  // 3. Actualizar estado (Cobrar, Cancelar, No Show)
  const updateAppointmentStatus = useCallback(
    async (
      id: string,
      newStatus: (typeof AppointmentStatus)[keyof typeof AppointmentStatus],
    ) => {
      try {
        const token = localStorage.getItem("evonec_admin_token");
        const response = await fetch(
          `https://worker-barberias.fedepedano2003.workers.dev/api/appointments/${id}/status`,
          {
            method: "PATCH",
            headers: {
              "Content-Type": "application/json",
              Authorization: `Bearer ${token}`,
            },
            body: JSON.stringify({ status: newStatus }),
          },
        );

        if (response.status === 401) {
          throw new Error(
            "Sesión expirada. Por favor, volvé a iniciar sesión.",
          );
        }
        if (!response.ok) {
          throw new Error("No se pudo actualizar el estado.");
        }

        // Actualizamos la grilla local al instante si el backend dio el OK
        setAppointments((prev) =>
          prev.map((app) =>
            app.id === id ? { ...app, status: newStatus } : app,
          ),
        );
      } catch (err) {
        const errorMessage =
          err instanceof Error ? err.message : "Error al actualizar";
        setError(errorMessage);
        throw new Error(errorMessage); // Para el ActionSheet
      }
    },
    [],
  );

  return {
    appointments,
    isLoading,
    error,
    fetchDailyAppointments,
    createAppointment,
    updateAppointmentStatus,
  };
};
