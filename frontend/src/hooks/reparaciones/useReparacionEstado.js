import { useState } from "react";
import { updateEstadoReparacion } from "../../api/reparaciones";

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

  return {
    saving,
    error,
    submitEstado,
  };
}
