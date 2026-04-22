import { Link } from "react-router-dom";
import { ChartLine, Plus } from "../../icons/phosphor";
import ProductosPagination from "../../components/productos/ProductosPagination";
import VentaDetailModal from "../../components/ventas/VentaDetailModal";
import VentasFilters from "../../components/ventas/VentasFilters";
import VentasTable from "../../components/ventas/VentasTable";
import { useProductoCatalogos } from "../../hooks/productos/useProductoCatalogos";
import { useVentaDetail } from "../../hooks/ventas/useVentaDetail";
import { useVentasFilters } from "../../hooks/ventas/useVentasFilters";
import { useVentasList } from "../../hooks/ventas/useVentasList";

function VentasPage() {
  const {
    filters,
    draftFilters,
    updateDraftFilter,
    applyFilters,
    clearFilters,
    changePage,
    changePerPage,
  } = useVentasFilters();
  const { modulos } = useProductoCatalogos("", true);
  const { ventas, meta, loading, error } = useVentasList(filters);
  const ventaDetail = useVentaDetail();

  return (
    <section className="products-page ventas-page container-fluid px-0">
      <div className="products-page__panel ventas-page__panel">
        <div className="products-page__header">
          <div className="row g-3 align-items-stretch w-100">
            <div className="col-12 col-xl-7">
              <div className="products-page__header-copy h-100">
                <div className="d-flex align-items-center gap-2 flex-wrap mb-2">
                  <span className="badge products-page__badge">Ventas</span>
                  <span className="badge products-page__badge products-page__badge--soft">
                    Historial activo
                  </span>
                </div>
                <h2>Historial de ventas</h2>
                <p className="muted-text">
                  Registra articulos vendidos y consulta el detalle de cada operacion.
                </p>
              </div>
            </div>

            <div className="col-12 col-xl-5">
              <div className="products-page__header-actions h-100 d-flex flex-column flex-sm-row gap-2 justify-content-xl-end align-items-stretch align-items-sm-center">
                <Link to="/ventas/reportes" className="btn products-page__inventory-btn venta-page__reports-button">
                  <ChartLine size={18} weight="bold" aria-hidden="true" />
                  <span>Reportes</span>
                </Link>
                <Link to="/ventas/nueva" className="btn products-page__create-btn venta-page__new-button">
                  <span className="products-page__create-btn-content">
                    <Plus size={18} weight="bold" aria-hidden="true" />
                    <span>Nueva venta</span>
                  </span>
                </Link>
              </div>
            </div>
          </div>
        </div>
      </div>

      <VentasFilters
        values={draftFilters}
        modulos={modulos}
        onChange={updateDraftFilter}
        onSubmit={applyFilters}
        onClear={clearFilters}
      />

      {error ? <div className="alert alert-danger">{error}</div> : null}

      <VentasTable
        ventas={ventas}
        loading={loading}
        onViewDetail={ventaDetail.openVenta}
      />

      <ProductosPagination
        meta={meta}
        onPageChange={changePage}
        showWhenSinglePage
        perPage={filters.per_page}
        onPerPageChange={changePerPage}
      />

      <VentaDetailModal
        venta={ventaDetail.venta}
        loading={ventaDetail.loading}
        error={ventaDetail.error}
        onClose={ventaDetail.closeVenta}
      />
    </section>
  );
}

export default VentasPage;
