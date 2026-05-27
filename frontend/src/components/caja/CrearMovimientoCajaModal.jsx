import { useEffect } from "react";
import MovimientoCajaForm from "./MovimientoCajaForm";
import { useCajaForm } from "../../hooks/caja/useCajaForm";

function CrearMovimientoCajaModal({ onClose, onCreated }) {
  const form = useCajaForm({
    onSuccess: (movimiento) => {
      onCreated?.(movimiento);
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
      className="cash-create-modal"
      role="dialog"
      aria-modal="true"
      aria-label="Registrar movimiento de caja"
      onClick={onClose}
    >
      <div
        className="cash-create-modal__content"
        onClick={(event) => event.stopPropagation()}
      >
        <div className="cash-create-modal__body">
          <MovimientoCajaForm
            onCancel={onClose}
            {...form}
          />
        </div>
      </div>
    </div>
  );
}

export default CrearMovimientoCajaModal;
