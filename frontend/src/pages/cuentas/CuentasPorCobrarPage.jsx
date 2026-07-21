import { useEffect, useState } from "react";
import { CheckCircle, CurrencyDollar, HandCoins, Info, Receipt, Users } from "../../icons/phosphor";
import { createAbonoCuentaPorCobrar, listCuentasPorCobrar } from "../../api/cuentasPorCobrar";
import ProductosPagination from "../../components/productos/ProductosPagination";
import { notifyError, notifySuccess } from "../../utils/toasts";

const today = new Date().toISOString().slice(0, 10);

const initialFilters = {
  estado: "pendiente",
  cliente: "",
  per_page: 10,
  page: 1,
};

const initialAbono = {
  monto: "",
  fecha_abono: today,
  metodo_pago: "efectivo",
  referencia: "",
  observacion: "",
};

function money(value) {
  return new Intl.NumberFormat("es-SV", {
    style: "currency",
    currency: "USD",
  }).format(Number(value ?? 0));
}

function formatDate(value) {
  if (!value) {
    return "-";
  }

  return new Intl.DateTimeFormat("es-SV", {
    dateStyle: "medium",
    timeStyle: "short",
  }).format(new Date(value));
}

function CuentasPorCobrarPage() {
  const [filters, setFilters] = useState(initialFilters);
  const [draftFilters, setDraftFilters] = useState(initialFilters);
  const [cuentas, setCuentas] = useState([]);
  const [summary, setSummary] = useState(null);
  const [meta, setMeta] = useState(null);
  const [loading, setLoading] = useState(true);
  const [selectedCuenta, setSelectedCuenta] = useState(null);
  const [abono, setAbono] = useState(initialAbono);
  const [saving, setSaving] = useState(false);

  async function loadCuentas(nextFilters = filters) {
    setLoading(true);

    try {
      const response = await listCuentasPorCobrar(nextFilters);
      setCuentas(response.data ?? []);
      setSummary(response.summary ?? null);
      setMeta(response.meta ?? null);
    } catch (error) {
      notifyError(error?.response?.data?.message ?? "No se pudieron cargar las cuentas por cobrar.");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadCuentas(filters);
  }, [filters]);

  function updateDraft(field, value) {
    setDraftFilters((current) => ({
      ...current,
      [field]: value,
    }));
  }

  function applyFilters(event) {
    event.preventDefault();
    setFilters({ ...draftFilters, page: 1 });
  }

  function clearFilters() {
    setDraftFilters(initialFilters);
    setFilters(initialFilters);
  }

  function openAbono(cuenta) {
    setSelectedCuenta(cuenta);
    setAbono({
      ...initialAbono,
      monto: String(cuenta.saldo_pendiente ?? ""),
    });
  }

  function closeAbono() {
    setSelectedCuenta(null);
    setAbono(initialAbono);
  }

  function updateAbono(field, value) {
    setAbono((current) => ({
      ...current,
      [field]: value,
    }));
  }

  async function submitAbono(event) {
    event.preventDefault();

    if (!selectedCuenta) {
      return;
    }

    const paymentAmount = Number(abono.monto);
    const pendingAmount = Number(selectedCuenta.saldo_pendiente ?? 0);

    if (paymentAmount <= 0 || paymentAmount > pendingAmount) {
      notifyError(`Ingresa un monto entre ${money(0.01)} y ${money(pendingAmount)}.`);
      return;
    }

    setSaving(true);

    try {
      await createAbonoCuentaPorCobrar(selectedCuenta.id, abono);
      notifySuccess("Abono registrado correctamente.");
      closeAbono();
      await loadCuentas(filters);
    } catch (error) {
      notifyError(error?.response?.data?.message ?? "No se pudo registrar el abono.");
    } finally {
      setSaving(false);
    }
  }

  const paymentPreview = Number(abono.monto || 0);
  const pendingPreview = Number(selectedCuenta?.saldo_pendiente ?? 0);
  const remainingPreview = Math.max(pendingPreview - paymentPreview, 0);

  return (
    <section className="products-page products-page--minimal cuentas-page">
      <div className="products-page__header products-page__header--minimal cuentas-page__header">
        <div>
          <p className="section-kicker">Cuentas por cobrar</p>
          <h2>Control de deudas</h2>
          <p className="muted-text">Consulta quién debe, cuánto falta y registra cada pago de forma sencilla.</p>
        </div>
      </div>

      <div className="cuentas-help-strip">
        <Info size={20} weight="bold" />
        <div>
          <strong>¿Cómo se crea una cuenta por cobrar?</strong>
          <span>Se genera automáticamente cuando haces una venta al crédito. Aquí solamente consultas la deuda y registras los pagos del cliente.</span>
        </div>
      </div>

      <div className="cuentas-summary">
        <article>
          <span className="cuentas-summary__icon cuentas-summary__icon--pending"><CurrencyDollar size={20} weight="bold" /></span>
          <span>Total por cobrar</span>
          <strong>{money(summary?.total_pendiente)}</strong>
          <small>Dinero que los clientes aún deben.</small>
        </article>
        <article>
          <span className="cuentas-summary__icon cuentas-summary__icon--paid"><CheckCircle size={20} weight="bold" /></span>
          <span>Dinero recuperado</span>
          <strong>{money(summary?.total_pagado)}</strong>
          <small>Pagos recibidos de estas cuentas.</small>
        </article>
        <article>
          <span className="cuentas-summary__icon"><Users size={20} weight="bold" /></span>
          <span>Cuentas encontradas</span>
          <strong>{summary?.cuentas_count ?? 0}</strong>
          <small>Según los filtros seleccionados.</small>
        </article>
      </div>

      <div className="surface-card cuentas-table-shell">
        <div className="cuentas-table-shell__heading">
          <div>
            <p className="section-kicker">Cuentas de clientes</p>
            <h3>Deudas y pagos</h3>
            <p className="muted-text">Busca al cliente y presiona “Registrar pago” cuando recibas dinero.</p>
          </div>
          <span>{meta?.total ?? cuentas.length} cuentas</span>
        </div>

        <form className="cuentas-filters" onSubmit={applyFilters}>
          <label>
            <span className="form-label">Buscar cliente o cuenta</span>
            <input
              className="form-control"
              value={draftFilters.cliente}
              onChange={(event) => updateDraft("cliente", event.target.value)}
              placeholder="Nombre, teléfono o código"
            />
          </label>
          <label>
            <span className="form-label">Mostrar</span>
            <select
              className="form-select"
              value={draftFilters.estado}
              onChange={(event) => updateDraft("estado", event.target.value)}
            >
              <option value="pendiente">Con saldo pendiente</option>
              <option value="vencida">Vencidas</option>
              <option value="pagada">Pagadas</option>
              <option value="">Todas las cuentas</option>
            </select>
          </label>
          <div className="cuentas-filters__actions">
            <button type="submit" className="btn products-filter-actions__apply">Buscar</button>
            <button type="button" className="btn products-filter-actions__clear" onClick={clearFilters}>Limpiar</button>
          </div>
        </form>

        <div className="table-responsive">
          <table className="table align-middle products-table inventory-table cuentas-table">
            <thead>
              <tr>
                <th>Cuenta</th>
                <th>Cliente</th>
                <th>Venta y fecha</th>
                <th>Total</th>
                <th>Pagado</th>
                <th>Pendiente</th>
                <th className="text-end">Acciones</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr><td colSpan={7} className="text-center muted-text">Cargando cuentas...</td></tr>
              ) : cuentas.length ? cuentas.map((cuenta) => (
                <tr key={cuenta.id}>
                  <td>
                    <strong>{cuenta.codigo}</strong>
                    <span className={`cuentas-status cuentas-status--${cuenta.estado}`}>{cuenta.estado}</span>
                  </td>
                  <td>
                    <strong>{cuenta.cliente_nombre}</strong>
                    <span>{cuenta.cliente_telefono || "Sin teléfono"}</span>
                  </td>
                  <td><strong>{cuenta.venta?.numero_venta ?? "-"}</strong><span>{formatDate(cuenta.fecha_cuenta)}</span></td>
                  <td>{money(cuenta.monto_original)}</td>
                  <td>{money(cuenta.monto_pagado)}</td>
                  <td><strong>{money(cuenta.saldo_pendiente)}</strong></td>
                  <td className="text-end">
                    <button
                      type="button"
                      className="btn products-filter-actions__apply btn-sm"
                      onClick={() => openAbono(cuenta)}
                      disabled={Number(cuenta.saldo_pendiente) <= 0}
                    >
                      Registrar pago
                    </button>
                  </td>
                </tr>
              )) : (
                <tr><td colSpan={7} className="text-center muted-text">No encontramos cuentas con estos filtros.</td></tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {meta ? (
        <ProductosPagination
          meta={meta}
          perPage={filters.per_page}
          onPageChange={(page) => setFilters((current) => ({ ...current, page }))}
          onPerPageChange={(perPage) => setFilters((current) => ({ ...current, per_page: perPage, page: 1 }))}
        />
      ) : null}

      {selectedCuenta ? (
        <div className="cuentas-abono-modal" role="dialog" aria-modal="true" aria-labelledby="abono-title" onClick={() => !saving && closeAbono()}>
          <form className="cuentas-abono-modal__card" onSubmit={submitAbono} onClick={(event) => event.stopPropagation()}>
            <div className="cuentas-abono-modal__header">
              <span className="cuentas-abono-modal__icon"><HandCoins size={25} weight="bold" /></span>
              <div>
                <p className="section-kicker">Nuevo pago</p>
                <h3 id="abono-title">Registrar pago de cliente</h3>
                <span>Revisa el monto antes de guardarlo.</span>
              </div>
            </div>

            <div className="cuentas-abono-modal__account">
              <div><span>Cliente</span><strong>{selectedCuenta.cliente_nombre}</strong></div>
              <div><span>Cuenta</span><strong>{selectedCuenta.codigo}</strong></div>
              <div><span>Saldo pendiente</span><strong>{money(selectedCuenta.saldo_pendiente)}</strong></div>
            </div>

            <div className="cuentas-abono-modal__amount-row">
              <label>
                <span className="form-label">¿Cuánto pagó?</span>
                <div className="cuentas-money-input"><span>$</span><input type="number" min="0.01" max={selectedCuenta.saldo_pendiente} step="0.01" className="form-control" value={abono.monto} onChange={(event) => updateAbono("monto", event.target.value)} required /></div>
              </label>
              <div className="cuentas-abono-modal__quick-actions">
                <button type="button" onClick={() => updateAbono("monto", String(selectedCuenta.saldo_pendiente))}>Saldo completo</button>
                <button type="button" onClick={() => updateAbono("monto", (Number(selectedCuenta.saldo_pendiente) / 2).toFixed(2))}>La mitad</button>
              </div>
            </div>

            <div className="cuentas-abono-modal__remaining">
              <span>Después de este pago quedará pendiente</span>
              <strong>{money(remainingPreview)}</strong>
            </div>

            <div className="cuentas-abono-modal__grid">
              <label>
                <span className="form-label">Fecha del pago</span>
                <input
                  type="date"
                  className="form-control"
                  value={abono.fecha_abono}
                  onChange={(event) => updateAbono("fecha_abono", event.target.value)}
                  required
                />
              </label>
              <label>
                <span className="form-label">Forma de pago</span>
                <select
                  className="form-select"
                  value={abono.metodo_pago}
                  onChange={(event) => updateAbono("metodo_pago", event.target.value)}
                >
                  <option value="efectivo">Efectivo</option>
                  <option value="transferencia">Transferencia</option>
                  <option value="mixto">Mixto</option>
                </select>
              </label>
            </div>
            <details className="cuentas-abono-modal__optional">
              <summary>Agregar referencia o nota</summary>
              <div>
                <label><span className="form-label">Referencia</span><input className="form-control" value={abono.referencia} onChange={(event) => updateAbono("referencia", event.target.value)} placeholder="Número de comprobante" /></label>
                <label><span className="form-label">Nota</span><textarea className="form-control" rows="2" value={abono.observacion} onChange={(event) => updateAbono("observacion", event.target.value)} placeholder="Aclaración opcional" /></label>
              </div>
            </details>
            <div className="cuentas-abono-modal__actions">
              <button type="button" className="btn products-filter-actions__clear" onClick={closeAbono} disabled={saving}>Volver</button>
              <button type="submit" className="btn products-filter-actions__apply" disabled={saving}>
                <Receipt size={18} weight="bold" />
                {saving ? "Registrando..." : `Registrar pago de ${money(paymentPreview)}`}
              </button>
            </div>
          </form>
        </div>
      ) : null}
    </section>
  );
}

export default CuentasPorCobrarPage;
