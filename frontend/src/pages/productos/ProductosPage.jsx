import { useEffect, useMemo, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Plus, Printer } from "../../icons/phosphor";
import ProductBarcodeModal from "../../components/productos/ProductBarcodeModal";
import ProductosTable from "../../components/productos/ProductosTable";
import { useProductosFilters } from "../../hooks/productos/useProductosFilters";
import { useProductosList } from "../../hooks/productos/useProductosList";

const STOCK_ALERT_STORAGE_KEY = "tecnofix.products.stockAlertSeen";

function ProductosPage() {
  const navigate = useNavigate();
  const { filters } = useProductosFilters();
  const listFilters = useMemo(
    () => ({
      ...filters,
      estado: true,
      per_page: 100,
      page: 1,
    }),
    [filters],
  );
  const {
    productos,
    loading,
    error,
  } = useProductosList(listFilters);
  const productosDisponibles = useMemo(
    () => productos.filter((producto) => Number(producto.stock ?? 0) > 0).slice(0, 3),
    [productos],
  );
  const productosAgotados = useMemo(
    () => productos.filter((producto) => Number(producto.stock ?? 0) <= 0),
    [productos],
  );
  const productosCriticos = useMemo(
    () => productos.filter((producto) => Number(producto.stock ?? 0) === 2),
    [productos],
  );
  const [isOpeningCreate, setIsOpeningCreate] = useState(false);
  const [isProductsAlertDismissed, setIsProductsAlertDismissed] = useState(
    () => window.localStorage.getItem(STOCK_ALERT_STORAGE_KEY) === "true",
  );
  const [isBarcodeModalOpen, setIsBarcodeModalOpen] = useState(false);

  useEffect(() => {
    if (productosCriticos.length === 0 || isProductsAlertDismissed) {
      return;
    }

    window.localStorage.setItem(STOCK_ALERT_STORAGE_KEY, "true");
  }, [isProductsAlertDismissed, productosCriticos.length]);

  useEffect(() => {
    if (!isOpeningCreate) {
      return undefined;
    }

    const timeoutId = window.setTimeout(() => {
      navigate("/productos/nuevo");
    }, 450);

    return () => window.clearTimeout(timeoutId);
  }, [isOpeningCreate, navigate]);

  function handleOpenCreate() {
    if (isOpeningCreate) {
      return;
    }

    setIsOpeningCreate(true);
  }

  return (
    <section className="products-page products-page--minimal">
      <div className="products-page__header products-page__header--minimal">
        <div>
          <p className="section-kicker">Productos</p>
          <h2>Gestion de productos</h2>
          <p className="muted-text">
            Consulta, agrega y revisa tus productos.
          </p>
        </div>

        <div className="products-page__header-actions">
          <button
            type="button"
            className="btn products-page__barcode-btn"
            onClick={() => setIsBarcodeModalOpen(true)}
            disabled={productos.length === 0}
          >
            <Printer size={18} weight="bold" aria-hidden="true" />
            <span>Imprimir codigos</span>
          </button>
          <Link to="/productos/inventario" className="btn products-page__inventory-btn">
            Inventario
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
                  <span>Agregar producto</span>
                </>
              )}
            </span>
          </button>
        </div>
      </div>

      {productosCriticos.length > 0 && !isProductsAlertDismissed ? (
        <div className="alert alert-warning products-alert">
          <span>
            Solo quedan 2 articulos de: {productosCriticos.map((producto) => producto.nombre).join(", ")}.
          </span>
          <button
            type="button"
            className="products-alert__close"
            aria-label="Cerrar alerta"
            onClick={() => {
              window.localStorage.setItem(STOCK_ALERT_STORAGE_KEY, "true");
              setIsProductsAlertDismissed(true);
            }}
          >
            ×
          </button>
        </div>
      ) : null}

      {error ? <div className="alert alert-danger">{error}</div> : null}

      <div className="row g-3">
        <div className="col-12">
          <div className="inventory-section">
            <div className="section-heading">
              <div>
                <p className="section-kicker">Productos recientes</p>
                <h2></h2>
                <p className="muted-text">
                </p>
              </div>
            </div>

            <ProductosTable
              productos={productosDisponibles}
              loading={loading}
            />
          </div>
        </div>

        <div className="col-12">
          <div className="inventory-section inventory-section--separated">
            <div className="inventory-section__divider" aria-hidden="true">
              <span />
            </div>

            <div className="section-heading">
              <div>
                <h2>Productos agotados</h2>
                <p className="muted-text">
                  Estos productos ya no aparecen en inventario porque su stock llego a cero.
                </p>
              </div>
            </div>

            <ProductosTable
              productos={productosAgotados}
              loading={loading}
            />
          </div>
        </div>
      </div>

      <ProductBarcodeModal
        isOpen={isBarcodeModalOpen}
        productos={productos}
        onClose={() => setIsBarcodeModalOpen(false)}
      />
    </section>
  );
}

export default ProductosPage;
