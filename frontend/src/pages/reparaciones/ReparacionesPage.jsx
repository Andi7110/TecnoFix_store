import { Link } from "react-router-dom";
import { Plus } from "../../icons/phosphor";
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
    <section className="products-page repairs-page container-fluid px-0">
      <div className="products-page__panel repairs-page__panel">
        <div className="products-page__header">
          <div className="row g-3 align-items-stretch w-100">
            <div className="col-12 col-xl-7">
              <div className="products-page__header-copy h-100">
                <div className="d-flex align-items-center gap-2 flex-wrap mb-2">
                  <span className="badge products-page__badge">Taller</span>
                  <span className="badge products-page__badge products-page__badge--soft">
                    Reparaciones activas
                  </span>
                </div>
                <h2>Gestion de reparaciones</h2>
                <p className="muted-text">
                  Registra ingresos, seguimiento tecnico y entrega de equipos.
                </p>
              </div>
            </div>

            <div className="col-12 col-xl-5">
              <div className="products-page__header-actions h-100 d-flex flex-column flex-sm-row gap-2 justify-content-xl-end align-items-stretch align-items-sm-center">
                <Link to="/reparaciones/nueva" className="btn products-page__create-btn repairs-page__create-btn">
                  <span className="products-page__create-btn-content">
                    <Plus size={18} weight="bold" aria-hidden="true" />
                    <span>Nueva reparacion</span>
                  </span>
                </Link>
              </div>
            </div>
          </div>
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
