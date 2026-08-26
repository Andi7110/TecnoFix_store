import AppModal from "../common/AppModal";
import ProductoForm from "./ProductoForm";
import { useProductoForm } from "../../hooks/productos/useProductoForm";

function CrearProductoModal({ onClose, onCreated }) {
  const form = useProductoForm({
    onSuccess: (producto) => {
      onCreated?.(producto);
      onClose();
    },
  });

  return (
    <AppModal overlayClassName="product-create-modal" ariaLabel="Registrar nuevo producto" onClose={onClose}>
      <div
        className="product-create-modal__content"
      >
        <div className="product-create-modal__body">
          <ProductoForm
            title="Crear producto"
            description="Registra un producto nuevo y, si aplica, deja configurado su stock inicial."
            onCancel={onClose}
            {...form}
          />
        </div>
      </div>
    </AppModal>
  );
}

export default CrearProductoModal;
