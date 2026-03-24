import { useEffect, useState } from "react";
import {
  createReparacion,
  getReparacion,
  updateReparacion,
} from "../../api/reparaciones";
import { listModulos } from "../../api/inventarioCatalogos";

const initialValues = {
  modulo_id: "",
  cliente: {
    nombre: "",
    telefono: "",
    direccion: "",
    email: "",
    documento: "",
  },
  marca: "",
  modelo: "",
  tipo_equipo: "celular",
  problema_reportado: "",
  diagnostico: "",
  costo_reparacion: "0",
  anticipo: "0",
  fecha_ingreso: "",
  fecha_estimada_entrega: "",
  observacion: "",
  estado_reparacion: "registrado",
  historiales: [],
};

function mapReparacionToForm(reparacion) {
  return {
    modulo_id: reparacion.modulo_id ? String(reparacion.modulo_id) : "",
    cliente: {
      nombre: reparacion.cliente?.nombre ?? "",
      telefono: reparacion.cliente?.telefono ?? "",
      direccion: reparacion.cliente?.direccion ?? "",
      email: reparacion.cliente?.email ?? "",
      documento: reparacion.cliente?.documento ?? "",
    },
    marca: reparacion.marca ?? "",
    modelo: reparacion.modelo ?? "",
    tipo_equipo: reparacion.tipo_equipo ?? "celular",
    problema_reportado: reparacion.problema_reportado ?? "",
    diagnostico: reparacion.diagnostico ?? "",
    costo_reparacion: reparacion.costo_reparacion ?? "0",
    anticipo: reparacion.anticipo ?? "0",
    fecha_ingreso: reparacion.fecha_ingreso
      ? reparacion.fecha_ingreso.slice(0, 16)
      : "",
    fecha_estimada_entrega: reparacion.fecha_estimada_entrega ?? "",
    observacion: reparacion.observacion ?? "",
    estado_reparacion: reparacion.estado_reparacion ?? "registrado",
    historiales: reparacion.historiales ?? [],
  };
}

function buildPayload(values) {
  return {
    modulo_id: values.modulo_id ? Number(values.modulo_id) : null,
    cliente: {
      nombre: values.cliente.nombre.trim(),
      telefono: values.cliente.telefono.trim(),
      direccion: values.cliente.direccion.trim() || null,
      email: values.cliente.email.trim() || null,
      documento: values.cliente.documento.trim() || null,
    },
    marca: values.marca.trim(),
    modelo: values.modelo.trim(),
    tipo_equipo: values.tipo_equipo,
    problema_reportado: values.problema_reportado.trim(),
    diagnostico: values.diagnostico.trim() || null,
    costo_reparacion: Number(values.costo_reparacion || 0),
    anticipo: Number(values.anticipo || 0),
    fecha_ingreso: values.fecha_ingreso,
    fecha_estimada_entrega: values.fecha_estimada_entrega || null,
    observacion: values.observacion.trim() || null,
  };
}

export function useReparacionForm({ reparacionId, onSuccess }) {
  const isEdit = Boolean(reparacionId);
  const [values, setValues] = useState(initialValues);
  const [modulos, setModulos] = useState([]);
  const [loading, setLoading] = useState(isEdit);
  const [saving, setSaving] = useState(false);
  const [errors, setErrors] = useState({});
  const [errorMessage, setErrorMessage] = useState("");

  useEffect(() => {
    let ignore = false;

    async function loadCatalog() {
      const data = await listModulos();

      if (!ignore) {
        setModulos(data);
      }
    }

    loadCatalog();

    return () => {
      ignore = true;
    };
  }, []);

  useEffect(() => {
    if (!isEdit) {
      return;
    }

    let ignore = false;

    async function loadReparacion() {
      setLoading(true);
      setErrorMessage("");

      try {
        const data = await getReparacion(reparacionId);

        if (!ignore) {
          setValues(mapReparacionToForm(data));
        }
      } catch {
        if (!ignore) {
          setErrorMessage("No se pudo cargar la reparacion.");
        }
      } finally {
        if (!ignore) {
          setLoading(false);
        }
      }
    }

    loadReparacion();

    return () => {
      ignore = true;
    };
  }, [isEdit, reparacionId]);

  function updateField(name, value) {
    setValues((current) => ({
      ...current,
      [name]: value,
    }));
  }

  function updateClienteField(name, value) {
    setValues((current) => ({
      ...current,
      cliente: {
        ...current.cliente,
        [name]: value,
      },
    }));
  }

  async function submit(event) {
    event.preventDefault();
    setSaving(true);
    setErrors({});
    setErrorMessage("");

    try {
      const payload = buildPayload(values);
      const reparacion = isEdit
        ? await updateReparacion(reparacionId, payload)
        : await createReparacion(payload);

      onSuccess(reparacion);
    } catch (requestError) {
      const validationErrors = requestError.response?.data?.errors;

      if (validationErrors) {
        setErrors(validationErrors);
      } else {
        setErrorMessage("No se pudo guardar la reparacion.");
      }
    } finally {
      setSaving(false);
    }
  }

  return {
    values,
    modulos,
    loading,
    saving,
    errors,
    errorMessage,
    isEdit,
    onChange: updateField,
    onClienteChange: updateClienteField,
    onSubmit: submit,
    updateField,
    updateClienteField,
    submit,
  };
}
