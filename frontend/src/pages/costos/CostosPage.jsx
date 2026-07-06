import { useEffect, useMemo, useState } from "react";
import { Calculator, Plus, TrendDown, TrendUp } from "../../icons/phosphor";
import { createCosto, listCostos } from "../../api/costos";
import { listModulos } from "../../api/inventarioCatalogos";
import { listProductos } from "../../api/productos";
import ProductosPagination from "../../components/productos/ProductosPagination";
import { notifyError, notifySuccess } from "../../utils/toasts";

const today = new Date().toISOString().slice(0, 10);

const initialFilters = {
  fecha_desde: today,
  fecha_hasta: today,
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
};

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
  const [form, setForm] = useState(initialForm);
  const [costos, setCostos] = useState([]);
  const [summary, setSummary] = useState(null);
  const [meta, setMeta] = useState(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
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
    }));
  }

  function updateDraft(name, value) {
    setDraftFilters((current) => ({
      ...current,
      [name]: value,
    }));
  }

  async function handleSubmit(event) {
    event.preventDefault();
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

  function applyFilters(event) {
    event.preventDefault();
    setFilters({
      ...draftFilters,
      page: 1,
    });
  }

  function clearFilters() {
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

  return (
    <section className="products-page products-page--minimal costs-page">
      <div className="products-page__header products-page__header--minimal">
        <div>
          <p className="section-kicker">Costos</p>
          <h2>Costos y rentabilidad</h2>
          <p className="muted-text">
            Registra gastos operativos y mide la utilidad real de la tienda.
          </p>
        </div>
      </div>

      <div className="costs-summary-grid">
        <article className="surface-card costs-summary-card">
          <span className="costs-summary-card__icon"><TrendUp size={19} weight="bold" /></span>
          <p className="section-kicker">Ventas netas</p>
          <h3>{money(summary?.ventas_netas)}</h3>
        </article>
        <article className="surface-card costs-summary-card">
          <span className="costs-summary-card__icon"><Calculator size={19} weight="bold" /></span>
          <p className="section-kicker">Utilidad bruta</p>
          <h3>{money(summary?.utilidad_bruta)}</h3>
        </article>
        <article className="surface-card costs-summary-card">
          <span className="costs-summary-card__icon"><TrendDown size={19} weight="bold" /></span>
          <p className="section-kicker">Costos operativos</p>
          <h3>{money(summary?.costos_operativos)}</h3>
        </article>
        <article className={`surface-card costs-summary-card costs-summary-card--${netTone}`}>
          <span className="costs-summary-card__icon"><Calculator size={19} weight="bold" /></span>
          <p className="section-kicker">Utilidad neta</p>
          <h3>{money(summary?.utilidad_neta)}</h3>
          <span className="muted-text">Margen {Number(summary?.margen_neto_porcentaje ?? 0).toFixed(2)}%</span>
        </article>
      </div>

      <div className="costs-layout">
        <form className="surface-card costs-form" onSubmit={handleSubmit}>
          <div>
            <p className="section-kicker">Nuevo costo</p>
            <h3>Registrar gasto</h3>
          </div>

          <label>
            <span className="form-label">Concepto</span>
            <input className="form-control" value={form.concepto} onChange={(event) => updateForm("concepto", event.target.value)} required />
          </label>

          <div className="costs-form__grid">
            <label>
              <span className="form-label">Categoria</span>
              <select className="form-select" value={form.categoria} onChange={(event) => updateForm("categoria", event.target.value)}>
                {categories.map(([value, label]) => <option key={value} value={value}>{label}</option>)}
              </select>
            </label>
            <label>
              <span className="form-label">Tipo</span>
              <select className="form-select" value={form.tipo_costo} onChange={(event) => updateForm("tipo_costo", event.target.value)}>
                {types.map(([value, label]) => <option key={value} value={value}>{label}</option>)}
              </select>
            </label>
            <label>
              <span className="form-label">Frecuencia</span>
              <select className="form-select" value={form.frecuencia} onChange={(event) => updateForm("frecuencia", event.target.value)}>
                {frequencies.map(([value, label]) => <option key={value} value={value}>{label}</option>)}
              </select>
            </label>
            <label>
              <span className="form-label">Monto</span>
              <input type="number" min="0.01" step="0.01" className="form-control" value={form.monto} onChange={(event) => updateForm("monto", event.target.value)} required />
            </label>
            <label>
              <span className="form-label">Fecha</span>
              <input type="date" className="form-control" value={form.fecha_costo} onChange={(event) => updateForm("fecha_costo", event.target.value)} required />
            </label>
            <label>
              <span className="form-label">Modulo</span>
              <select className="form-select" value={form.modulo_id} onChange={(event) => updateForm("modulo_id", event.target.value)}>
                <option value="">General</option>
                {modulos.map((modulo) => <option key={modulo.id} value={modulo.id}>{modulo.nombre}</option>)}
              </select>
            </label>
            <label>
              <span className="form-label">Producto opcional</span>
              <select className="form-select" value={form.producto_id} onChange={(event) => updateForm("producto_id", event.target.value)}>
                <option value="">Sin producto</option>
                {productOptions.map((producto) => <option key={producto.id} value={producto.id}>{producto.label}</option>)}
              </select>
            </label>
            <label>
              <span className="form-label">Repartir entre unidades</span>
              <input type="number" min="1" className="form-control" value={form.cantidad_distribucion} onChange={(event) => updateForm("cantidad_distribucion", event.target.value)} placeholder="Ej. 20" />
            </label>
          </div>

          <label>
            <span className="form-label">Observacion</span>
            <textarea className="form-control" rows={3} value={form.observacion} onChange={(event) => updateForm("observacion", event.target.value)} />
          </label>

          <label className="costs-form__check">
            <input type="checkbox" checked={form.registrar_en_caja} onChange={(event) => updateForm("registrar_en_caja", event.target.checked)} />
            <span>Registrar automaticamente como salida en Caja</span>
          </label>

          <button type="submit" className="btn products-page__create-btn" disabled={saving}>
            <Plus size={18} weight="bold" aria-hidden="true" />
            <span>{saving ? "Guardando..." : "Agregar costo"}</span>
          </button>
        </form>

        <div className="surface-card costs-breakdown">
          <div>
            <p className="section-kicker">Gastos por categoria</p>
            <h3>En que se esta gastando</h3>
          </div>
          {summary?.por_categoria?.length ? (
            <div className="costs-breakdown__list">
              {summary.por_categoria.map((item) => (
                <div key={item.categoria} className="costs-breakdown__item">
                  <span>{labelFrom(categories, item.categoria)}</span>
                  <strong>{money(item.total)}</strong>
                </div>
              ))}
            </div>
          ) : (
            <p className="muted-text mb-0">No hay costos en este periodo.</p>
          )}
        </div>
      </div>

      <form className="surface-card costs-filters" onSubmit={applyFilters}>
        <label>
          <span className="form-label">Desde</span>
          <input type="date" className="form-control" value={draftFilters.fecha_desde} onChange={(event) => updateDraft("fecha_desde", event.target.value)} />
        </label>
        <label>
          <span className="form-label">Hasta</span>
          <input type="date" className="form-control" value={draftFilters.fecha_hasta} onChange={(event) => updateDraft("fecha_hasta", event.target.value)} />
        </label>
        <label>
          <span className="form-label">Categoria</span>
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

      <section className="surface-card costs-table-shell">
        <div className="table-responsive">
          <table className="table align-middle costs-table">
            <thead>
              <tr>
                <th>Fecha</th>
                <th>Concepto</th>
                <th>Categoria</th>
                <th>Tipo</th>
                <th>Producto</th>
                <th className="text-end">Monto</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr><td colSpan={6} className="text-center muted-text">Cargando costos...</td></tr>
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
                  <td className="text-end product-name">{money(costo.monto)}</td>
                </tr>
              )) : (
                <tr><td colSpan={6} className="text-center muted-text">No hay costos registrados.</td></tr>
              )}
            </tbody>
          </table>
        </div>
      </section>

      <ProductosPagination meta={meta} onPageChange={changePage} />
    </section>
  );
}

export default CostosPage;
