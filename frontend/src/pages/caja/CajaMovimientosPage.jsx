import { Link } from "react-router-dom";
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
    <section>
      <div className="products-page__header">
        <div>
          <p className="section-kicker">Caja</p>
          <h2>Movimientos de dinero</h2>
          <p className="muted-text">
            Controla entradas, salidas, categorias y balance operativo.
          </p>
        </div>

        <div className="products-page__header-actions">
          <Link to="/caja/nuevo" className="btn btn-primary">
            Nuevo movimiento
          </Link>
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
