import { useEffect } from "react";
import ReparacionFormContainer from "./ReparacionFormContainer";

function CrearReparacionModal({ onClose, onCreated }) {
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

  function handleSuccess(reparacion) {
    onCreated?.(reparacion);
    onClose();
  }

  return (
    <div
      className="repair-create-modal"
      role="dialog"
      aria-modal="true"
      aria-label="Registrar nueva reparacion"
      onClick={onClose}
    >
      <div
        className="repair-create-modal__content repair-create-page"
        onClick={(event) => event.stopPropagation()}
      >
        <div className="repair-create-modal__body">
          <ReparacionFormContainer
            formId="create-repair-modal-form"
            onSuccess={handleSuccess}
            onCancel={onClose}
          />
        </div>
      </div>
    </div>
  );
}

export default CrearReparacionModal;
