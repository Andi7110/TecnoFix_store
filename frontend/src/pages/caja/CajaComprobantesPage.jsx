import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { ArrowLeft, FilePdf, Image, Receipt } from "../../icons/phosphor";
import { listComprobantesCaja } from "../../api/caja";
import ProductosPagination from "../../components/productos/ProductosPagination";
import { notifyError } from "../../utils/toasts";

const today = new Date().toISOString().slice(0, 10);
const currentMonth = today.slice(0, 7);

function monthRange(value) {
  const [year, month] = value.split("-").map(Number);
  const lastDay = new Date(year, month, 0).getDate();
  return { fecha_desde: `${value}-01`, fecha_hasta: `${value}-${String(lastDay).padStart(2, "0")}` };
}

const initialFilters = {
  ...monthRange(currentMonth),
  tipo_documento: "",
  origen: "",
  buscar: "",
  page: 1,
  per_page: 12,
};

function money(value) {
  return new Intl.NumberFormat("es-SV", { style: "currency", currency: "USD" }).format(Number(value ?? 0));
}

function fileSize(bytes) {
  const value = Number(bytes ?? 0);
  return value >= 1048576 ? `${(value / 1048576).toFixed(1)} MB` : `${Math.max(1, Math.round(value / 1024))} KB`;
}

function CajaComprobantesPage() {
  const [filters, setFilters] = useState(initialFilters);
  const [draft, setDraft] = useState(initialFilters);
  const [selectedMonth, setSelectedMonth] = useState(currentMonth);
  const [items, setItems] = useState([]);
  const [meta, setMeta] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let ignore = false;

    async function load() {
      setLoading(true);
      try {
        const response = await listComprobantesCaja(filters);
        if (!ignore) {
          setItems(response.data ?? []);
          setMeta(response.meta ?? null);
        }
      } catch (error) {
        if (!ignore) notifyError(error?.response?.data?.message ?? "No se pudieron cargar los comprobantes.");
      } finally {
        if (!ignore) setLoading(false);
      }
    }

    load();
    return () => { ignore = true; };
  }, [filters]);

  function updateDraft(name, value) {
    setDraft((current) => ({ ...current, [name]: value }));
  }

  function selectMonth(value) {
    setSelectedMonth(value);
    if (value) setDraft((current) => ({ ...current, ...monthRange(value) }));
  }

  function applyFilters(event) {
    event.preventDefault();
    setFilters({ ...draft, page: 1 });
  }

  function clearFilters() {
    setSelectedMonth(currentMonth);
    setDraft(initialFilters);
    setFilters(initialFilters);
  }

  return (
    <section className="products-page products-page--minimal cash-receipts-page">
      <div className="products-page__header products-page__header--minimal">
        <div>
          <p className="section-kicker">Caja</p>
          <h2>Archivo de comprobantes</h2>
          <p className="muted-text">Facturas, tickets y recibos relacionados con costos y salidas.</p>
        </div>
        <Link to="/caja" className="cash-receipts-back"><ArrowLeft size={18} weight="bold" /> Movimientos de Caja</Link>
      </div>

      <section className="surface-card cash-receipts-shell">
        <div className="cash-receipts-shell__heading">
          <div><p className="section-kicker">Documentos guardados</p><h3>Comprobantes</h3><p className="muted-text">Filtra por mes, origen o tipo de documento.</p></div>
          <span>{meta?.total ?? items.length} archivos</span>
        </div>

        <form className="cash-receipts-filters" onSubmit={applyFilters}>
          <label><span className="form-label">Mes</span><input type="month" className="form-control" value={selectedMonth} onChange={(event) => selectMonth(event.target.value)} /></label>
          <label><span className="form-label">Buscar</span><input className="form-control" value={draft.buscar} onChange={(event) => updateDraft("buscar", event.target.value)} placeholder="Proveedor o concepto" /></label>
          <label><span className="form-label">Tipo</span><select className="form-select" value={draft.tipo_documento} onChange={(event) => updateDraft("tipo_documento", event.target.value)}><option value="">Todos</option><option value="factura">Facturas</option><option value="ticket">Tickets</option><option value="recibo">Recibos</option><option value="otro">Otros</option></select></label>
          <label><span className="form-label">Origen</span><select className="form-select" value={draft.origen} onChange={(event) => updateDraft("origen", event.target.value)}><option value="">Todos</option><option value="costos">Costos</option><option value="caja">Caja</option></select></label>
          <div><button type="submit" className="btn products-filter-actions__apply">Aplicar</button><button type="button" className="btn products-filter-actions__clear" onClick={clearFilters}>Limpiar</button></div>
        </form>

        {loading ? <div className="cash-receipts-empty">Cargando comprobantes...</div> : items.length ? (
          <div className="cash-receipts-grid">
            {items.map((item) => {
              const source = item.costo ?? item.movimiento;
              const isPdf = item.mime_type === "application/pdf";
              return (
                <article className="cash-receipt-card" key={item.id}>
                  <a className="cash-receipt-card__preview" href={item.archivo_url} target="_blank" rel="noreferrer">
                    {isPdf ? <FilePdf size={38} weight="duotone" /> : <Image size={38} weight="duotone" />}
                    <span>{isPdf ? "Abrir PDF" : "Ver fotografía"}</span>
                  </a>
                  <div className="cash-receipt-card__body">
                    <div className="cash-receipt-card__top"><span>{item.tipo_documento}</span><small>{item.origen === "costos" ? "Costo" : "Caja"}</small></div>
                    <h4>{source?.concepto ?? item.nombre_original}</h4>
                    <strong>{money(source?.monto)}</strong>
                    <dl>
                      <div><dt>Fecha</dt><dd>{item.fecha_documento ?? "-"}</dd></div>
                      <div><dt>Proveedor</dt><dd>{item.proveedor || "No indicado"}</dd></div>
                      {item.dias_cobrados ? <div><dt>Alquiler</dt><dd>{item.dias_cobrados} días × {money(item.tarifa_diaria)}</dd></div> : null}
                    </dl>
                    <div className="cash-receipt-card__file"><Receipt size={16} /><span title={item.nombre_original}>{item.nombre_original}</span><small>{fileSize(item.tamano)}</small></div>
                  </div>
                </article>
              );
            })}
          </div>
        ) : <div className="cash-receipts-empty">No hay comprobantes guardados para este periodo.</div>}
      </section>

      <ProductosPagination meta={meta} onPageChange={(page) => setFilters((current) => ({ ...current, page }))} />
    </section>
  );
}

export default CajaComprobantesPage;
