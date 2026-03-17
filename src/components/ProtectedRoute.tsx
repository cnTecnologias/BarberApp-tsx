// /src/shared/components/ProtectedRoute.tsx

import React, { type JSX } from "react";
import { Navigate } from "react-router-dom";

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
