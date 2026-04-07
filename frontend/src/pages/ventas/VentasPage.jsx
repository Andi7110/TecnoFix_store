import { useState } from "react";
import { Link } from "react-router-dom";
import ProductosPagination from "../../components/productos/ProductosPagination";
import CrearVentaModal from "../../components/ventas/CrearVentaModal";
import VentaDetailModal from "../../components/ventas/VentaDetailModal";
import VentasFilters from "../../components/ventas/VentasFilters";
import VentasTable from "../../components/ventas/VentasTable";
import { useProductoCatalogos } from "../../hooks/productos/useProductoCatalogos";
import { useVentaDetail } from "../../hooks/ventas/useVentaDetail";
import { useVentasFilters } from "../../hooks/ventas/useVentasFilters";
import { useVentasList } from "../../hooks/ventas/useVentasList";

function VentasPage() {
  const [isCreateSaleOpen, setIsCreateSaleOpen] = useState(false);
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
  const { ventas, meta, loading, error, reload } = useVentasList(filters);
  const ventaDetail = useVentaDetail();

  return (
    <section>
      <div className="products-page__header">
        <div>
          <p className="section-kicker">Ventas</p>
          <h2>Historial de ventas</h2>
          <p className="muted-text">
            Registra articulos vendidos y consulta el detalle de cada operacion.
          </p>
        </div>

        <div className="products-page__header-actions">
          <button
            type="button"
            className="btn venta-page__new-button"
            onClick={() => setIsCreateSaleOpen(true)}
          >
            <span className="venta-page__new-button-symbol" aria-hidden="true">+</span>
            <span>Nueva venta</span>
          </button>
          <Link to="/ventas/reportes" className="btn venta-page__reports-button">
            Reportes
          </Link>
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

      {isCreateSaleOpen ? (
        <CrearVentaModal
          modulos={modulos}
          onClose={() => setIsCreateSaleOpen(false)}
          onCreated={() => {
            reload();
          }}
        />
      ) : null}
    </section>
  );
}

export default VentasPage;
