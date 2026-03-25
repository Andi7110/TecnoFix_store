import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Plus } from "../../icons/phosphor";
import ProductosFilters from "../../components/productos/ProductosFilters";
import ProductosTable from "../../components/productos/ProductosTable";
import { useProductoCatalogos } from "../../hooks/productos/useProductoCatalogos";
import { useProductoEstado } from "../../hooks/productos/useProductoEstado";
import { useProductosFilters } from "../../hooks/productos/useProductosFilters";
import { useProductosList } from "../../hooks/productos/useProductosList";

function ProductosPage() {
  const navigate = useNavigate();
  const {
    filters,
    draftFilters,
    updateDraftFilter,
    applyFilters,
    clearFilters,
  } = useProductosFilters();
  const { modulos, categorias, loadingCategorias } = useProductoCatalogos(
    draftFilters.modulo_id,
    true,
  );
  const { productos, loading, error, reload } = useProductosList(filters);
  const { pendingId, changeEstado } = useProductoEstado();
  const [isOpeningCreate, setIsOpeningCreate] = useState(false);

  useEffect(() => {
    if (!isOpeningCreate) {
      return undefined;
    }

    const timeoutId = window.setTimeout(() => {
      navigate("/productos/nuevo");
    }, 450);

    return () => window.clearTimeout(timeoutId);
  }, [isOpeningCreate, navigate]);

  async function handleToggleEstado(producto) {
    await changeEstado(producto);
    reload();
  }

  function handleOpenCreate() {
    if (isOpeningCreate) {
      return;
    }

    setIsOpeningCreate(true);
  }

  return (
    <section>
      <div className="products-page__header">
        <div>
          <p className="section-kicker">Inventario</p>
          <h2>Gestion de productos</h2>
          <p className="muted-text">
            Consulta, filtra, edita y controla el estado de tu catalogo.
          </p>
        </div>

        <div className="products-page__header-actions">
          <Link to="/productos/inventario" className="btn btn-light">
            Submodulo inventario
          </Link>
          <button
            type="button"
            className="btn products-page__create-btn"
            onClick={handleOpenCreate}
            disabled={isOpeningCreate}
          >
            <span className="products-page__create-btn-content">
              {isOpeningCreate ? (
                <>
                  <span
                    className="spinner-border spinner-border-sm products-page__create-btn-spinner"
                    aria-hidden="true"
                  />
                  <span>Cargando...</span>
                </>
              ) : (
                <>
                  <Plus size={18} weight="bold" aria-hidden="true" />
                  <span>Nuevo producto</span>
                </>
              )}
            </span>
          </button>
        </div>
      </div>

      <ProductosFilters
        values={draftFilters}
        modulos={modulos}
        categorias={categorias}
        loadingCategorias={loadingCategorias}
        onChange={updateDraftFilter}
        onSubmit={applyFilters}
        onClear={clearFilters}
      />

      {error ? <div className="alert alert-danger">{error}</div> : null}

      <ProductosTable
        productos={productos}
        loading={loading}
        pendingId={pendingId}
        onToggleEstado={handleToggleEstado}
      />
    </section>
  );
}

export default ProductosPage;
