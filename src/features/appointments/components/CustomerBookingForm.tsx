import React, { useState, useEffect } from "react";
import { useAppointments } from "../api/useAppointments";
import { DateStripSelector } from "./DateStripSelector";
import { TimeSlotGrid } from "./TimeSlotGrid";

interface Service {
  id: string;
  name: string;
  durationMinutes: number;
  price: number;
}

// Mock de servicios. Esto idealmente viene de tu base de datos.
const MOCK_SERVICES = [
  {
    id: "service-pelo",
    name: "Corte Clásico",
    durationMinutes: 30,
    price: 5000,
  },
  {
    id: "service-barba",
    name: "Corte + Barba",
    durationMinutes: 60,
    price: 7500,
  }, // Asegurate que este también exista en D1
];

export const CustomerBookingForm = () => {
  const [step, setStep] = useState(1);
  const [selectedService, setSelectedService] = useState<Service | null>(null); //Le decimos que puede ser Service o null
  const [selectedDate, setSelectedDate] = useState("");
  const [selectedTime, setSelectedTime] = useState("");
  const [customerInfo, setCustomerInfo] = useState({ fullName: "", phone: "" });

  const [isLoadingSlots, setIsLoadingSlots] = useState(false);
  // Nos traemos la función GET, los turnos (appointments) y el isLoading real
  const {
    createAppointment,
    fetchDailyAppointments,
    appointments,
    isLoading,
    error: apiError,
  } = useAppointments();
  const [isSubmitting, setIsSubmitting] = useState(false);

  // PASO2: Si el cliente eligió servicio y fecha, buscamos los turnos de ese día
  useEffect(() => {
    if (step === 2 && selectedDate && selectedService) {
      // Hardcodeamos el barbero por ahora. Si cambia la fecha, trae los datos nuevos.
      fetchDailyAppointments("barber-123", selectedDate);
      setSelectedTime(""); // Limpiamos la hora por si cambió de día
    }
  }, [step, selectedDate, selectedService, fetchDailyAppointments]);

  const handleConfirm = async () => {
    if (!selectedService || !selectedDate || !selectedTime) return;

    setIsSubmitting(true);
    try {
      const localStartTime = new Date(`${selectedDate}T${selectedTime}:00`);
      //Calculamos la hora de fin sumando los minutos localmente
      const localEndTime = new Date(localStartTime);
      localEndTime.setMinutes(
        localEndTime.getMinutes() + selectedService.durationMinutes,
      );
      // Pasamos todo a ISO (JavaScript ajustará el UTC automáticamente) para la base de datos
      const startIso = localStartTime.toISOString();
      const endIso = localEndTime.toISOString();

      const cleanPhone = customerInfo.phone.replace(/\D/g, "");

      await createAppointment({
        customerInfo: {
          fullName: customerInfo.fullName,
          phone: cleanPhone,
        },
        barberId: "barber-123",
        serviceIds: [selectedService.id], // OJO ACA: en el tuyo decía "service-pelo" a mano. Ahora usa el ID real del mock
        startTime: startIso,
        endTime: endIso,
        status: "PENDING",
        totalPrice: selectedService.price,
      });

      alert("¡Turno confirmado con éxito!");
      setStep(1);
    } catch (err) {
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
        <div className="mb-6">
          <label className="block text-sm font-bold text-gray-700 mb-3">
            ¿Qué día venís?
          </label>
          <DateStripSelector
            selectedDate={selectedDate}
            onSelect={(date) => setSelectedDate(date)}
            daysToShow={21} // Le damos 3 semanas de margen
          />

          {selectedDate && (
            <div className="mt-6">
              <label className="block text-sm font-bold text-gray-700 mb-3">
                ¿A qué hora?
              </label>

              {/* LA MAGIA SUCEDE ACÁ: Si está cargando muestra texto, si no, muestra la grilla inteligente */}
              {isLoading ? (
                <div className="text-center text-sm font-bold text-blue-600 animate-pulse py-6">
                  Verificando agenda...
                </div>
              ) : (
                <TimeSlotGrid
                  selectedDate={selectedDate}
                  appointments={appointments} // Los turnos reales que trajo el hook
                  serviceDurationMinutes={
                    selectedService?.durationMinutes || 30
                  }
                  selectedTime={selectedTime}
                  onSelectTime={(time) => {
                    setSelectedTime(time);
                    setStep(3); // Avanza automático al elegir la hora
                  }}
                />
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
            type="number"
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
