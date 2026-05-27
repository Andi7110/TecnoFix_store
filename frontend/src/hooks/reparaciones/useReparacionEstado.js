import { useState } from "react";
import { entregarReparacion, updateEstadoReparacion } from "../../api/reparaciones";

export function useReparacionEstado({ onSuccess } = {}) {
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  async function submitEstado(reparacionId, payload) {
    setSaving(true);
    setError("");

    try {
      const reparacion = await updateEstadoReparacion(reparacionId, payload);
      onSuccess?.(reparacion);
    } catch {
      setError("No se pudo actualizar el estado de la reparacion.");
    } finally {
      setSaving(false);
    }
  }

  async function submitEntrega(reparacionId, payload) {
    setSaving(true);
    setError("");

    try {
      const reparacion = await entregarReparacion(reparacionId, payload);
      onSuccess?.(reparacion);
    } catch (error) {
      const message = error.response?.data?.message
        ?? Object.values(error.response?.data?.errors ?? {})?.[0]?.[0]
        ?? "No se pudo entregar y cobrar la reparacion.";
      setError(message);
    } finally {
      setSaving(false);
    }
  }

  return {
    saving,
    error,
    submitEstado,
    submitEntrega,
  };
}
