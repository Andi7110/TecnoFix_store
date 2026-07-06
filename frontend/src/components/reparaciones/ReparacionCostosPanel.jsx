import { useMemo, useState } from "react";
import { createCostoReparacion, updateCostoReparacion } from "../../api/reparaciones";
import { formatMoneyInput, normalizeMoneyInput } from "../../utils/currencyInput";
import { displayDateTime, localDateTimeInput } from "../../utils/dateTime";

const COST_TYPES = [
  { value: "pieza", label: "Pieza" },
  { value: "insumo", label: "Insumo" },
  { value: "servicio_externo", label: "Servicio externo" },
  { value: "otro", label: "Otro" },
];

const emptyForm = {
  tipo_costo: "pieza",
  descripcion: "",
  monto: "",
  fecha_costo: "",
  proveedor: "",
  referencia: "",
  observacion: "",
};

function formatCurrency(value) {
  return new Intl.NumberFormat("es-SV", { style: "currency", currency: "USD" }).format(Number(value ?? 0));
}

function formatDateTime(value) {
  return displayDateTime(value);
}

function normalizeCost(cost) {
  return {
    tipo_costo: cost.tipo_costo ?? "pieza",
    descripcion: cost.descripcion ?? "",
    monto: formatMoneyInput(cost.monto ?? ""),
    fecha_costo: localDateTimeInput(cost.fecha_costo),
    proveedor: cost.proveedor ?? "",
    referencia: cost.referencia ?? "",
    observacion: cost.observacion ?? "",
  };
}

function errorFor(errors, name) {
  return errors?.[name]?.[0] ?? null;
}

function validateCost(form) {
  const errors = {};
  const monto = Number(normalizeMoneyInput(form.monto) || 0);

  if (!form.descripcion.trim()) {
    errors.descripcion = ["Describe el costo."];
  }

  if (!monto || Number.isNaN(monto) || monto <= 0) {
    errors.monto = ["Ingresa un monto mayor a cero."];
  }

  return errors;
}

function CostForm({ initialValue, submitLabel, saving, errors, onSubmit, onCancel }) {
  const [form, setForm] = useState(() => normalizeCost(initialValue ?? emptyForm));

  function updateField(name, value) {
    setForm((current) => ({
      ...current,
      [name]: name === "monto" ? normalizeMoneyInput(value) : value,
    }));
  }

  return (
    <form
      className="repairs-cost-form"
      onSubmit={(event) => {
        event.preventDefault();
        onSubmit({
          ...form,
          descripcion: form.descripcion.trim(),
          monto: Number(normalizeMoneyInput(form.monto) || 0),
          proveedor: form.proveedor.trim() || null,
          referencia: form.referencia.trim() || null,
          observacion: form.observacion.trim() || null,
        });
      }}
    >
      <div className="row g-2">
        <div className="col-md-5">
          <label className="form-label">Tipo</label>
          <select className="form-select" value={form.tipo_costo} onChange={(event) => updateField("tipo_costo", event.target.value)}>
            {COST_TYPES.map((type) => <option key={type.value} value={type.value}>{type.label}</option>)}
          </select>
        </div>
        <div className="col-md-7">
          <label className="form-label">Descripcion</label>
          <input className={`form-control ${errorFor(errors, "descripcion") ? "is-invalid" : ""}`} value={form.descripcion} onChange={(event) => updateField("descripcion", event.target.value)} maxLength={180} />
          {errorFor(errors, "descripcion") ? <div className="invalid-feedback">{errorFor(errors, "descripcion")}</div> : null}
        </div>
        <div className="col-md-5">
          <label className="form-label">Monto</label>
          <div className="input-group">
            <span className="input-group-text">$</span>
            <input className={`form-control ${errorFor(errors, "monto") ? "is-invalid" : ""}`} value={form.monto} onChange={(event) => updateField("monto", event.target.value)} onBlur={() => updateField("monto", formatMoneyInput(form.monto))} inputMode="decimal" />
            {errorFor(errors, "monto") ? <div className="invalid-feedback">{errorFor(errors, "monto")}</div> : null}
          </div>
        </div>
        <div className="col-md-7">
          <label className="form-label">Fecha</label>
          <input type="datetime-local" className="form-control" value={form.fecha_costo} onChange={(event) => updateField("fecha_costo", event.target.value)} />
        </div>
        <div className="col-md-6">
          <label className="form-label">Proveedor</label>
          <input className="form-control" value={form.proveedor ?? ""} onChange={(event) => updateField("proveedor", event.target.value)} maxLength={150} />
        </div>
        <div className="col-md-6">
          <label className="form-label">Referencia</label>
          <input className="form-control" value={form.referencia ?? ""} onChange={(event) => updateField("referencia", event.target.value)} maxLength={100} />
        </div>
        <div className="col-12">
          <label className="form-label">Observacion</label>
          <textarea className="form-control" rows={2} value={form.observacion ?? ""} onChange={(event) => updateField("observacion", event.target.value)} />
        </div>
      </div>
      <div className="repairs-cost-form__actions">
        {onCancel ? <button type="button" className="btn products-filter-actions__clear" onClick={onCancel}>Cancelar</button> : <span />}
        <button type="submit" className="btn btn-primary" disabled={saving}>{saving ? "Guardando..." : submitLabel}</button>
      </div>
    </form>
  );
}

function ReparacionCostosPanel({ mode = "detail", reparacionId, values, onCreated, onLocalAdd, onLocalRemove }) {
  const [errors, setErrors] = useState({});
  const [message, setMessage] = useState("");
  const [editingId, setEditingId] = useState(null);
  const [isAdding, setIsAdding] = useState(false);
  const [saving, setSaving] = useState(false);
  const costos = values.costos ?? [];
  const costosTotal = useMemo(() => costos.reduce((total, cost) => total + Number(cost.monto ?? 0), 0), [costos]);
  const utilidad = Number(values.costo_reparacion ?? 0) - costosTotal;
  const isCreateMode = mode === "create";

  function addLocalCost(cost) {
    const validationErrors = validateCost(cost);

    if (Object.keys(validationErrors).length > 0) {
      setErrors(validationErrors);
      return;
    }

    setErrors({});
    setMessage("");
    onLocalAdd?.(cost);
  }

  async function updateRemoteCost(cost) {
    const validationErrors = validateCost(cost);

    if (Object.keys(validationErrors).length > 0) {
      setErrors(validationErrors);
      return;
    }

    setErrors({});
    setMessage("");
    setSaving(true);

    try {
      await updateCostoReparacion(reparacionId, editingId, cost);
      setEditingId(null);
      setMessage("Costo actualizado.");
      onCreated?.();
    } catch (requestError) {
      setErrors(requestError.response?.data?.errors ?? {});
      setMessage(requestError.response?.data?.message ?? "No se pudo actualizar el costo.");
    } finally {
      setSaving(false);
    }
  }

  async function createRemoteCost(cost) {
    const validationErrors = validateCost(cost);

    if (Object.keys(validationErrors).length > 0) {
      setErrors(validationErrors);
      return;
    }

    setErrors({});
    setMessage("");
    setSaving(true);

    try {
      await createCostoReparacion(reparacionId, cost);
      setIsAdding(false);
      setMessage("Costo agregado.");
      onCreated?.();
    } catch (requestError) {
      setErrors(requestError.response?.data?.errors ?? {});
      setMessage(requestError.response?.data?.message ?? "No se pudo agregar el costo.");
    } finally {
      setSaving(false);
    }
  }

  const editingCost = costos.find((cost) => cost.id === editingId);

  const contentClassName = isCreateMode
    ? "surface-card product-form repair-form repairs-costs-card repairs-costs-card--create"
    : "surface-card repairs-costs-card";

  return (
    <article className={contentClassName}>
      <div className="repairs-costs-card__header">
        <div>
          <p className="section-kicker">Inversion</p>
          <h3>Costos de reparacion</h3>
        </div>
        <div className="repairs-costs-card__header-side">
          <div className="repairs-costs-card__totals">
            <span>Invertido <strong>{formatCurrency(costosTotal)}</strong></span>
            <span>Utilidad <strong>{formatCurrency(utilidad)}</strong></span>
          </div>
          {!isCreateMode ? (
            <button
              type="button"
              className="btn products-filter-actions__apply btn-sm"
              onClick={() => {
                setEditingId(null);
                setErrors({});
                setIsAdding((current) => !current);
              }}
            >
              {isAdding ? "Cerrar" : "Agregar costo"}
            </button>
          ) : null}
        </div>
      </div>

      {message ? <div className={Object.keys(errors).length ? "text-danger mt-2" : "text-success mt-2"}>{message}</div> : null}

      <div className="repairs-cost-list">
        {costos.length > 0 ? costos.map((cost) => (
          <article key={cost.id ?? cost.local_id} className="repairs-cost-list__item">
            <div>
              <strong>{cost.descripcion}</strong>
              <span>{COST_TYPES.find((type) => type.value === cost.tipo_costo)?.label ?? cost.tipo_costo} · {formatDateTime(cost.fecha_costo)}</span>
              {cost.proveedor ? <span>Proveedor: {cost.proveedor}</span> : null}
            </div>
            <div className="repairs-cost-list__meta">
              <strong>{formatCurrency(cost.monto)}</strong>
              {isCreateMode ? (
                <button type="button" className="btn products-filter-actions__clear btn-sm" onClick={() => onLocalRemove?.(cost.local_id)}>
                  Quitar
                </button>
              ) : cost.id ? (
                <button type="button" className="btn products-filter-actions__apply btn-sm" onClick={() => setEditingId(cost.id)}>
                  Editar
                </button>
              ) : null}
            </div>
          </article>
        )) : <p className="muted-text mb-0">Sin costos registrados.</p>}
      </div>

      {isCreateMode ? (
        <CostForm
          key={`create-${costos.length}`}
          submitLabel="Agregar costo"
          errors={errors}
          onSubmit={addLocalCost}
        />
      ) : null}

      {!isCreateMode && isAdding ? (
        <CostForm
          key="remote-create"
          submitLabel="Agregar costo"
          saving={saving}
          errors={errors}
          onSubmit={createRemoteCost}
          onCancel={() => {
            setIsAdding(false);
            setErrors({});
          }}
        />
      ) : null}

      {!isCreateMode && editingCost ? (
        <CostForm
          key={editingCost.id}
          initialValue={editingCost}
          submitLabel="Guardar costo"
          saving={saving}
          errors={errors}
          onSubmit={updateRemoteCost}
          onCancel={() => {
            setEditingId(null);
            setErrors({});
          }}
        />
      ) : null}
    </article>
  );
}

export default ReparacionCostosPanel;
