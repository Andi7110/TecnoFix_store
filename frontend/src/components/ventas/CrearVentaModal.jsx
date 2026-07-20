import { useEffect } from "react";
import { X } from "@phosphor-icons/react";
import VentaFormContainer from "./VentaFormContainer";

function CrearVentaModal({ onClose, onCreated }) {
  useEffect(() => {
    function handleKeyDown(event) {
      if (event.key === "Escape") {
        if (document.querySelector(".venta-transfer-modal")) {
          return;
        }

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

  function handleSuccess(venta, nextTicketConfig) {
    onCreated?.(venta, nextTicketConfig);
    onClose();
  }

  return (
    <div
      className="venta-create-modal"
      role="dialog"
      aria-modal="true"
      aria-label="Registrar nueva venta"
      onClick={onClose}
    >
      <div
        className="venta-create-modal__content ventas-create-page"
        onClick={(event) => event.stopPropagation()}
      >
        <button
          type="button"
          className="venta-create-modal__close"
          onClick={onClose}
          aria-label="Cerrar caja registradora"
          title="Cerrar"
        >
          <X size={20} weight="bold" aria-hidden="true" />
        </button>
        <div className="venta-create-modal__body">
          <VentaFormContainer
            onSuccess={handleSuccess}
            onCancel={onClose}
          />
        </div>
      </div>
    </div>
  );
}

export default CrearVentaModal;
