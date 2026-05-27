import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { ChartLine, CheckCircle, Plus } from "../../icons/phosphor";
import ProductosPagination from "../../components/productos/ProductosPagination";
import CrearVentaModal from "../../components/ventas/CrearVentaModal";
import VentaDetailModal from "../../components/ventas/VentaDetailModal";
import VentasFilters from "../../components/ventas/VentasFilters";
import VentasTable from "../../components/ventas/VentasTable";
import { useProductoCatalogos } from "../../hooks/productos/useProductoCatalogos";
import { useVentaDetail } from "../../hooks/ventas/useVentaDetail";
import { useVentasFilters } from "../../hooks/ventas/useVentasFilters";
import { useVentasList } from "../../hooks/ventas/useVentasList";
import { printSaleTicket } from "../../utils/saleTicketPrint";

function VentasPage() {
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [successMessage, setSuccessMessage] = useState("");
  const [ticketPrompt, setTicketPrompt] = useState(null);
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

  useEffect(() => {
    if (!successMessage) {
      return undefined;
    }

    const timer = window.setTimeout(() => {
      setSuccessMessage("");
    }, 3200);

    return () => window.clearTimeout(timer);
  }, [successMessage]);

  function handleVentaCreated(venta, ticketConfig) {
    reload();
    setSuccessMessage(
      venta?.numero_venta
        ? `Cobro exitoso. Venta ${venta.numero_venta} registrada.`
        : "Cobro exitoso.",
    );
    setTicketPrompt({
      venta,
      ticketConfig,
    });
  }

  function handleGenerateTicket() {
    if (ticketPrompt?.venta) {
      printSaleTicket(ticketPrompt.venta, ticketPrompt.ticketConfig);
    }

    setTicketPrompt(null);
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

      {successMessage ? (
        <div className="venta-payment-success" role="status" aria-live="polite">
          <CheckCircle
            size={22}
            weight="fill"
            className="venta-payment-success__icon"
            aria-hidden="true"
          />
          <span>{successMessage}</span>
        </div>
      ) : null}

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

      {isCreateModalOpen ? (
        <CrearVentaModal
          onClose={() => setIsCreateModalOpen(false)}
          onCreated={handleVentaCreated}
        />
      ) : null}

      {ticketPrompt ? (
        <div
          className="app-confirm-modal"
          role="dialog"
          aria-modal="true"
          aria-label="Venta registrada"
          onClick={() => setTicketPrompt(null)}
        >
          <div
            className="app-confirm-modal__card"
            onClick={(event) => event.stopPropagation()}
          >
            <h3 className="venta-ticket-prompt__title">
              <CheckCircle
                size={34}
                weight="fill"
                className="venta-ticket-prompt__icon"
                aria-hidden="true"
              />
              <span>Venta registrada</span>
            </h3>
            <p className="muted-text mb-3 venta-ticket-prompt__question">
              &iquest;Desea generar ticket?
            </p>
            <div className="app-confirm-modal__actions">
              <button
                type="button"
                className="btn btn-light"
                onClick={() => setTicketPrompt(null)}
              >
                Cancelar
              </button>
              <button
                type="button"
                className="btn btn-success venta-ticket-prompt__generate"
                onClick={handleGenerateTicket}
              >
                <span>Generar</span>
              </button>
            </div>
          </div>
        </div>
      ) : null}
    </section>
  );
}

export default VentasPage;
