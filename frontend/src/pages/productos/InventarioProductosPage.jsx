import { useEffect, useMemo, useState } from "react";
import { Plus, Printer } from "../../icons/phosphor";
import CrearProductoModal from "../../components/productos/CrearProductoModal";
import EditarProductoModal from "../../components/productos/EditarProductoModal";
import ProductBarcodeModal from "../../components/productos/ProductBarcodeModal";
import InventarioProductosTable from "../../components/productos/InventarioProductosTable";
import { deleteProducto } from "../../api/productos";
import { useAuth } from "../../hooks/auth/useAuth";
import { useInventarioProductosList } from "../../hooks/productos/useInventarioProductosList";

const initialSectionFilters = {
  nombre: "",
  codigo: "",
  categoria_id: "",
};

function InventarioProductosPage() {
  const { user } = useAuth();
  const [accesoriosPage, setAccesoriosPage] = useState(1);
  const [libreriaPage, setLibreriaPage] = useState(1);
  const [accesoriosPerPage, setAccesoriosPerPage] = useState(5);
  const [libreriaPerPage, setLibreriaPerPage] = useState(5);
  const [accesoriosFilters, setAccesoriosFilters] = useState(initialSectionFilters);
  const [libreriaFilters, setLibreriaFilters] = useState(initialSectionFilters);
  const [accesoriosDraftFilters, setAccesoriosDraftFilters] = useState(initialSectionFilters);
  const [libreriaDraftFilters, setLibreriaDraftFilters] = useState(initialSectionFilters);
  const [isCreateProductModalOpen, setIsCreateProductModalOpen] = useState(false);
  const [isBarcodeModalOpen, setIsBarcodeModalOpen] = useState(false);
  const [successMessage, setSuccessMessage] = useState("");
  const [deleteError, setDeleteError] = useState("");
  const [deletingProductoId, setDeletingProductoId] = useState(null);
  const [pendingDeleteProduct, setPendingDeleteProduct] = useState(null);
  const [detailProductId, setDetailProductId] = useState(null);

  const accesoriosQuery = useMemo(
    () => ({
      page: accesoriosPage,
      per_page: accesoriosPerPage,
      seccion: "accesorios",
      ...accesoriosFilters,
    }),
    [accesoriosPage, accesoriosPerPage, accesoriosFilters],
  );
  const libreriaQuery = useMemo(
    () => ({
      page: libreriaPage,
      per_page: libreriaPerPage,
      seccion: "libreria",
      ...libreriaFilters,
    }),
    [libreriaPage, libreriaPerPage, libreriaFilters],
  );
  const accesoriosListado = useInventarioProductosList(accesoriosQuery);
  const libreriaListado = useInventarioProductosList(libreriaQuery);
  const canDeleteProducts = useMemo(() => {
    const identity = [
      user?.name,
      user?.username,
      user?.email,
    ].filter(Boolean).join(" ").toLowerCase();

    return identity.includes("admin") || identity.includes("administrador");
  }, [user]);
  const printableProductos = useMemo(() => {
    const productosMap = new Map();

    [...accesoriosListado.registros, ...libreriaListado.registros].forEach((registro) => {
      const key = String(registro.producto_id ?? registro.id);

      if (!productosMap.has(key)) {
        productosMap.set(key, {
          id: registro.producto_id ?? registro.id,
          codigo: registro.codigo,
          nombre: registro.nombre,
          precio_venta: registro.precio_venta,
        });
      }
    });

    return Array.from(productosMap.values());
  }, [accesoriosListado.registros, libreriaListado.registros]);

  useEffect(() => {
    if (!successMessage) {
      return undefined;
    }

    const timeoutId = window.setTimeout(() => setSuccessMessage(""), 3200);

    return () => window.clearTimeout(timeoutId);
  }, [successMessage]);

  function handleProductoCreated() {
    accesoriosListado.reload();
    libreriaListado.reload();
    setSuccessMessage("Producto registrado correctamente.");
  }

  function handleProductoUpdated() {
    accesoriosListado.reload();
    libreriaListado.reload();
    setSuccessMessage("Producto actualizado correctamente.");
  }

  function handleProductoDelete(registro) {
    const productoId = registro?.producto_id ?? registro?.id;

    if (!productoId || Number(registro?.estado) === 0) {
      return;
    }

    if (!canDeleteProducts) {
      setDeleteError("Solo un usuario administrador puede eliminar productos del inventario.");
      return;
    }

    setPendingDeleteProduct(registro);
  }

  async function confirmProductoDelete() {
    const registro = pendingDeleteProduct;
    const productoId = registro?.producto_id ?? registro?.id;

    if (!productoId) {
      setPendingDeleteProduct(null);
      return;
    }

    setDeletingProductoId(productoId);
    setDeleteError("");

    try {
      await deleteProducto(productoId);
      accesoriosListado.reload();
      libreriaListado.reload();
      setSuccessMessage("Producto eliminado del inventario correctamente.");
      setPendingDeleteProduct(null);
    } catch (error) {
      const apiMessage = error?.response?.data?.message;
      setDeleteError(apiMessage || "No se pudo eliminar el producto del inventario.");
    } finally {
      setDeletingProductoId(null);
    }
  }

  function updateSectionFilters(setter, name, value) {
    setter((current) => ({
      ...current,
      [name]: value,
    }));
  }

  function clearSectionFilters(setDraft, setApplied, setPage) {
    setDraft(initialSectionFilters);
    setApplied(initialSectionFilters);
    setPage(1);
  }

  function applySectionFilters(draftFilters, setApplied, setPage) {
    setApplied(draftFilters);
    setPage(1);
  }

  return (
    <section className="products-page inventory-products-page products-page--minimal">
      <div className="products-page__header products-page__header--minimal">
        <div>
          <p className="section-kicker">Inventario</p>
          <h2>Submodulo inventario</h2>
          <p className="muted-text">
            Tabla con los productos registrados desde el modulo Productos.
          </p>
        </div>

        <div className="products-page__header-actions inventory-products-page__actions">
          <button
            type="button"
            className="btn products-page__barcode-btn inventory-products-page__action-btn"
            onClick={() => setIsBarcodeModalOpen(true)}
            disabled={printableProductos.length === 0}
          >
            <Printer size={18} weight="bold" aria-hidden="true" />
            <span>Imprimir codigos</span>
          </button>
          <button
            type="button"
            className="btn products-page__create-btn inventory-products-page__action-btn inventory-products-page__action-btn--primary"
            onClick={() => setIsCreateProductModalOpen(true)}
          >
            <span className="products-page__create-btn-content">
              <Plus size={18} weight="bold" aria-hidden="true" />
              <span>Nuevo producto</span>
            </span>
          </button>
        </div>
      </div>

      {accesoriosListado.error ? <div className="alert alert-danger">{accesoriosListado.error}</div> : null}
      {libreriaListado.error ? <div className="alert alert-danger">{libreriaListado.error}</div> : null}
      {deleteError ? <div className="alert alert-danger">{deleteError}</div> : null}
      {successMessage ? (
        <div className="cash-create-success" role="status" aria-live="polite">
          {successMessage}
        </div>
      ) : null}

      <InventarioProductosTable
        accesoriosRegistros={accesoriosListado.registros}
        accesoriosLoading={accesoriosListado.loading}
        accesoriosMeta={accesoriosListado.meta}
        onAccesoriosPageChange={setAccesoriosPage}
        accesoriosPerPage={accesoriosPerPage}
        onAccesoriosPerPageChange={(value) => {
          setAccesoriosPerPage(value);
          setAccesoriosPage(1);
        }}
        accesoriosFilters={accesoriosDraftFilters}
        onAccesoriosFilterChange={(name, value) => updateSectionFilters(setAccesoriosDraftFilters, name, value)}
        onAccesoriosFiltersApply={() => applySectionFilters(accesoriosDraftFilters, setAccesoriosFilters, setAccesoriosPage)}
        onAccesoriosFiltersClear={() => clearSectionFilters(
          setAccesoriosDraftFilters,
          setAccesoriosFilters,
          setAccesoriosPage,
        )}
        onProductoDelete={handleProductoDelete}
        onDetalleClick={(registro) => setDetailProductId(registro.producto_id ?? registro.id)}
        deletingProductoId={deletingProductoId}
        canDeleteProducts={canDeleteProducts}
        libreriaRegistros={libreriaListado.registros}
        libreriaLoading={libreriaListado.loading}
        libreriaMeta={libreriaListado.meta}
        onLibreriaPageChange={setLibreriaPage}
        libreriaPerPage={libreriaPerPage}
        onLibreriaPerPageChange={(value) => {
          setLibreriaPerPage(value);
          setLibreriaPage(1);
        }}
        libreriaFilters={libreriaDraftFilters}
        onLibreriaFilterChange={(name, value) => updateSectionFilters(setLibreriaDraftFilters, name, value)}
        onLibreriaFiltersApply={() => applySectionFilters(libreriaDraftFilters, setLibreriaFilters, setLibreriaPage)}
        onLibreriaFiltersClear={() => clearSectionFilters(
          setLibreriaDraftFilters,
          setLibreriaFilters,
          setLibreriaPage,
        )}
      />

      <ProductBarcodeModal
        isOpen={isBarcodeModalOpen}
        productos={printableProductos}
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

      {pendingDeleteProduct ? (
        <div
          className="app-confirm-modal"
          role="dialog"
          aria-modal="true"
          aria-label="Confirmar eliminacion de producto"
          onClick={() => {
            if (!deletingProductoId) {
              setPendingDeleteProduct(null);
            }
          }}
        >
          <div
            className="app-confirm-modal__card"
            onClick={(event) => event.stopPropagation()}
          >
            <h3>Eliminar producto</h3>
            <p className="muted-text mb-3">Estas seguro que quieres eliminar este producto?</p>
            <div className="app-confirm-modal__actions">
              <button
                type="button"
                className="btn btn-light"
                onClick={() => setPendingDeleteProduct(null)}
                disabled={Boolean(deletingProductoId)}
              >
                Cancelar
              </button>
              <button
                type="button"
                className="btn btn-danger"
                onClick={confirmProductoDelete}
                disabled={Boolean(deletingProductoId)}
              >
                {deletingProductoId ? "Eliminando..." : "Aceptar"}
              </button>
            </div>
          </div>
        </div>
      ) : null}
    </section>
  );
}

export default InventarioProductosPage;
