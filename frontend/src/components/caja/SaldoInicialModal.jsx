import { useState } from "react";
import { CurrencyDollar, Info } from "../../icons/phosphor";
import AppModal from "../common/AppModal";
import { createMovimientoCaja } from "../../api/caja";
import { notifyError, notifySuccess } from "../../utils/toasts";

function currentLocalDateTime() {
  const date = new Date();
  date.setMinutes(date.getMinutes() - date.getTimezoneOffset());
  return date.toISOString().slice(0, 16);
}

function SaldoInicialModal({ onClose, onCreated }) {
  const [form, setForm] = useState({
    monto: "",
    fecha_movimiento: currentLocalDateTime(),
    observacion: "",
  });
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  function updateField(field, value) {
    setForm((current) => ({ ...current, [field]: value }));
  }

  async function handleSubmit(event) {
    event.preventDefault();

    const amount = Number(form.monto);

    if (!Number.isFinite(amount) || amount <= 0) {
      setError("Ingresa un monto mayor que cero.");
      return;
    }

    setSaving(true);
    setError("");

    try {
      const movimiento = await createMovimientoCaja({
        modulo_id: null,
        tipo_movimiento: "entrada",
        categoria_movimiento: "saldo_inicial",
        concepto: "Saldo inicial al comenzar a utilizar el sistema",
        monto: amount,
        fecha_movimiento: form.fecha_movimiento,
        referencia: "APERTURA-SISTEMA",
        observacion: form.observacion.trim() || null,
      });

      notifySuccess("Saldo inicial registrado correctamente.");
      onCreated?.(movimiento);
      onClose();
    } catch (requestError) {
      const message = requestError?.response?.data?.errors?.categoria_movimiento?.[0]
        ?? requestError?.response?.data?.message
        ?? "No se pudo registrar el saldo inicial.";
      setError(message);
      notifyError(message);
    } finally {
      setSaving(false);
    }
  }

  return (
    <AppModal
      overlayClassName="cash-create-modal cash-opening-modal"
      ariaLabel="Registrar saldo inicial"
      onClose={onClose}
      isDismissable={!saving}
    >
      <div
        className="cash-create-modal__content cash-opening-modal__content"
      >
        <div className="cash-create-modal__body">
          <form className="surface-card cash-form cash-opening-form" onSubmit={handleSubmit}>
            <div className="section-heading cash-opening-form__heading">
              <span className="cash-opening-form__icon" aria-hidden="true">
                <CurrencyDollar size={26} weight="bold" />
              </span>
              <div>
                <p className="section-kicker">Apertura del sistema</p>
                <h2>Registrar saldo inicial</h2>
                <p className="muted-text">
                  Ingresa solamente el dinero disponible en Caja al comenzar a usar TecnoFix.
                </p>
              </div>
            </div>

            <div className="cash-opening-form__notice">
              <Info size={20} weight="bold" aria-hidden="true" />
              <p>
                Este monto aumentará el balance disponible, pero no se contará como venta,
                ingreso operativo ni utilidad.
              </p>
            </div>

            <div className="cash-opening-form__fields">
              <label>
                <span className="form-label">Efectivo disponible</span>
                <div className="cash-money-input">
                  <span>$</span>
                  <input
                    type="number"
                    className="form-control"
                    min="0.01"
                    step="0.01"
                    inputMode="decimal"
                    value={form.monto}
                    onChange={(event) => updateField("monto", event.target.value)}
                    placeholder="0.00"
                    autoFocus
                    required
                  />
                </div>
              </label>

              <label>
                <span className="form-label">Fecha del saldo</span>
                <input
                  type="datetime-local"
                  className="form-control"
                  value={form.fecha_movimiento}
                  onChange={(event) => updateField("fecha_movimiento", event.target.value)}
                  required
                />
              </label>
            </div>

            <label>
              <span className="form-label">Observación opcional</span>
              <textarea
                className="form-control"
                rows="3"
                value={form.observacion}
                onChange={(event) => updateField("observacion", event.target.value)}
                placeholder="Ejemplo: efectivo contado al iniciar operaciones en TecnoFix"
              />
            </label>

            {error ? <div className="alert alert-danger mb-0">{error}</div> : null}

            <div className="products-filter-actions cash-opening-form__actions">
              <button type="button" className="btn btn-light" onClick={onClose} disabled={saving}>
                Cancelar
              </button>
              <button type="submit" className="btn btn-success cash-opening-form__submit" disabled={saving}>
                {saving ? "Guardando..." : "Registrar saldo inicial"}
              </button>
            </div>
          </form>
        </div>
      </div>
    </AppModal>
  );
}

export default SaldoInicialModal;
