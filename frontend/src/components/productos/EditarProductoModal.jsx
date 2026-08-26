import AppModal from "../common/AppModal";
import ProductoForm from "./ProductoForm";
import { GlobalLoadingOverlay } from "../interactions/GlobalInteractions";
import { useProductoForm } from "../../hooks/productos/useProductoForm";

function EditarProductoModal({ productoId, onClose, onUpdated }) {
  const form = useProductoForm({
    productoId,
    onSuccess: (producto) => {
      onUpdated?.(producto);
      onClose();
    },
  });

  if (!productoId) {
    return null;
  }

  if (form.loading || form.loadingCatalogos) {
    return <GlobalLoadingOverlay active message="Cargando..." />;
  }

  return (
    <AppModal overlayClassName="product-create-modal" ariaLabel="Detalle de producto" onClose={onClose}>
      <div
        className="product-create-modal__content"
      >
        <div className="product-create-modal__body">
          <ProductoForm
            title="Detalle de producto"
            description="Actualiza datos comerciales y operativos del producto sin mezclar logica de inventario."
            onCancel={onClose}
            {...form}
          />
        </div>
      </div>
    </AppModal>
  );
}

export default EditarProductoModal;
