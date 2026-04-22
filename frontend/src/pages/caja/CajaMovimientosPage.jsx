import { Link } from "react-router-dom";
import { Plus } from "../../icons/phosphor";
import CajaFilters from "../../components/caja/CajaFilters";
import CajaSummaryCards from "../../components/caja/CajaSummaryCards";
import CajaTable from "../../components/caja/CajaTable";
import ProductosPagination from "../../components/productos/ProductosPagination";
import { useProductoCatalogos } from "../../hooks/productos/useProductoCatalogos";
import { useCajaFilters } from "../../hooks/caja/useCajaFilters";
import { useCajaList } from "../../hooks/caja/useCajaList";

function CajaMovimientosPage() {
  const {
    filters,
    draftFilters,
    updateDraftFilter,
    applyFilters,
    clearFilters,
    changePage,
  } = useCajaFilters();
  const { modulos } = useProductoCatalogos();
  const { movimientos, meta, summary, loading, error } = useCajaList(filters);

  return (
    <section className="products-page cash-page container-fluid px-0">
      <div className="products-page__panel cash-page__panel">
        <div className="products-page__header">
          <div className="row g-3 align-items-stretch w-100">
            <div className="col-12 col-xl-7">
              <div className="products-page__header-copy h-100">
                <div className="d-flex align-items-center gap-2 flex-wrap mb-2">
                  <span className="badge products-page__badge">Caja</span>
                  <span className="badge products-page__badge products-page__badge--soft">
                    Balance operativo
                  </span>
                </div>
                <h2>Movimientos de dinero</h2>
                <p className="muted-text">
                  Controla entradas, salidas, categorias y balance operativo.
                </p>
              </div>
            </div>

            <div className="col-12 col-xl-5">
              <div className="products-page__header-actions h-100 d-flex flex-column flex-sm-row gap-2 justify-content-xl-end align-items-stretch align-items-sm-center">
                <Link to="/caja/nuevo" className="btn products-page__create-btn cash-page__create-btn">
                  <span className="products-page__create-btn-content">
                    <Plus size={18} weight="bold" aria-hidden="true" />
                    <span>Nuevo movimiento</span>
                  </span>
                </Link>
              </div>
            </div>
          </div>
        </div>
      </div>

      <CajaSummaryCards summary={summary} />

      <CajaFilters
        values={draftFilters}
        modulos={modulos}
        onChange={updateDraftFilter}
        onSubmit={applyFilters}
        onClear={clearFilters}
      />

      {error ? <div className="alert alert-danger">{error}</div> : null}

      <CajaTable movimientos={movimientos} loading={loading} />

      <ProductosPagination meta={meta} onPageChange={changePage} />
    </section>
  );
}

export default CajaMovimientosPage;
