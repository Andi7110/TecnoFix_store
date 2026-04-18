import { Link } from "react-router-dom";
import ProductosPagination from "../../components/productos/ProductosPagination";
import ReparacionesFilters from "../../components/reparaciones/ReparacionesFilters";
import ReparacionesTable from "../../components/reparaciones/ReparacionesTable";
import { useReparacionesFilters } from "../../hooks/reparaciones/useReparacionesFilters";
import { useReparacionesList } from "../../hooks/reparaciones/useReparacionesList";

function ReparacionesPage() {
  const {
    filters,
    draftFilters,
    updateDraftFilter,
    applyFilters,
    clearFilters,
    changePage,
  } = useReparacionesFilters();
  const { reparaciones, meta, loading, error } = useReparacionesList(filters);

  return (
    <section>
      <div className="products-page__header">
        <div>
          <p className="section-kicker">Taller</p>
          <h2>Gestion de reparaciones</h2>
          <p className="muted-text">
            Registra ingresos, seguimiento tecnico y entrega de equipos.
          </p>
        </div>

        <div className="products-page__header-actions">
          <Link to="/reparaciones/nueva" className="btn products-page__create-btn">
            Nueva reparacion
          </Link>
        </div>
      </div>

      <ReparacionesFilters
        values={draftFilters}
        onChange={updateDraftFilter}
        onSubmit={applyFilters}
        onClear={clearFilters}
      />

      {error ? <div className="alert alert-danger">{error}</div> : null}

      <ReparacionesTable reparaciones={reparaciones} loading={loading} />

      <ProductosPagination meta={meta} onPageChange={changePage} />
    </section>
  );
}

export default ReparacionesPage;
