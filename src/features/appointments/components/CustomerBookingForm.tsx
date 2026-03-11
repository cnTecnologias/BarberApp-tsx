import React, { useState, useEffect } from "react";
import { getAvailableSlots } from "../utils/timeUtils";
import { useAppointments } from "../api/useAppointments";

interface Service {
  id: string;
  name: string;
  durationMinutes: number;
  price: number;
}

// Mock de servicios. Esto idealmente viene de tu base de datos.
const MOCK_SERVICES = [
  { id: "1", name: "Corte Clásico", durationMinutes: 30, price: 5000 },
  { id: "2", name: "Corte + Barba", durationMinutes: 60, price: 7500 },
];

export const CustomerBookingForm = () => {
  const [step, setStep] = useState(1);
  const [selectedService, setSelectedService] = useState<Service | null>(null); //Le decimos que puede ser Service o null
  const [selectedDate, setSelectedDate] = useState("");
  const [selectedTime, setSelectedTime] = useState("");
  const [customerInfo, setCustomerInfo] = useState({ fullName: "", phone: "" });

  const [availableSlots, setAvailableSlots] = useState<string[]>([]);
  const [isLoadingSlots, setIsLoadingSlots] = useState(false);
  const { createAppointment, error: apiError } = useAppointments();
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Efecto que simula traer los turnos ocupados cuando elige una fecha
  useEffect(() => {
    if (step === 2 && selectedDate && selectedService) {
      setIsLoadingSlots(true);
      // Acá harías el fetch a tu endpoint GET /api/appointments?date=selectedDate
      // Simulamos que el turno de las 10:00 a 10:30 está ocupado
      setTimeout(() => {
        const mockBooked = [
          {
            startTime: "2026-03-11T10:00:00Z",
            endTime: "2026-03-11T10:30:00Z",
          },
        ];
        const slots = getAvailableSlots(
          mockBooked,
          selectedService.durationMinutes,
        );
        setAvailableSlots(slots);
        setIsLoadingSlots(false);
      }, 500);
    }
  }, [step, selectedDate, selectedService]);

  const handleConfirm = async () => {
    if (!selectedService || !selectedDate || !selectedTime) return;

    setIsSubmitting(true);
    try {
      // Armamos la fecha ISO combinando el input de fecha y la hora elegida
      const startIso = new Date(
        `${selectedDate}T${selectedTime}:00Z`,
      ).toISOString();

      // Calculamos el fin sumando los minutos del servicio
      const endDate = new Date(startIso);
      endDate.setUTCMinutes(
        endDate.getUTCMinutes() + selectedService.durationMinutes,
      );

      await createAppointment({
        customerInfo: {
          fullName: customerInfo.fullName,
          phone: customerInfo.phone,
        },
        barberId: "barber-123", // Hardcodeado por ahora
        serviceIds: ["service-pelo"],
        startTime: startIso,
        endTime: endDate.toISOString(),
        status: "PENDING",
        totalPrice: selectedService.price,
      });

      alert("¡Turno confirmado con éxito!");
      setStep(1); // Resetea el wizard
    } catch (err) {
      // Si salta la Race Condition (el 409), el hook tira el error acá.
      alert(
        `Error: ${err instanceof Error ? err.message : "No se pudo reservar"}`,
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="max-w-md mx-auto bg-white p-6 rounded-2xl shadow-lg border border-gray-100">
      {/* Indicador de pasos */}
      <div className="flex justify-between mb-8 text-sm font-bold text-gray-400">
        <span className={step >= 1 ? "text-blue-600" : ""}>1. Servicio</span>
        <span className={step >= 2 ? "text-blue-600" : ""}>
          2. Fecha y Hora
        </span>
        <span className={step >= 3 ? "text-blue-600" : ""}>3. Datos</span>
      </div>

      {/* PASO 1: Elegir Servicio */}
      {step === 1 && (
        <div className="flex flex-col gap-4">
          <h2 className="text-xl font-bold text-gray-800">
            ¿Qué te querés hacer?
          </h2>
          {MOCK_SERVICES.map((srv) => (
            <button
              key={srv.id}
              onClick={() => {
                setSelectedService(srv);
                setStep(2);
              }}
              className="p-4 border-2 border-gray-100 rounded-xl text-left hover:border-blue-500 hover:bg-blue-50 transition-all"
            >
              <div className="text-gray-700 font-bold text-lg">{srv.name}</div>
              <div className="text-gray-500 text-sm">
                {srv.durationMinutes} min • ${srv.price}
              </div>
            </button>
          ))}
        </div>
      )}

      {/* PASO 2: Elegir Fecha y Hora */}
      {step === 2 && (
        <div className="flex flex-col gap-4">
          <h2 className="text-xl font-bold text-gray-800">Elegí tu horario</h2>
          <input
            type="date"
            className="text-gray-700 w-full p-3 border-2 border-gray-200 rounded-xl focus:border-blue-500 outline-none"
            onChange={(e) => setSelectedDate(e.target.value)}
          />

          {selectedDate && (
            <div className="mt-4">
              <h3 className="text-sm font-bold text-gray-500 mb-3">
                Horarios Disponibles
              </h3>
              {isLoadingSlots ? (
                <div className="text-center text-gray-400">
                  Calculando disponibilidad...
                </div>
              ) : (
                <div className="grid grid-cols-3 gap-3">
                  {availableSlots.map((time) => (
                    <button
                      key={time}
                      onClick={() => {
                        setSelectedTime(time);
                        setStep(3);
                      }}
                      className="p-3 border border-gray-200 rounded-lg font-semibold text-gray-700 hover:bg-blue-600 hover:text-white transition-colors"
                    >
                      {time}
                    </button>
                  ))}
                </div>
              )}
            </div>
          )}
          <button
            onClick={() => setStep(1)}
            className="mt-4 text-gray-500 text-sm font-bold"
          >
            ← Volver
          </button>
        </div>
      )}

      {/* PASO 3: Datos y Confirmación */}
      {step === 3 && (
        <div className="flex flex-col gap-4">
          <h2 className="text-xl font-bold text-gray-800">Tus datos</h2>
          <input
            type="text"
            placeholder="Nombre completo"
            className="w-full p-4 border-2 border-gray-200 rounded-xl focus:border-blue-500 outline-none text-gray-700"
            onChange={(e) =>
              setCustomerInfo({ ...customerInfo, fullName: e.target.value })
            }
          />
          <input
            type="tel"
            placeholder="Teléfono (WhatsApp)"
            className="w-full p-4 border-2 border-gray-200 rounded-xl focus:border-blue-500 outline-none text-gray-700"
            onChange={(e) =>
              setCustomerInfo({ ...customerInfo, phone: e.target.value })
            }
          />

          <div className="bg-gray-50 p-4 rounded-xl mt-4 border border-gray-200">
            <p className="text-sm text-gray-600">Resumen:</p>
            <p className="font-bold text-gray-700">{selectedService?.name}</p>
            <p className="font-bold text-gray-700">
              {selectedDate} a las {selectedTime}
            </p>
          </div>

          <button
            onClick={handleConfirm}
            disabled={!customerInfo.fullName || !customerInfo.phone}
            className="w-full py-4 mt-2 bg-black text-white font-bold rounded-xl disabled:bg-gray-300"
          >
            Confirmar Turno
          </button>
          <button
            onClick={() => setStep(2)}
            className="text-gray-500 text-sm font-bold mt-2"
          >
            ← Volver
          </button>
        </div>
      )}
    </div>
  );
};
