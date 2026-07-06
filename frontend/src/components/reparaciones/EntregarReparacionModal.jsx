import { useEffect, useMemo, useState } from "react";
import { formatMoneyInput, normalizeMoneyInput } from "../../utils/currencyInput";
import { localDateTimeInput } from "../../utils/dateTime";

function money(value) {
  return Number(value ?? 0).toFixed(2);
}

function EntregarReparacionModal({
  reparacion,
  saving,
  error,
  title = "Entregar y cobrar",
  kicker = "Entrega",
  submitLabel = "Confirmar entrega",
  defaultComment,
  requiredPaymentMessage = "Ingresa el monto recibido para registrar la entrega.",
  onCancel,
  onConfirm,
}) {
  const saldoPendiente = useMemo(
    () => Number(reparacion?.saldo_pendiente ?? 0),
    [reparacion],
  );
  const [montoRecibido, setMontoRecibido] = useState("0.00");
  const [metodoPago, setMetodoPago] = useState("efectivo");
  const [montoTransferencia, setMontoTransferencia] = useState("");
  const [referenciaTransferencia, setReferenciaTransferencia] = useState("");
  const [fechaMovimiento, setFechaMovimiento] = useState(localDateTimeInput());
  const [comentario, setComentario] = useState("");
  const [validationError, setValidationError] = useState("");
  const montoEfectivoNumber = Number(normalizeMoneyInput(montoRecibido) || 0);
  const montoTransferenciaNumber = Number(normalizeMoneyInput(montoTransferencia) || 0);
  const totalPagado = metodoPago === "efectivo"
    ? montoEfectivoNumber
    : metodoPago === "transferencia"
      ? montoTransferenciaNumber
      : montoEfectivoNumber + montoTransferenciaNumber;
  const cambio = Math.max(0, totalPagado - saldoPendiente);
  const faltante = Math.max(0, saldoPendiente - totalPagado);

  useEffect(() => {
    if (!reparacion) {
      return;
    }

    setMontoRecibido(money(reparacion.saldo_pendiente));
    setMetodoPago("efectivo");
    setMontoTransferencia("");
    setReferenciaTransferencia("");
    setFechaMovimiento(localDateTimeInput());
    setComentario("");
    setValidationError("");
  }, [reparacion]);

  if (!reparacion) {
    return null;
  }

  function handleSubmit(event) {
    event.preventDefault();

    const montoEfectivo = metodoPago === "transferencia"
      ? 0
      : Number(normalizeMoneyInput(montoRecibido) || 0);
    const montoTransferido = metodoPago === "efectivo"
      ? 0
      : Number(normalizeMoneyInput(montoTransferencia) || 0);
    const monto = metodoPago === "mixto"
      ? montoEfectivo + montoTransferido
      : metodoPago === "transferencia"
        ? montoTransferido
        : montoEfectivo;

    if (
      Number.isNaN(monto)
      || Number.isNaN(montoEfectivo)
      || Number.isNaN(montoTransferido)
      || monto < 0
      || montoEfectivo < 0
      || montoTransferido < 0
    ) {
      setValidationError("Ingresa montos validos.");
      return;
    }

    if (saldoPendiente > 0 && monto <= 0) {
      setValidationError(requiredPaymentMessage);
      return;
    }

    setValidationError("");

    onConfirm?.({
      monto_recibido: monto,
      metodo_pago: metodoPago,
      monto_efectivo: montoEfectivo,
      monto_transferencia: montoTransferido,
      referencia_transferencia: referenciaTransferencia.trim() || null,
      fecha_movimiento: fechaMovimiento,
      comentario: comentario.trim() || defaultComment || `Reparacion ${reparacion.codigo_reparacion} entregada y cobrada.`,
    });
  }

  function updateMetodoPago(nextMetodoPago) {
    setMetodoPago(nextMetodoPago);
    setValidationError("");

    if (nextMetodoPago === "efectivo") {
      setMontoRecibido(money(saldoPendiente));
      setMontoTransferencia("");
      setReferenciaTransferencia("");
    } else if (nextMetodoPago === "transferencia") {
      setMontoRecibido("");
      setMontoTransferencia(money(saldoPendiente));
    } else {
      setMontoRecibido("");
      setMontoTransferencia("");
    }
  }

  return (
    <div className="repair-delivery-modal" role="dialog" aria-modal="true" aria-labelledby="repair-delivery-title">
      <div className="repair-delivery-modal__backdrop" onClick={saving ? undefined : onCancel} />
      <form className="repair-delivery-modal__panel" onSubmit={handleSubmit}>
        <div className="section-heading">
          <div>
            <p className="section-kicker">{kicker}</p>
            <h2 id="repair-delivery-title">{title}</h2>
          </div>
        </div>

        {error ? <div className="alert alert-danger">{error}</div> : null}
        {validationError ? <div className="alert alert-danger">{validationError}</div> : null}

        <div className="repair-delivery-summary">
          <div>
            <span>Costo</span>
            <strong>${money(reparacion.costo_reparacion)}</strong>
          </div>
          <div>
            <span>Anticipo</span>
            <strong>${money(reparacion.anticipo)}</strong>
          </div>
          <div>
            <span>Saldo</span>
            <strong>${money(reparacion.saldo_pendiente)}</strong>
          </div>
        </div>

        <div className="mb-3">
          <label className="form-label">Metodo de pago</label>
          <select
            className="form-select"
            value={metodoPago}
            onChange={(event) => updateMetodoPago(event.target.value)}
            disabled={saving}
          >
            <option value="efectivo">Efectivo</option>
            <option value="transferencia">Transferencia</option>
            <option value="mixto">Mixto</option>
          </select>
        </div>

        {(metodoPago === "efectivo" || metodoPago === "mixto") ? (
          <div className="mb-3">
            <label className="form-label">{metodoPago === "mixto" ? "Monto en efectivo" : "Monto recibido"}</label>
            <div className="input-group product-money-input">
              <span className="input-group-text">$</span>
              <input
                className="form-control text-end"
                type="text"
                inputMode="decimal"
                autoComplete="off"
                value={montoRecibido}
                onChange={(event) => {
                  setMontoRecibido(normalizeMoneyInput(event.target.value));
                  setValidationError("");
                }}
                onBlur={() => setMontoRecibido(formatMoneyInput(montoRecibido))}
                disabled={saving}
              />
            </div>
          </div>
        ) : null}

        {(metodoPago === "transferencia" || metodoPago === "mixto") ? (
          <>
            <div className="mb-3">
              <label className="form-label">Monto por transferencia</label>
              <div className="input-group product-money-input">
                <span className="input-group-text">$</span>
                <input
                  className="form-control text-end"
                  type="text"
                  inputMode="decimal"
                  autoComplete="off"
                  value={montoTransferencia}
                  onChange={(event) => {
                    setMontoTransferencia(normalizeMoneyInput(event.target.value));
                    setValidationError("");
                  }}
                  onBlur={() => setMontoTransferencia(formatMoneyInput(montoTransferencia))}
                  disabled={saving}
                />
              </div>
            </div>
            <div className="mb-3">
              <label className="form-label">Referencia transferencia</label>
              <input
                className="form-control"
                value={referenciaTransferencia}
                onChange={(event) => setReferenciaTransferencia(event.target.value)}
                maxLength="100"
                disabled={saving}
                placeholder="Numero o codigo de transferencia"
              />
            </div>
          </>
        ) : null}

        <div className="repair-delivery-balance">
          <div>
            <span className="muted-text">Total recibido</span>
            <strong>${money(totalPagado)}</strong>
          </div>
          <div className={faltante > 0 ? "is-pending" : "is-ok"}>
            <span className="muted-text">{faltante > 0 ? "Restan" : "Cambio"}</span>
            <strong>${money(faltante > 0 ? faltante : cambio)}</strong>
          </div>
        </div>

        <div className="mb-3">
          <label className="form-label">Fecha de cobro</label>
          <input
            className="form-control"
            type="datetime-local"
            value={fechaMovimiento}
            onChange={(event) => setFechaMovimiento(event.target.value)}
            disabled={saving}
          />
        </div>

        <div className="mb-3">
          <label className="form-label">Comentario</label>
          <textarea
            className="form-control"
            rows="3"
            value={comentario}
            onChange={(event) => setComentario(event.target.value)}
            disabled={saving}
            placeholder="Observacion opcional para historial y caja"
          />
        </div>

        <div className="products-filter-actions mt-4">
          <button type="submit" className="btn products-filter-actions__apply" disabled={saving}>
            {saving ? "Procesando..." : submitLabel}
          </button>
          <button type="button" className="btn products-filter-actions__clear" onClick={onCancel} disabled={saving}>
            Cancelar
          </button>
        </div>
      </form>
    </div>
  );
}

export default EntregarReparacionModal;
