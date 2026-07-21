import { Link } from "react-router-dom";
import { ChartBar, Package, Receipt } from "../../icons/phosphor";
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
    <section className="products-page products-page--minimal cash-page">
      <div className="products-page__header products-page__header--minimal">
        <div>
          <p className="section-kicker">Caja</p>
          <h2>Movimientos de dinero</h2>
          <p className="muted-text">
            Consulta el dinero que entra o sale y revisa el balance de tu negocio.
          </p>
        </div>

        <div className="products-page__header-actions cash-page__header-actions">
          <Link to="/caja/comprobantes" className="btn products-page__inventory-btn">
            <Receipt size={18} weight="bold" aria-hidden="true" />
            Comprobantes
          </Link>
          <Link to="/caja/reportes" className="btn products-page__inventory-btn">
            <ChartBar size={18} weight="bold" aria-hidden="true" />
            Reportes mensuales
          </Link>
          <Link to="/costos" className="btn products-page__create-btn cash-page__create-btn">
            <span className="products-page__create-btn-content">
              <Package size={18} weight="bold" aria-hidden="true" />
              <span>Gastos y compras</span>
            </span>
          </Link>
        </div>
      </div>

      <CajaSummaryCards summary={summary} />

      <section className="surface-card cash-history">
        <div className="cash-history__heading">
          <div>
            <p className="section-kicker">Historial de caja</p>
            <h3>Entradas y salidas</h3>
            <p className="muted-text">Consulta cuándo se movió el dinero y por qué.</p>
          </div>
          <span>{meta?.total ?? movimientos.length} movimientos</span>
        </div>

        <CajaFilters
          values={draftFilters}
          modulos={modulos}
          onChange={updateDraftFilter}
          onSubmit={applyFilters}
          onClear={clearFilters}
        />

        {error ? <div className="alert alert-danger">{error}</div> : null}

        <CajaTable movimientos={movimientos} loading={loading} />
      </section>

      <ProductosPagination meta={meta} onPageChange={changePage} />

    </section>
  );
}

export default CajaMovimientosPage;
