import { useState } from "react";
import React, { Suspense } from "react";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { ProtectedRoute } from "./components/ProtectedRoute";
const AdminLogin = React.lazy(() =>
  import("./features/appointments/components/AdminLogin").then((m) => ({
    default: m.AdminLogin,
  })),
);

// Lazy Loading: El código de estas pantallas solo se descarga si el usuario entra a esa URL
const CustomerBookingForm = React.lazy(() =>
  import("./features/appointments/components/CustomerBookingForm").then(
    (module) => ({ default: module.CustomerBookingForm }),
  ),
);

const AdminView = React.lazy(() =>
  import("./features/appointments/components/AdminView").then((module) => ({
    default: module.AdminView,
  })),
);

// Un loader simple y unificado que el empleado o cliente ven mientras se descarga la pantalla
const PageLoader = () => (
  <div className="min-h-screen flex items-center justify-center bg-gray-50">
    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
  </div>
);
//---------------------------------------

function App() {
  const [count, setCount] = useState(0);

  return (
    <BrowserRouter>
      <Suspense fallback={<PageLoader />}>
        <Routes>
          {/* Zona Pública: El túnel del cliente */}
          <Route
            path="/reserva"
            element={
              <div className="min-h-screen bg-gray-50 py-10 px-4">
                <CustomerBookingForm />
              </div>
            }
          />
          <Route path="/login" element={<AdminLogin />} />
          {/* Zona Privada: La caja registradora conectada a Cloudflare */}
          <Route
            path="/admin"
            element={
              <ProtectedRoute>
                <div className="min-h-screen bg-gray-100 py-6 px-4">
                  <AdminView />
                </div>
              </ProtectedRoute>
            }
          />

          {/* Redirección por defecto: Si entra a la raíz, mandalo a la reserva */}
          <Route path="/" element={<Navigate to="/reserva" replace />} />

          {/* Catch-all: Si tipea cualquier cosa, mandalo a la reserva */}
          <Route path="*" element={<Navigate to="/reserva" replace />} />
        </Routes>
      </Suspense>
    </BrowserRouter>
  );
}

export default App;
