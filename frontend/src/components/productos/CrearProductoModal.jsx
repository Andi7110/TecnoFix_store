import { useEffect } from "react";
import { X } from "../../icons/phosphor";
import ProductoForm from "./ProductoForm";
import { useProductoForm } from "../../hooks/productos/useProductoForm";

function CrearProductoModal({ onClose, onCreated }) {
  const form = useProductoForm({
    onSuccess: (producto) => {
      onCreated?.(producto);
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

  return (
    <div
      className="product-create-modal"
      role="dialog"
      aria-modal="true"
      aria-label="Registrar nuevo producto"
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
          aria-label="Cerrar registro de producto"
          title="Cerrar"
        >
          <X size={20} weight="bold" aria-hidden="true" />
        </button>
        <div className="product-create-modal__body">
          <ProductoForm
            title="Crear producto"
            description="Registra un producto nuevo y, si aplica, deja configurado su stock inicial."
            onCancel={onClose}
            {...form}
          />
        </div>
      </div>
    </div>
  );
}

export default CrearProductoModal;
