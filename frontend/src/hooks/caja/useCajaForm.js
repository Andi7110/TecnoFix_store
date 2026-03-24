import { useEffect, useState } from "react";
import { createMovimientoCaja } from "../../api/caja";
import { listModulos } from "../../api/inventarioCatalogos";

const initialValues = {
  modulo_id: "",
  tipo_movimiento: "entrada",
  categoria_movimiento: "ingreso_manual",
  concepto: "",
  monto: "",
  fecha_movimiento: "",
  referencia: "",
  observacion: "",
};

export function useCajaForm({ onSuccess }) {
  const [values, setValues] = useState(initialValues);
  const [modulos, setModulos] = useState([]);
  const [saving, setSaving] = useState(false);
  const [errors, setErrors] = useState({});
  const [errorMessage, setErrorMessage] = useState("");

  useEffect(() => {
    let ignore = false;

    async function loadModulosCatalog() {
      const data = await listModulos();

      if (!ignore) {
        setModulos(data);
      }
    }

    loadModulosCatalog();

    return () => {
      ignore = true;
    };
  }, []);

  function updateField(name, value) {
    setValues((current) => ({
      ...current,
      [name]: value,
    }));
  }

  async function submit(event) {
    event.preventDefault();
    setSaving(true);
    setErrors({});
    setErrorMessage("");

    try {
      const payload = {
        modulo_id: values.modulo_id ? Number(values.modulo_id) : null,
        tipo_movimiento: values.tipo_movimiento,
        categoria_movimiento: values.categoria_movimiento,
        concepto: values.concepto.trim(),
        monto: Number(values.monto),
        fecha_movimiento: values.fecha_movimiento,
        referencia: values.referencia.trim() || null,
        observacion: values.observacion.trim() || null,
      };

      const movimiento = await createMovimientoCaja(payload);
      onSuccess?.(movimiento);
    } catch (requestError) {
      const validationErrors = requestError.response?.data?.errors;

      if (validationErrors) {
        setErrors(validationErrors);
      } else {
        setErrorMessage("No se pudo guardar el movimiento.");
      }
    } finally {
      setSaving(false);
    }
  }

  return {
    values,
    modulos,
    saving,
    errors,
    errorMessage,
    onChange: updateField,
    onSubmit: submit,
    updateField,
    submit,
  };
}
