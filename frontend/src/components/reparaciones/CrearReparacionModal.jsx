import AppModal from "../common/AppModal";
import ReparacionFormContainer from "./ReparacionFormContainer";

function CrearReparacionModal({ onClose, onCreated }) {
  function handleSuccess(reparacion) {
    onCreated?.(reparacion);
    onClose();
  }

  return (
    <AppModal overlayClassName="repair-create-modal" ariaLabel="Registrar nueva reparacion" onClose={onClose}>
      <div
        className="repair-create-modal__content repair-create-page"
      >
        <div className="repair-create-modal__body">
          <ReparacionFormContainer
            formId="create-repair-modal-form"
            onSuccess={handleSuccess}
            onCancel={onClose}
          />
        </div>
      </div>
    </AppModal>
  );
}

export default CrearReparacionModal;
