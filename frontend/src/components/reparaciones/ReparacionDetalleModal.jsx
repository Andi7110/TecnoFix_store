import { useEffect, useState } from "react";
import ReparacionCostosPanel from "./ReparacionCostosPanel";
import ReparacionForm from "./ReparacionForm";
import ReparacionHistorial from "./ReparacionHistorial";
import { useReparacionForm } from "../../hooks/reparaciones/useReparacionForm";

function formatCurrency(value) {
  return new Intl.NumberFormat("es-SV", { style: "currency", currency: "USD" }).format(Number(value ?? 0));
}

function readableStatus(status) {
  const statuses = {
    recibido: "Recibido",
    diagnostico: "Diagnostico",
    en_reparacion: "En reparacion",
    listo: "Listo",
    entregado: "Entregado",
    cancelado: "Cancelado",
  };

  return statuses[status] ?? "Sin estado";
}

function ReparacionDetalleModal({ reparacionId, onClose, onUpdated }) {
  const [isEditing, setIsEditing] = useState(false);
  const form = useReparacionForm({
    reparacionId,
    onSuccess: () => {
      setIsEditing(false);
      onUpdated?.("Reparacion actualizada correctamente.");
      onClose();
    },
  });
  const isDelivered = form.values.estado_reparacion === "entregado";
  const readOnly = !isEditing;

  useEffect(() => {
    function handleKeyDown(event) {
      if (event.key === "Escape") {
        onClose();
      }
    }

    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    window.addEventListener("keydown", handleKeyDown);

    return () => {
      document.body.style.overflow = previousOverflow;
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, [onClose]);

  function handleCostCreated() {
    form.reload();
    onUpdated?.("Costo de reparacion agregado.");
  }

  const customerName = form.values?.cliente?.nombre || "Cliente sin nombre";
  const deviceName = [form.values?.marca, form.values?.modelo].filter(Boolean).join(" ") || "Equipo sin definir";
  const statusLabel = readableStatus(form.values?.estado_reparacion);
  const estimatedCost = formatCurrency(form.values?.costo_reparacion);
  const advance = formatCurrency(form.values?.anticipo);

  return (
    <div
      className="repair-detail-modal"
      role="dialog"
      aria-modal="true"
      aria-label="Detalle de reparacion"
      onClick={onClose}
    >
      <div
        className="repair-detail-modal__content"
        onClick={(event) => event.stopPropagation()}
      >
        <div className="repair-detail-modal__header">
          <div className="repair-detail-modal__eyebrow">
            <span className="repair-detail-modal__status">{statusLabel}</span>
            <span>{isEditing ? "Editando orden" : "Vista de orden"}</span>
          </div>
          <div className="repair-detail-modal__headline">
            <div>
              <p className="section-kicker">Taller</p>
              <h3>{deviceName}</h3>
              <p className="muted-text">{customerName}</p>
            </div>
            <div className="repair-detail-modal__header-actions">
              {readOnly ? (
                <button type="button" className="btn products-filter-actions__apply" onClick={() => setIsEditing(true)}>
                  Editar
                </button>
              ) : (
                <button
                  type="button"
                  className="btn products-filter-actions__clear"
                  onClick={() => {
                    setIsEditing(false);
                    form.reload();
                  }}
                >
                  Cancelar edicion
                </button>
              )}
              <button type="button" className="btn products-filter-actions__clear" onClick={onClose}>
                Salir
              </button>
            </div>
          </div>

          <div className="repair-detail-modal__summary" aria-label="Resumen de reparacion">
            <div>
              <span>Estado</span>
              <strong>{statusLabel}</strong>
            </div>
            <div>
              <span>Costo</span>
              <strong>{estimatedCost}</strong>
            </div>
            <div>
              <span>Anticipo</span>
              <strong>{advance}</strong>
            </div>
            <div>
              <span>Tipo</span>
              <strong>{form.values?.tipo_equipo || "No definido"}</strong>
            </div>
          </div>
          {isDelivered ? (
            <p className="repair-detail-modal__notice">Reparacion entregada. Puedes habilitar edicion si necesitas corregir datos.</p>
          ) : null}
        </div>

        <section className="repairs-edit-layout repair-detail-modal__layout">
          <div className="repair-detail-modal__main">
            <ReparacionForm
              title={isEditing ? "Editar datos de reparacion" : "Datos de reparacion"}
              onCancel={() => {
                if (isEditing) {
                  setIsEditing(false);
                  form.reload();
                  return;
                }

                onClose();
              }}
              onClienteChange={form.updateClienteField}
              readOnly={readOnly}
              hideReadOnlyActions
              {...form}
            />
          </div>

          <aside className="repair-detail-modal__aside">
            <ReparacionCostosPanel
              reparacionId={reparacionId}
              values={form.values}
              onCreated={handleCostCreated}
            />
            <ReparacionHistorial historiales={form.values.historiales ?? []} />
          </aside>
        </section>
      </div>
    </div>
  );
}

export default ReparacionDetalleModal;
