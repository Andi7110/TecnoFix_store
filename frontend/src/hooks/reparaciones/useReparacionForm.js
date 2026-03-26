import { useEffect, useState } from "react";
import {
  createReparacion,
  getReparacion,
  updateReparacion,
} from "../../api/reparaciones";
import { listModulos } from "../../api/inventarioCatalogos";
import {
  formatMoneyInput,
  normalizeMoneyInput,
} from "../../utils/currencyInput";

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

function createError(message) {
  return [message];
}

function formatTelefono(value) {
  const digits = String(value ?? "").replace(/\D/g, "").slice(0, 8);

  if (digits.length <= 4) {
    return digits;
  }

  return `${digits.slice(0, 4)}-${digits.slice(4)}`;
}

function formatDui(value) {
  const digits = String(value ?? "").replace(/\D/g, "").slice(0, 9);

  if (digits.length <= 8) {
    return digits;
  }

  return `${digits.slice(0, 8)}-${digits.slice(8)}`;
}

function formatDireccion(value) {
  return String(value ?? "")
    .replace(/[^0-9A-Za-zÁÉÍÓÚáéíóúÑñ.,#/\-\s]/g, "")
    .replace(/\s+/g, " ")
    .slice(0, 255);
}

function validateValues(values) {
  const nextErrors = {};
  const nombreCliente = values.cliente.nombre.trim();
  const telefono = formatTelefono(values.cliente.telefono);
  const telefonoDigits = telefono.replace(/\D/g, "");
  const documento = formatDui(values.cliente.documento);
  const documentoDigits = documento.replace(/\D/g, "");
  const email = values.cliente.email.trim();
  const marca = values.marca.trim();
  const modelo = values.modelo.trim();
  const problemaReportado = values.problema_reportado.trim();
  const diagnostico = values.diagnostico.trim();
  const observacion = values.observacion.trim();
  const costoTexto = normalizeMoneyInput(values.costo_reparacion);
  const costo = Number(costoTexto || 0);
  const anticipoTexto = normalizeMoneyInput(values.anticipo);
  const anticipo = Number(anticipoTexto || 0);
  const fechaIngreso = values.fecha_ingreso;
  const fechaEstimadaEntrega = values.fecha_estimada_entrega;

  if (!nombreCliente) {
    nextErrors["cliente.nombre"] = createError("El nombre del cliente es obligatorio.");
  } else if (nombreCliente.length > 150) {
    nextErrors["cliente.nombre"] = createError("El nombre del cliente no puede exceder 150 caracteres.");
  }

  if (telefono && telefonoDigits.length !== 8) {
    nextErrors["cliente.telefono"] = createError("El telefono debe tener exactamente 8 numeros.");
  }

  if (documento && documentoDigits.length !== 9) {
    nextErrors["cliente.documento"] = createError("El DUI debe tener exactamente 9 numeros.");
  }

  if (email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
    nextErrors["cliente.email"] = createError("Ingresa un correo valido.");
  } else if (email.length > 150) {
    nextErrors["cliente.email"] = createError("El correo no puede exceder 150 caracteres.");
  }

  if (values.cliente.direccion.trim().length > 255) {
    nextErrors["cliente.direccion"] = createError("La direccion no puede exceder 255 caracteres.");
  }

  if (!marca) {
    nextErrors.marca = createError("La marca es obligatoria.");
  } else if (marca.length > 100) {
    nextErrors.marca = createError("La marca no puede exceder 100 caracteres.");
  }

  if (!modelo) {
    nextErrors.modelo = createError("El modelo es obligatorio.");
  } else if (modelo.length > 100) {
    nextErrors.modelo = createError("El modelo no puede exceder 100 caracteres.");
  }

  if (!problemaReportado) {
    nextErrors.problema_reportado = createError("Describe el problema reportado.");
  }

  if (diagnostico.length > 0 && diagnostico.length < 3) {
    nextErrors.diagnostico = createError("El diagnostico debe tener al menos 3 caracteres.");
  }

  if (!fechaIngreso) {
    nextErrors.fecha_ingreso = createError("La fecha de ingreso es obligatoria.");
  }

  if (costoTexto && Number.isNaN(costo)) {
    nextErrors.costo_reparacion = createError("Ingresa un monto valido.");
  } else if (Number.isNaN(costo) || costo < 0) {
    nextErrors.costo_reparacion = createError("El costo debe ser un numero igual o mayor que cero.");
  }

  if (anticipoTexto && Number.isNaN(anticipo)) {
    nextErrors.anticipo = createError("Ingresa un monto valido.");
  } else if (Number.isNaN(anticipo) || anticipo < 0) {
    nextErrors.anticipo = createError("El anticipo debe ser un numero igual o mayor que cero.");
  } else if (!Number.isNaN(costo) && anticipo > costo) {
    nextErrors.anticipo = createError("El anticipo no puede ser mayor que el costo.");
  }

  if (fechaIngreso && fechaEstimadaEntrega) {
    const ingreso = new Date(fechaIngreso);
    const entrega = new Date(fechaEstimadaEntrega);

    if (!Number.isNaN(ingreso.getTime()) && !Number.isNaN(entrega.getTime()) && entrega < ingreso) {
      nextErrors.fecha_estimada_entrega = createError("La fecha estimada no puede ser anterior a la fecha de ingreso.");
    }
  }

  if (observacion.length > 0 && observacion.length < 3) {
    nextErrors.observacion = createError("La observacion debe tener al menos 3 caracteres.");
  }

  return nextErrors;
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
      const reparacionesModulo = data.find((modulo) => modulo.nombre === "reparaciones");

      if (!ignore) {
        setModulos(data);
        setValues((current) => (
          isEdit || current.modulo_id || !reparacionesModulo
            ? current
            : {
                ...current,
                modulo_id: String(reparacionesModulo.id),
              }
        ));
      }
    }

    loadCatalog();

    return () => {
      ignore = true;
    };
  }, [isEdit]);

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
    const normalizedValue = name === "costo_reparacion" || name === "anticipo"
      ? normalizeMoneyInput(value)
      : value;

    setValues((current) => ({
      ...current,
      [name]: normalizedValue,
    }));
  }

  function updateClienteField(name, value) {
    const normalizedValue = name === "telefono"
      ? formatTelefono(value)
      : name === "documento"
        ? formatDui(value)
        : name === "direccion"
          ? formatDireccion(value)
        : value;

    setValues((current) => ({
      ...current,
      cliente: {
        ...current.cliente,
        [name]: normalizedValue,
      },
    }));
  }

  async function submit(event) {
    event.preventDefault();
    setErrors({});
    setErrorMessage("");

    const validationErrors = validateValues(values);

    if (Object.keys(validationErrors).length > 0) {
      setErrors(validationErrors);
      return;
    }

    setSaving(true);

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
    formatMoneyField: (name) => {
      setValues((current) => ({
        ...current,
        [name]: formatMoneyInput(current[name]),
      }));
    },
    submit,
  };
}
