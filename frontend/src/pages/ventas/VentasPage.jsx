import { useState } from "react";
import { Link } from "react-router-dom";
import { ChartLine, Plus } from "../../icons/phosphor";
import ProductosPagination from "../../components/productos/ProductosPagination";
import CrearVentaModal from "../../components/ventas/CrearVentaModal";
import VentaDetailModal from "../../components/ventas/VentaDetailModal";
import TicketPreviewModal from "../../components/reportes/TicketPreviewModal";
import VentasFilters from "../../components/ventas/VentasFilters";
import VentasTable from "../../components/ventas/VentasTable";
import { useProductoCatalogos } from "../../hooks/productos/useProductoCatalogos";
import { useVentaDetail } from "../../hooks/ventas/useVentaDetail";
import { useVentasFilters } from "../../hooks/ventas/useVentasFilters";
import { useVentasList } from "../../hooks/ventas/useVentasList";
import { notifySuccess } from "../../utils/toasts";

function VentasPage() {
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [ticketPreview, setTicketPreview] = useState(null);
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

  function handleVentaCreated(venta) {
    reload();
    notifySuccess(
      venta?.numero_venta
        ? `Venta ${venta.numero_venta} registrada exitosamente.`
        : "Venta registrada exitosamente.",
    );
  }

  return (
    <section className="products-page ventas-page ventas-page--minimal">
      <div className="products-page__header ventas-page__header">
        <div>
          <p className="section-kicker">Ventas</p>
          <h2>Historial de ventas</h2>
          <p className="muted-text">
            Registra articulos vendidos y consulta el detalle de cada operacion.
          </p>
        </div>

        <div className="products-page__header-actions ventas-page__header-actions">
          <Link to="/ventas/reportes" className="btn products-page__inventory-btn venta-page__reports-button">
            <ChartLine size={18} weight="bold" aria-hidden="true" />
            <span>Reportes</span>
          </Link>
          <button
            type="button"
            className="btn products-page__create-btn venta-page__new-button"
            onClick={() => setIsCreateModalOpen(true)}
          >
            <span className="products-page__create-btn-content">
              <Plus size={18} weight="bold" aria-hidden="true" />
              <span>Nueva venta</span>
            </span>
          </button>
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
        onTicketClick={(venta) => setTicketPreview({ venta })}
      />

      {isCreateModalOpen ? (
        <CrearVentaModal
          onClose={() => setIsCreateModalOpen(false)}
          onCreated={handleVentaCreated}
        />
      ) : null}

      {ticketPreview ? (
        <TicketPreviewModal
          venta={ticketPreview.venta}
          ticketConfig={ticketPreview.ticketConfig}
          onClose={() => setTicketPreview(null)}
        />
      ) : null}
    </section>
  );
}

export default VentasPage;
