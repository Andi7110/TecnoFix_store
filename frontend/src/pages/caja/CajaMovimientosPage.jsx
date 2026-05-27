import { useEffect, useState } from "react";
import { Plus } from "../../icons/phosphor";
import CajaFilters from "../../components/caja/CajaFilters";
import CrearMovimientoCajaModal from "../../components/caja/CrearMovimientoCajaModal";
import CajaSummaryCards from "../../components/caja/CajaSummaryCards";
import CajaTable from "../../components/caja/CajaTable";
import ProductosPagination from "../../components/productos/ProductosPagination";
import { useProductoCatalogos } from "../../hooks/productos/useProductoCatalogos";
import { useCajaFilters } from "../../hooks/caja/useCajaFilters";
import { useCajaList } from "../../hooks/caja/useCajaList";

function CajaMovimientosPage() {
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [successMessage, setSuccessMessage] = useState("");
  const {
    filters,
    draftFilters,
    updateDraftFilter,
    applyFilters,
    clearFilters,
    changePage,
  } = useCajaFilters();
  const { modulos } = useProductoCatalogos();
  const { movimientos, meta, summary, loading, error, reload } = useCajaList(filters);

  useEffect(() => {
    if (!successMessage) {
      return undefined;
    }

    const timer = window.setTimeout(() => {
      setSuccessMessage("");
    }, 3200);

    return () => window.clearTimeout(timer);
  }, [successMessage]);

  function handleMovimientoCreated() {
    reload();
    setSuccessMessage("Movimiento de caja registrado.");
  }

  return (
    <section className="products-page products-page--minimal cash-page">
      <div className="products-page__header products-page__header--minimal">
        <div>
          <p className="section-kicker">Caja</p>
          <h2>Movimientos de dinero</h2>
          <p className="muted-text">
            Controla entradas, salidas, categorias y balance operativo.
          </p>
        </div>

        <div className="products-page__header-actions cash-page__header-actions">
          <button
            type="button"
            className="btn products-page__create-btn cash-page__create-btn"
            onClick={() => setIsCreateModalOpen(true)}
          >
            <span className="products-page__create-btn-content">
              <Plus size={18} weight="bold" aria-hidden="true" />
              <span>Nuevo movimiento</span>
            </span>
          </button>
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

      {successMessage ? (
        <div className="cash-create-success" role="status" aria-live="polite">
          {successMessage}
        </div>
      ) : null}

      <CajaTable movimientos={movimientos} loading={loading} />

      <ProductosPagination meta={meta} onPageChange={changePage} />

      {isCreateModalOpen ? (
        <CrearMovimientoCajaModal
          onClose={() => setIsCreateModalOpen(false)}
          onCreated={handleMovimientoCreated}
        />
      ) : null}
    </section>
  );
}

export default CajaMovimientosPage;
