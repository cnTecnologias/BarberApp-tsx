// /src/shared/components/ProtectedRoute.tsx

import React, { type JSX } from "react";
import { Navigate } from "react-router-dom";

// Este componente es una ruta protegida que se utiliza para envolver las vistas que requieren autenticación.
// En este caso, simplemente verifica si existe un token de autenticación en el localStorage (puedes adaptar esto a tu método de autenticación).
// Si el token no existe, redirige al usuario a la página de login. Si el token existe, renderiza el componente hijo (la vista protegida).

export const ProtectedRoute = ({ children }: { children: JSX.Element }) => {
  // Buscamos la "pulsera VIP" en el almacenamiento del navegador
  const token = localStorage.getItem("evonec_admin_token");

  // Si no hay token, lo mandamos a la puerta a que ponga la contraseña
  if (!token) {
    return <Navigate to="/login" replace />;
  }

  // Si hay token, lo dejamos ver la agenda (el children será tu AdminView)
  return children;
};
