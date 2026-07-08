import { useEffect, useState } from "react";
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

  return (
    <section className="products-page cuentas-page">
      <div className="products-page__header cuentas-page__header">
        <div>
          <p className="section-kicker">Cuentas por cobrar</p>
          <h2>Control de deudas</h2>
          <p>Consulta ventas con saldo pendiente y registra abonos cuando el cliente pague.</p>
        </div>
      </div>

      <div className="cuentas-summary">
        <article>
          <span>Total pendiente</span>
          <strong>{money(summary?.total_pendiente)}</strong>
        </article>
        <article>
          <span>Total pagado</span>
          <strong>{money(summary?.total_pagado)}</strong>
        </article>
        <article>
          <span>Cuentas</span>
          <strong>{summary?.cuentas_count ?? 0}</strong>
        </article>
      </div>

      <form className="surface-card cuentas-filters" onSubmit={applyFilters}>
        <label className="form-label">
          Cliente o codigo
          <input
            className="form-control"
            value={draftFilters.cliente}
            onChange={(event) => updateDraft("cliente", event.target.value)}
            placeholder="Buscar cliente, telefono o codigo"
          />
        </label>
        <label className="form-label">
          Estado
          <select
            className="form-select"
            value={draftFilters.estado}
            onChange={(event) => updateDraft("estado", event.target.value)}
          >
            <option value="">Todos</option>
            <option value="pendiente">Pendientes</option>
            <option value="pagada">Pagadas</option>
            <option value="vencida">Vencidas</option>
          </select>
        </label>
        <button type="submit" className="btn products-filter-actions__apply">Aplicar</button>
      </form>

      <div className="surface-card cuentas-table-shell">
        <div className="table-responsive">
          <table className="table align-middle products-table inventory-table cuentas-table">
            <thead>
              <tr>
                <th>Cuenta</th>
                <th>Cliente</th>
                <th>Venta</th>
                <th>Total</th>
                <th>Pagado</th>
                <th>Pendiente</th>
                <th>Fecha</th>
                <th className="text-end">Acciones</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr><td colSpan={8} className="text-center muted-text">Cargando cuentas...</td></tr>
              ) : cuentas.length ? cuentas.map((cuenta) => (
                <tr key={cuenta.id}>
                  <td>
                    <strong>{cuenta.codigo}</strong>
                    <span className={`cuentas-status cuentas-status--${cuenta.estado}`}>{cuenta.estado}</span>
                  </td>
                  <td>
                    <strong>{cuenta.cliente_nombre}</strong>
                    <span>{cuenta.cliente_telefono || "Sin telefono"}</span>
                  </td>
                  <td>{cuenta.venta?.numero_venta ?? "-"}</td>
                  <td>{money(cuenta.monto_original)}</td>
                  <td>{money(cuenta.monto_pagado)}</td>
                  <td><strong>{money(cuenta.saldo_pendiente)}</strong></td>
                  <td>{formatDate(cuenta.fecha_cuenta)}</td>
                  <td className="text-end">
                    <button
                      type="button"
                      className="btn products-filter-actions__apply btn-sm"
                      onClick={() => openAbono(cuenta)}
                      disabled={Number(cuenta.saldo_pendiente) <= 0}
                    >
                      Abonar
                    </button>
                  </td>
                </tr>
              )) : (
                <tr><td colSpan={8} className="text-center muted-text">No hay cuentas por cobrar.</td></tr>
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
        <div className="cuentas-abono-modal" role="dialog" aria-modal="true">
          <form className="cuentas-abono-modal__card" onSubmit={submitAbono}>
            <div className="cuentas-abono-modal__header">
              <div>
                <p className="section-kicker">Registrar abono</p>
                <h3>{selectedCuenta.cliente_nombre}</h3>
                <span>Pendiente: {money(selectedCuenta.saldo_pendiente)}</span>
              </div>
              <button type="button" className="btn btn-light" onClick={closeAbono}>Cerrar</button>
            </div>
            <label className="form-label">
              Monto
              <input
                className="form-control"
                value={abono.monto}
                onChange={(event) => updateAbono("monto", event.target.value)}
                inputMode="decimal"
                required
              />
            </label>
            <div className="cuentas-abono-modal__grid">
              <label className="form-label">
                Fecha
                <input
                  type="date"
                  className="form-control"
                  value={abono.fecha_abono}
                  onChange={(event) => updateAbono("fecha_abono", event.target.value)}
                  required
                />
              </label>
              <label className="form-label">
                Metodo
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
            <label className="form-label">
              Referencia
              <input
                className="form-control"
                value={abono.referencia}
                onChange={(event) => updateAbono("referencia", event.target.value)}
                placeholder="Comprobante o referencia opcional"
              />
            </label>
            <label className="form-label">
              Observacion
              <textarea
                className="form-control"
                rows="3"
                value={abono.observacion}
                onChange={(event) => updateAbono("observacion", event.target.value)}
              />
            </label>
            <div className="cuentas-abono-modal__actions">
              <button type="button" className="btn products-filter-actions__clear" onClick={closeAbono}>Cancelar</button>
              <button type="submit" className="btn products-filter-actions__apply" disabled={saving}>
                {saving ? "Guardando..." : "Guardar abono"}
              </button>
            </div>
          </form>
        </div>
      ) : null}
    </section>
  );
}

export default CuentasPorCobrarPage;
