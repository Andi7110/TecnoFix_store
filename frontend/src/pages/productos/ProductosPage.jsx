import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { Plus, Printer } from "../../icons/phosphor";
import CrearProductoModal from "../../components/productos/CrearProductoModal";
import EditarProductoModal from "../../components/productos/EditarProductoModal";
import ProductBarcodeModal from "../../components/productos/ProductBarcodeModal";
import ProductosTable from "../../components/productos/ProductosTable";
import { useProductosFilters } from "../../hooks/productos/useProductosFilters";
import { useProductosList } from "../../hooks/productos/useProductosList";

const STOCK_ALERT_STORAGE_KEY = "tecnofix.products.stockAlertSeen";

function ProductosPage() {
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
    reload,
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
  const [isCreateProductModalOpen, setIsCreateProductModalOpen] = useState(false);
  const [successMessage, setSuccessMessage] = useState("");
  const [isProductsAlertDismissed, setIsProductsAlertDismissed] = useState(
    () => window.localStorage.getItem(STOCK_ALERT_STORAGE_KEY) === "true",
  );
  const [isBarcodeModalOpen, setIsBarcodeModalOpen] = useState(false);
  const [detailProductId, setDetailProductId] = useState(null);

  useEffect(() => {
    if (productosCriticos.length === 0 || isProductsAlertDismissed) {
      return;
    }

    window.localStorage.setItem(STOCK_ALERT_STORAGE_KEY, "true");
  }, [isProductsAlertDismissed, productosCriticos.length]);

  useEffect(() => {
    if (!successMessage) {
      return undefined;
    }

    const timeoutId = window.setTimeout(() => setSuccessMessage(""), 3200);

    return () => window.clearTimeout(timeoutId);
  }, [successMessage]);

  function handleProductoCreated() {
    reload();
    setSuccessMessage("Producto registrado correctamente.");
  }

  function handleProductoUpdated() {
    reload();
    setSuccessMessage("Producto actualizado correctamente.");
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
            onClick={() => setIsCreateProductModalOpen(true)}
          >
            <span className="products-page__create-btn-content">
              <Plus size={18} weight="bold" aria-hidden="true" />
              <span>Agregar producto</span>
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
      {successMessage ? (
        <div className="cash-create-success" role="status" aria-live="polite">
          {successMessage}
        </div>
      ) : null}

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
              onDetalleClick={(producto) => setDetailProductId(producto.id)}
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
              onDetalleClick={(producto) => setDetailProductId(producto.id)}
            />
          </div>
        </div>
      </div>

      <ProductBarcodeModal
        isOpen={isBarcodeModalOpen}
        productos={productos}
        onClose={() => setIsBarcodeModalOpen(false)}
      />

      {isCreateProductModalOpen ? (
        <CrearProductoModal
          onClose={() => setIsCreateProductModalOpen(false)}
          onCreated={handleProductoCreated}
        />
      ) : null}

      {detailProductId ? (
        <EditarProductoModal
          productoId={detailProductId}
          onClose={() => setDetailProductId(null)}
          onUpdated={handleProductoUpdated}
        />
      ) : null}
    </section>
  );
}

export default ProductosPage;
