import { useEffect, useMemo, useState } from "react";
import { Calculator, Info, Package, Plus, Receipt, TrendDown, TrendUp, X } from "../../icons/phosphor";
import { createCompraInventario, createCosto, listCostos } from "../../api/costos";
import { listModulos } from "../../api/inventarioCatalogos";
import { listProductos } from "../../api/productos";
import ProductosPagination from "../../components/productos/ProductosPagination";
import { notifyError, notifySuccess } from "../../utils/toasts";

const today = new Date().toISOString().slice(0, 10);
const monthStart = `${today.slice(0, 7)}-01`;
const [currentYear, currentMonth] = today.slice(0, 7).split("-").map(Number);
const monthEnd = `${today.slice(0, 7)}-${String(new Date(currentYear, currentMonth, 0).getDate()).padStart(2, "0")}`;

const initialFilters = {
  fecha_desde: monthStart,
  fecha_hasta: monthEnd,
  categoria: "",
  tipo_costo: "",
  per_page: 10,
  page: 1,
};

const initialForm = {
  concepto: "",
  categoria: "transporte",
  tipo_costo: "operativo",
  frecuencia: "unico",
  monto: "",
  fecha_costo: today,
  modulo_id: "",
  producto_id: "",
  cantidad_distribucion: "",
  registrar_en_caja: true,
  observacion: "",
  comprobantes: [],
  tipo_comprobante: "ticket",
  proveedor_comprobante: "",
  fecha_documento: today,
  periodo_desde: "",
  periodo_hasta: "",
  dias_cobrados: "",
  tarifa_diaria: "1.00",
};

const initialPurchaseForm = {
  tipo_compra: "accesorios",
  monto: "",
  fecha_compra: today,
  registrar_en_caja: true,
  observacion: "",
  comprobantes: [],
  tipo_comprobante: "factura",
  proveedor_comprobante: "",
  fecha_documento: today,
};

const purchaseTypes = [
  ["accesorios", "Accesorios"],
  ["libreria", "Librería"],
  ["otro", "Otro"],
];

const categories = [
  ["transporte", "Transporte"],
  ["alquiler", "Alquiler"],
  ["nomina", "Empleado / nomina"],
  ["servicios", "Servicios"],
  ["mercaderia", "Mercaderia"],
  ["empaque", "Empaque"],
  ["comisiones", "Comisiones"],
  ["mantenimiento", "Mantenimiento"],
  ["otro", "Otro"],
];

const expenseCategories = categories.filter(([value]) => value !== "mercaderia");

const types = [
  ["operativo", "Operativo"],
  ["producto", "Producto"],
  ["compra", "Compra / lote"],
  ["nomina", "Nomina"],
];

const frequencies = [
  ["unico", "Unico"],
  ["diario", "Diario"],
  ["semanal", "Semanal"],
  ["mensual", "Mensual"],
];

function money(value) {
  return new Intl.NumberFormat("es-SV", {
    style: "currency",
    currency: "USD",
  }).format(Number(value ?? 0));
}

function labelFrom(list, value) {
  return list.find(([key]) => key === value)?.[1] ?? value;
}

function CostosPage() {
  const [filters, setFilters] = useState(initialFilters);
  const [draftFilters, setDraftFilters] = useState(initialFilters);
  const [selectedMonth, setSelectedMonth] = useState(today.slice(0, 7));
  const [form, setForm] = useState(initialForm);
  const [costos, setCostos] = useState([]);
  const [summary, setSummary] = useState(null);
  const [meta, setMeta] = useState(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [reviewOpen, setReviewOpen] = useState(false);
  const [expenseModalOpen, setExpenseModalOpen] = useState(false);
  const [purchaseModalOpen, setPurchaseModalOpen] = useState(false);
  const [purchaseForm, setPurchaseForm] = useState(initialPurchaseForm);
  const [purchaseSaving, setPurchaseSaving] = useState(false);
  const [purchaseFileInputKey, setPurchaseFileInputKey] = useState(0);
  const [fileInputKey, setFileInputKey] = useState(0);
  const [productos, setProductos] = useState([]);
  const [modulos, setModulos] = useState([]);

  const productOptions = useMemo(
    () => productos.map((producto) => ({
      id: producto.id,
      label: `${producto.codigo ?? "SIN-COD"} - ${producto.nombre}`,
    })),
    [productos],
  );

  async function loadCostos(nextFilters = filters) {
    setLoading(true);

    try {
      const response = await listCostos(nextFilters);
      setCostos(response.data ?? []);
      setSummary(response.summary ?? null);
      setMeta(response.meta ?? null);
    } catch (error) {
      notifyError(error?.response?.data?.message ?? "No se pudieron cargar los costos.");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadCostos(filters);
  }, [filters]);

  useEffect(() => {
    let ignore = false;

    async function loadCatalogos() {
      try {
        const [modulosData, productosResponse] = await Promise.allSettled([
          listModulos(),
          listProductos({ per_page: 100 }),
        ]);

        if (!ignore) {
          if (modulosData.status === "fulfilled") {
            setModulos(modulosData.value ?? []);
          }

          if (productosResponse.status === "fulfilled") {
            setProductos(productosResponse.value.data ?? []);
          }
        }
      } catch {
        // Los catalogos son opcionales para registrar costos generales.
      }
    }

    loadCatalogos();

    return () => {
      ignore = true;
    };
  }, []);

  function updateForm(name, value) {
    setForm((current) => ({
      ...current,
      [name]: value,
      ...(name === "fecha_costo" ? { fecha_documento: value } : {}),
    }));
  }

  function selectCategory(category) {
    const inferredType = category === "nomina"
      ? "nomina"
      : category === "mercaderia"
        ? "compra"
        : "operativo";

    setForm((current) => ({
      ...current,
      categoria: category,
      tipo_costo: inferredType,
    }));
  }

  function updatePurchaseForm(name, value) {
    setPurchaseForm((current) => ({
      ...current,
      [name]: value,
      ...(name === "fecha_compra" ? { fecha_documento: value } : {}),
    }));
  }

  function updateDraft(name, value) {
    if (name === "fecha_desde" || name === "fecha_hasta") {
      setSelectedMonth("");
    }

    setDraftFilters((current) => ({
      ...current,
      [name]: value,
    }));
  }

  function selectMonth(value) {
    setSelectedMonth(value);

    if (!value) return;

    const [year, month] = value.split("-").map(Number);
    const lastDay = new Date(year, month, 0).getDate();

    setDraftFilters((current) => ({
      ...current,
      fecha_desde: `${value}-01`,
      fecha_hasta: `${value}-${String(lastDay).padStart(2, "0")}`,
    }));
  }

  function openReview() {
    if (!form.concepto.trim() || amountPreview <= 0 || !form.fecha_costo) {
      notifyError("Completa el concepto, el monto y la fecha antes de continuar.");
      return;
    }

    setReviewOpen(true);
  }

  async function confirmCosto() {
    setSaving(true);

    try {
      await createCosto({
        ...form,
        monto: Number(form.monto),
        modulo_id: form.modulo_id || null,
        producto_id: form.producto_id || null,
        cantidad_distribucion: form.cantidad_distribucion || null,
      });
      notifySuccess("Costo registrado correctamente.");
      setReviewOpen(false);
      setExpenseModalOpen(false);
      setFileInputKey((current) => current + 1);
      setForm((current) => ({
        ...initialForm,
        fecha_costo: current.fecha_costo,
      }));
      loadCostos(filters);
    } catch (error) {
      const message = error?.response?.data?.message
        ?? Object.values(error?.response?.data?.errors ?? {})?.[0]?.[0]
        ?? "No se pudo registrar el costo.";
      notifyError(message);
    } finally {
      setSaving(false);
    }
  }

  async function confirmPurchase() {
    if (Number(purchaseForm.monto) <= 0) {
      notifyError("Indica el monto utilizado para la compra.");
      return;
    }

    setPurchaseSaving(true);

    try {
      await createCompraInventario({
        ...purchaseForm,
        monto: Number(purchaseForm.monto),
      });
      notifySuccess("Compra registrada correctamente.");
      setPurchaseModalOpen(false);
      setPurchaseFileInputKey((current) => current + 1);
      setPurchaseForm((current) => ({ ...initialPurchaseForm, fecha_compra: current.fecha_compra, fecha_documento: current.fecha_compra }));
      loadCostos(filters);
    } catch (error) {
      const message = error?.response?.data?.message
        ?? Object.values(error?.response?.data?.errors ?? {})?.[0]?.[0]
        ?? "No se pudo registrar la compra.";
      notifyError(message);
    } finally {
      setPurchaseSaving(false);
    }
  }

  function applyFilters(event) {
    event.preventDefault();
    setFilters({
      ...draftFilters,
      page: 1,
    });
  }

  function clearFilters() {
    setSelectedMonth(today.slice(0, 7));
    setDraftFilters(initialFilters);
    setFilters(initialFilters);
  }

  function changePage(page) {
    setFilters((current) => ({
      ...current,
      page,
    }));
  }

  const netTone = Number(summary?.utilidad_neta ?? 0) >= 0 ? "positive" : "negative";
  const amountPreview = Number(form.monto || 0);
  const unitCostPreview = Number(form.cantidad_distribucion) > 0
    ? amountPreview / Number(form.cantidad_distribucion)
    : null;
  const rentalTotal = Number(form.dias_cobrados || 0) * Number(form.tarifa_diaria || 0);
  const purchaseTotal = Number(purchaseForm.monto || 0);

  return (
    <section className="products-page products-page--minimal costs-page">
      <div className="products-page__header products-page__header--minimal">
        <div>
          <p className="section-kicker">Gastos y compras</p>
          <h2>Gastos y compras de productos</h2>
          <p className="muted-text">
            Registra cada salida en el lugar correcto y conoce la utilidad real de la tienda.
          </p>
        </div>
      </div>

      <section className="costs-entry-choice" aria-label="Acciones de gastos y compras">
        <button type="button" className="costs-entry-choice__button costs-entry-choice__button--expense" onClick={() => setExpenseModalOpen(true)}>
          <span><Receipt size={24} weight="bold" /></span>
          <div><strong>Registrar gasto</strong><small>Alquiler, servicios, transporte, salarios y otros pagos.</small></div>
          <Plus size={20} weight="bold" />
        </button>
        <button type="button" className="costs-entry-choice__button costs-entry-choice__button--purchase" onClick={() => setPurchaseModalOpen(true)}>
          <span><Package size={24} weight="bold" /></span>
          <div><strong>Registrar compra de productos</strong><small>Anota el dinero usado en accesorios, librería u otras compras.</small></div>
          <Plus size={20} weight="bold" />
        </button>
      </section>

      <div className="costs-summary-grid">
        <article className="surface-card costs-summary-card">
          <span className="costs-summary-card__icon"><TrendUp size={19} weight="bold" /></span>
          <p className="section-kicker">Ventas del periodo</p>
          <h3>{money(summary?.ventas_netas)}</h3>
          <span className="muted-text">Dinero generado por ventas.</span>
        </article>
        <article className="surface-card costs-summary-card">
          <span className="costs-summary-card__icon"><Calculator size={19} weight="bold" /></span>
          <p className="section-kicker">Ganancia antes de gastos</p>
          <h3>{money(summary?.utilidad_bruta)}</h3>
          <span className="muted-text">Ventas menos costo del producto.</span>
        </article>
        <article className="surface-card costs-summary-card">
          <span className="costs-summary-card__icon"><TrendDown size={19} weight="bold" /></span>
          <p className="section-kicker">Gastos registrados</p>
          <h3>{money(summary?.costos_operativos)}</h3>
          <span className="muted-text">Pagos agregados en este menú.</span>
        </article>
        <article className="surface-card costs-summary-card">
          <span className="costs-summary-card__icon"><Package size={19} weight="bold" /></span>
          <p className="section-kicker">Compras de productos</p>
          <h3>{money(summary?.compras_inventario)}</h3>
          <span className="muted-text">Dinero utilizado para comprar productos.</span>
        </article>
        <article className={`surface-card costs-summary-card costs-summary-card--${netTone}`}>
          <span className="costs-summary-card__icon"><Calculator size={19} weight="bold" /></span>
          <p className="section-kicker">Resultado estimado</p>
          <h3>{money(summary?.utilidad_neta)}</h3>
          <span className="muted-text">Margen {Number(summary?.margen_neto_porcentaje ?? 0).toFixed(2)}%</span>
        </article>
      </div>

      {expenseModalOpen ? (
      <div className="costs-entry-modal" role="dialog" aria-modal="true" aria-labelledby="expense-form-title" onClick={() => !saving && setExpenseModalOpen(false)}>
        <div className="costs-entry-modal__panel" onClick={(event) => event.stopPropagation()}>
          <button type="button" className="costs-entry-modal__close" aria-label="Cerrar formulario" onClick={() => setExpenseModalOpen(false)} disabled={saving}><X size={20} weight="bold" /></button>
      <div className="costs-layout">
        <form className="surface-card costs-form" onSubmit={(event) => event.preventDefault()}>
          <div className="costs-form__heading">
            <span className="costs-form__step">1</span>
            <div>
              <p className="section-kicker">Nuevo costo</p>
              <h3 id="expense-form-title">¿Qué pagaste?</h3>
              <p className="muted-text">Completa los datos principales. Lo demás es opcional.</p>
            </div>
          </div>

          <div className="costs-form__essential-grid">
            <label className="costs-form__concept">
              <span className="form-label">¿En qué gastaste?</span>
              <input className="form-control" value={form.concepto} onChange={(event) => updateForm("concepto", event.target.value)} placeholder="Ej. Pago de internet del local" autoFocus required />
              <small>Escribe una descripción que puedas reconocer después.</small>
            </label>
            <label>
              <span className="form-label">¿Cuánto pagaste?</span>
              <div className="costs-money-input"><span>$</span><input type="number" min="0.01" step="0.01" className="form-control" value={form.monto} onChange={(event) => updateForm("monto", event.target.value)} placeholder="0.00" required /></div>
            </label>
            <label>
              <span className="form-label">Fecha</span>
              <input type="date" className="form-control" value={form.fecha_costo} onChange={(event) => updateForm("fecha_costo", event.target.value)} required />
            </label>
          </div>

          <fieldset className="costs-category-picker">
            <legend>¿Qué clase de gasto fue?</legend>
            <div>
              {expenseCategories.map(([value, label]) => (
                <button key={value} type="button" className={form.categoria === value ? "is-selected" : ""} onClick={() => selectCategory(value)}>
                  {label}
                </button>
              ))}
            </div>
          </fieldset>

          <label className="costs-form__check">
            <input type="checkbox" checked={form.registrar_en_caja} onChange={(event) => updateForm("registrar_en_caja", event.target.checked)} />
            <span><strong>Descontarlo también de Caja</strong><small>Creará automáticamente una salida por {money(amountPreview)}.</small></span>
          </label>

          <section className="costs-receipt-upload">
            <div className="costs-receipt-upload__heading">
              <span><Receipt size={20} weight="bold" /></span>
              <div><strong>Adjuntar factura o ticket</strong><small>PDF o fotografía. Puedes seleccionar hasta 5 archivos de 10 MB.</small></div>
            </div>
            <div className="costs-receipt-upload__grid">
              <label className="costs-receipt-upload__file">
                <span className="form-label">Archivos</span>
                <input key={fileInputKey} type="file" accept="application/pdf,image/jpeg,image/png,image/webp" multiple onChange={(event) => updateForm("comprobantes", Array.from(event.target.files ?? []).slice(0, 5))} />
                <small>{form.comprobantes.length ? `${form.comprobantes.length} archivo(s): ${form.comprobantes.map((file) => file.name).join(", ")}` : "Ningún archivo seleccionado."}</small>
              </label>
              <label>
                <span className="form-label">Tipo de comprobante</span>
                <select className="form-select" value={form.tipo_comprobante} onChange={(event) => updateForm("tipo_comprobante", event.target.value)}>
                  <option value="ticket">Ticket</option><option value="factura">Factura</option><option value="recibo">Recibo</option><option value="otro">Otro</option>
                </select>
              </label>
              <label>
                <span className="form-label">Proveedor o negocio</span>
                <input className="form-control" value={form.proveedor_comprobante} onChange={(event) => updateForm("proveedor_comprobante", event.target.value)} placeholder="Opcional" />
              </label>
              <label>
                <span className="form-label">Fecha del comprobante</span>
                <input type="date" className="form-control" value={form.fecha_documento} onChange={(event) => updateForm("fecha_documento", event.target.value)} />
              </label>
            </div>

            {form.categoria === "alquiler" ? (
              <div className="costs-rental-details">
                <div className="costs-rental-details__title"><Info size={17} /><span>Datos del ticket de alquiler</span></div>
                <label><span className="form-label">Desde</span><input type="date" className="form-control" value={form.periodo_desde} onChange={(event) => updateForm("periodo_desde", event.target.value)} /></label>
                <label><span className="form-label">Hasta</span><input type="date" className="form-control" value={form.periodo_hasta} onChange={(event) => updateForm("periodo_hasta", event.target.value)} /></label>
                <label><span className="form-label">Días cobrados</span><input type="number" min="1" className="form-control" value={form.dias_cobrados} onChange={(event) => updateForm("dias_cobrados", event.target.value)} placeholder="Ej. 5" /></label>
                <label><span className="form-label">Precio por día</span><div className="costs-money-input"><span>$</span><input type="number" min="0.01" step="0.01" className="form-control" value={form.tarifa_diaria} onChange={(event) => updateForm("tarifa_diaria", event.target.value)} /></div></label>
                <button type="button" onClick={() => updateForm("monto", rentalTotal.toFixed(2))} disabled={rentalTotal <= 0}>Usar total {money(rentalTotal)}</button>
              </div>
            ) : null}
          </section>

          <details className="costs-form__advanced">
            <summary>Agregar detalles opcionales</summary>
            <p>Úsalos solo si necesitas relacionar este costo con un área, producto o varias unidades.</p>
            <div className="costs-form__grid">
              <label>
                <span className="form-label">Tipo de costo</span>
                <select className="form-select" value={form.tipo_costo} onChange={(event) => updateForm("tipo_costo", event.target.value)}>
                  {types.filter(([value]) => value !== "compra").map(([value, label]) => <option key={value} value={value}>{label}</option>)}
                </select>
              </label>
              <label>
                <span className="form-label">¿Cada cuánto ocurre?</span>
                <select className="form-select" value={form.frecuencia} onChange={(event) => updateForm("frecuencia", event.target.value)}>
                  {frequencies.map(([value, label]) => <option key={value} value={value}>{label}</option>)}
                </select>
              </label>
              <label>
                <span className="form-label">Área o módulo</span>
                <select className="form-select" value={form.modulo_id} onChange={(event) => updateForm("modulo_id", event.target.value)}>
                  <option value="">Gasto general</option>
                  {modulos.map((modulo) => <option key={modulo.id} value={modulo.id}>{modulo.nombre}</option>)}
                </select>
              </label>
              <label>
                <span className="form-label">Producto relacionado</span>
                <select className="form-select" value={form.producto_id} onChange={(event) => updateForm("producto_id", event.target.value)}>
                  <option value="">Ninguno</option>
                  {productOptions.map((producto) => <option key={producto.id} value={producto.id}>{producto.label}</option>)}
                </select>
              </label>
              <label>
                <span className="form-label">Repartir entre unidades</span>
                <input type="number" min="1" className="form-control" value={form.cantidad_distribucion} onChange={(event) => updateForm("cantidad_distribucion", event.target.value)} placeholder="Ej. 20" />
                {unitCostPreview !== null ? <small>Costo aproximado por unidad: {money(unitCostPreview)}</small> : null}
              </label>
              <label className="costs-form__notes">
                <span className="form-label">Nota adicional</span>
                <textarea className="form-control" rows={2} value={form.observacion} onChange={(event) => updateForm("observacion", event.target.value)} placeholder="Proveedor, referencia u otra aclaración" />
              </label>
            </div>
          </details>

          <button type="button" className="btn btn-primary costs-form__submit" disabled={saving} onClick={openReview}>
            <Plus size={18} weight="bold" aria-hidden="true" />
            <span>{`Registrar costo${amountPreview > 0 ? ` de ${money(amountPreview)}` : ""}`}</span>
          </button>
        </form>

      </div>
        </div>
      </div>
      ) : null}

      {purchaseModalOpen ? (
        <div className="costs-entry-modal" role="dialog" aria-modal="true" aria-labelledby="purchase-form-title" onClick={() => !purchaseSaving && setPurchaseModalOpen(false)}>
          <div className="costs-entry-modal__panel costs-entry-modal__panel--purchase" onClick={(event) => event.stopPropagation()}>
            <button type="button" className="costs-entry-modal__close" aria-label="Cerrar formulario" onClick={() => setPurchaseModalOpen(false)} disabled={purchaseSaving}><X size={20} weight="bold" /></button>
            <form className="surface-card purchase-form" onSubmit={(event) => { event.preventDefault(); confirmPurchase(); }}>
              <div className="costs-form__heading">
                <span className="costs-form__step"><Package size={20} weight="bold" /></span>
                <div>
                  <p className="section-kicker">Compra de productos</p>
                  <h3 id="purchase-form-title">¿Cuánto utilizaste para comprar?</h3>
                  <p className="muted-text">Registra el monto general sin detallar cada producto comprado.</p>
                </div>
              </div>

              <div className="purchase-form__grid">
                <label>
                  <span className="form-label">¿Qué tipo de compra fue?</span>
                  <select className="form-select" value={purchaseForm.tipo_compra} onChange={(event) => updatePurchaseForm("tipo_compra", event.target.value)} required autoFocus>
                    {purchaseTypes.map(([value, label]) => <option key={value} value={value}>{label}</option>)}
                  </select>
                </label>
                <label>
                  <span className="form-label">Monto utilizado</span>
                  <div className="costs-money-input"><span>$</span><input type="number" min="0.01" step="0.01" className="form-control" value={purchaseForm.monto} onChange={(event) => updatePurchaseForm("monto", event.target.value)} placeholder="0.00" required /></div>
                </label>
                <label>
                  <span className="form-label">Fecha de compra</span>
                  <input type="date" className="form-control" value={purchaseForm.fecha_compra} onChange={(event) => updatePurchaseForm("fecha_compra", event.target.value)} required />
                </label>
                <label>
                  <span className="form-label">Proveedor</span>
                  <input className="form-control" value={purchaseForm.proveedor_comprobante} onChange={(event) => updatePurchaseForm("proveedor_comprobante", event.target.value)} placeholder="Opcional" />
                </label>
                <label>
                  <span className="form-label">Nota o referencia</span>
                  <input className="form-control" value={purchaseForm.observacion} onChange={(event) => updatePurchaseForm("observacion", event.target.value)} placeholder="Ej. Factura 00125" />
                </label>
              </div>

              <label className="costs-form__check">
                <input type="checkbox" checked={purchaseForm.registrar_en_caja} onChange={(event) => updatePurchaseForm("registrar_en_caja", event.target.checked)} />
                <span><strong>Descontar el total de Caja</strong><small>Creará una salida de compra de productos por {money(purchaseTotal)}.</small></span>
              </label>

              <section className="costs-receipt-upload">
                <div className="costs-receipt-upload__heading">
                  <span><Receipt size={20} weight="bold" /></span>
                  <div><strong>Factura o comprobante</strong><small>Adjunta hasta 5 archivos PDF o fotografías.</small></div>
                </div>
                <div className="costs-receipt-upload__grid purchase-form__receipt-grid">
                  <label className="costs-receipt-upload__file">
                    <span className="form-label">Archivos</span>
                    <input key={purchaseFileInputKey} type="file" accept="application/pdf,image/jpeg,image/png,image/webp" multiple onChange={(event) => updatePurchaseForm("comprobantes", Array.from(event.target.files ?? []).slice(0, 5))} />
                    <small>{purchaseForm.comprobantes.length ? `${purchaseForm.comprobantes.length} archivo(s) seleccionado(s)` : "Ningún archivo seleccionado."}</small>
                  </label>
                  <label>
                    <span className="form-label">Tipo</span>
                    <select className="form-select" value={purchaseForm.tipo_comprobante} onChange={(event) => updatePurchaseForm("tipo_comprobante", event.target.value)}>
                      <option value="factura">Factura</option><option value="ticket">Ticket</option><option value="recibo">Recibo</option><option value="otro">Otro</option>
                    </select>
                  </label>
                </div>
              </section>

              <div className="purchase-form__summary">
                <div><span>Tipo de compra</span><strong>{labelFrom(purchaseTypes, purchaseForm.tipo_compra)}</strong></div>
                <div><span>Registro</span><strong>Salida general de productos</strong></div>
                <div className="purchase-form__summary-total"><span>Total de la compra</span><strong>{money(purchaseTotal)}</strong></div>
              </div>

              <footer className="purchase-form__actions">
                <button type="button" className="btn btn-light" onClick={() => setPurchaseModalOpen(false)} disabled={purchaseSaving}>Cancelar</button>
                <button type="submit" className="btn btn-primary" disabled={purchaseSaving || purchaseTotal <= 0}>{purchaseSaving ? "Registrando..." : "Confirmar compra"}</button>
              </footer>
            </form>
          </div>
        </div>
      ) : null}

      <section className="surface-card costs-table-shell">
        <div className="costs-table-shell__heading">
          <div><h3>Gastos y compras registrados</h3><p className="muted-text">Consulta qué se pagó, cuándo y cómo afectó al negocio.</p></div>
          <span>{meta?.total ?? costos.length} registros</span>
        </div>
        <form className="costs-filters" onSubmit={applyFilters}>
          <label>
            <span className="form-label">Mes</span>
            <input type="month" className="form-control" value={selectedMonth} onChange={(event) => selectMonth(event.target.value)} />
          </label>
          <label>
            <span className="form-label">Desde</span>
            <input type="date" className="form-control" value={draftFilters.fecha_desde} onChange={(event) => updateDraft("fecha_desde", event.target.value)} />
          </label>
          <label>
            <span className="form-label">Hasta</span>
            <input type="date" className="form-control" value={draftFilters.fecha_hasta} onChange={(event) => updateDraft("fecha_hasta", event.target.value)} />
          </label>
          <label>
            <span className="form-label">Categoría</span>
            <select className="form-select" value={draftFilters.categoria} onChange={(event) => updateDraft("categoria", event.target.value)}>
              <option value="">Todas</option>
              {categories.map(([value, label]) => <option key={value} value={value}>{label}</option>)}
            </select>
          </label>
          <label>
            <span className="form-label">Tipo</span>
            <select className="form-select" value={draftFilters.tipo_costo} onChange={(event) => updateDraft("tipo_costo", event.target.value)}>
              <option value="">Todos</option>
              {types.map(([value, label]) => <option key={value} value={value}>{label}</option>)}
            </select>
          </label>
          <div className="costs-filters__actions">
            <button type="submit" className="btn products-filter-actions__apply">Aplicar</button>
            <button type="button" className="btn products-filter-actions__clear" onClick={clearFilters}>Limpiar</button>
          </div>
        </form>
        <div className="table-responsive">
          <table className="table align-middle costs-table">
            <thead>
              <tr>
                <th>Fecha</th>
                <th>Concepto</th>
                <th>Categoria</th>
                <th>Tipo</th>
                <th>Producto</th>
                <th>Comprobante</th>
                <th className="text-end">Monto</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr><td colSpan={7} className="text-center muted-text">Cargando registros...</td></tr>
              ) : costos.length ? costos.map((costo) => (
                <tr key={costo.id}>
                  <td>{costo.fecha_costo}</td>
                  <td>
                    <div className="product-name">{costo.concepto}</div>
                    <div className="product-code">{costo.observacion || "Sin observacion"}</div>
                  </td>
                  <td>{labelFrom(categories, costo.categoria)}</td>
                  <td>{labelFrom(types, costo.tipo_costo)}</td>
                  <td>{costo.producto?.nombre ?? "General"}</td>
                  <td>{costo.comprobantes?.length ? <a className="costs-receipt-link" href={costo.comprobantes[0].archivo_url} target="_blank" rel="noreferrer">Ver archivo</a> : <span className="muted-text">Sin archivo</span>}</td>
                  <td className="text-end product-name">{money(costo.monto)}</td>
                </tr>
              )) : (
                <tr><td colSpan={7} className="text-center muted-text">No hay gastos ni compras registradas.</td></tr>
              )}
            </tbody>
          </table>
        </div>
      </section>

      <ProductosPagination meta={meta} onPageChange={changePage} />

      {reviewOpen ? (
        <div className="costs-confirm-modal" role="dialog" aria-modal="true" aria-labelledby="cost-confirm-title" onClick={() => !saving && setReviewOpen(false)}>
          <div className="costs-confirm-modal__card" onClick={(event) => event.stopPropagation()}>
            <header className="costs-confirm-modal__header">
              <span className="costs-confirm-modal__icon"><Receipt size={24} weight="bold" /></span>
              <div>
                <p className="section-kicker">Confirmar costo</p>
                <h3 id="cost-confirm-title">Revisa antes de registrar</h3>
                <p className="muted-text">Asegúrate de que los datos sean correctos.</p>
              </div>
            </header>

            <div className="costs-confirm-modal__amount">
              <span>{form.concepto}</span>
              <strong>{money(amountPreview)}</strong>
            </div>

            <dl className="costs-confirm-modal__details">
              <div><dt>Categoría</dt><dd>{labelFrom(categories, form.categoria)}</dd></div>
              <div><dt>Fecha</dt><dd>{form.fecha_costo}</dd></div>
              <div><dt>Tipo</dt><dd>{labelFrom(types, form.tipo_costo)}</dd></div>
              <div><dt>Frecuencia</dt><dd>{labelFrom(frequencies, form.frecuencia)}</dd></div>
              <div className="costs-confirm-modal__wide"><dt>Impacto en Caja</dt><dd>{form.registrar_en_caja ? `Se registrará una salida de ${money(amountPreview)}` : "No afectará Caja"}</dd></div>
              <div className="costs-confirm-modal__wide"><dt>Comprobante</dt><dd>{form.comprobantes.length ? `${form.comprobantes.length} archivo(s) adjunto(s)` : "Sin archivo adjunto"}</dd></div>
              {form.observacion ? <div className="costs-confirm-modal__wide"><dt>Nota</dt><dd>{form.observacion}</dd></div> : null}
            </dl>

            <div className="costs-confirm-modal__tip">
              <Info size={18} />
              <span>El costo se incluirá en la utilidad y los reportes del periodo.</span>
            </div>

            <footer className="costs-confirm-modal__actions">
              <button type="button" className="btn btn-light" onClick={() => setReviewOpen(false)} disabled={saving}>Volver y corregir</button>
              <button type="button" className="btn btn-primary" onClick={confirmCosto} disabled={saving}>
                {saving ? "Registrando..." : "Confirmar y registrar"}
              </button>
            </footer>
          </div>
        </div>
      ) : null}
    </section>
  );
}

export default CostosPage;
