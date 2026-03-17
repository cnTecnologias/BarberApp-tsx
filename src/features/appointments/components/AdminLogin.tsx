// /src/features/appointments/components/AdminLogin.tsx

import React, { useState } from "react";
import { useNavigate } from "react-router-dom";

export const AdminLogin = () => {
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate();

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError("");

    try {
      // Le tocamos la puerta al Worker y le pasamos el sobre con la clave
      const response = await fetch(
        "https://worker-barberias.fedepedano2003.workers.dev/api/login",
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ password }),
        },
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Acceso denegado");
      }

      // El Worker nos dio la tarjeta magnética. La guardamos en el bolsillo.
      localStorage.setItem("evonec_admin_token", data.token);
      navigate("/admin");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Error de conexión");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
      <form
        onSubmit={handleLogin}
        className="bg-white p-8 rounded-2xl shadow-lg max-w-sm w-full border border-gray-100"
      >
        <h1 className="text-2xl font-black text-gray-800 mb-2">EVONEC Admin</h1>
        <p className="text-sm text-gray-500 mb-6">
          Ingresá tu clave para ver la agenda.
        </p>

        <input
          type="password"
          placeholder="Contraseña"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          disabled={isLoading}
          className="w-full p-4 mb-4 border-2 border-gray-200 rounded-xl focus:border-black outline-none text-gray-700 font-bold disabled:bg-gray-100"
        />

        {error && (
          <p className="text-red-500 text-sm font-bold mb-4">{error}</p>
        )}

        <button
          type="submit"
          disabled={isLoading || !password}
          className="w-full py-4 bg-black text-white font-bold rounded-xl hover:bg-gray-800 transition-colors disabled:bg-gray-400 cursor-pointer disabled:cursor-not-allowed"
        >
          {isLoading ? "Verificando..." : "Entrar"}
        </button>
      </form>
    </div>
  );
};
