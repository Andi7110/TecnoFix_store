import { useEffect } from "react";
import { X } from "../../icons/phosphor";
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

  useEffect(() => {
    function handleKeyDown(event) {
      if (event.key === "Escape") {
        onClose();
      }
    }

    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    window.addEventListener("keydown", handleKeyDown);

    return () => {
      document.body.style.overflow = previousOverflow;
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, [onClose]);

  if (!productoId) {
    return null;
  }

  if (form.loading || form.loadingCatalogos) {
    return <GlobalLoadingOverlay active message="Cargando..." />;
  }

  return (
    <div
      className="product-create-modal"
      role="dialog"
      aria-modal="true"
      aria-label="Detalle de producto"
      onClick={onClose}
    >
      <div
        className="product-create-modal__content"
        onClick={(event) => event.stopPropagation()}
      >
        <button
          type="button"
          className="product-create-modal__close"
          onClick={onClose}
          aria-label="Cerrar detalle de producto"
          title="Cerrar"
        >
          <X size={20} weight="bold" aria-hidden="true" />
        </button>
        <div className="product-create-modal__body">
          <ProductoForm
            title="Detalle de producto"
            description="Actualiza datos comerciales y operativos del producto sin mezclar logica de inventario."
            onCancel={onClose}
            {...form}
          />
        </div>
      </div>
    </div>
  );
}

export default EditarProductoModal;
