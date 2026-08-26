import AppModal from "../common/AppModal";
import VentaFormContainer from "./VentaFormContainer";

function CrearVentaModal({ onClose, onCreated }) {
  function handleSuccess(venta, nextTicketConfig) {
    onCreated?.(venta, nextTicketConfig);
    onClose();
  }

  return (
    <AppModal overlayClassName="venta-create-modal" ariaLabel="Registrar nueva venta" onClose={onClose}>
      <div
        className="venta-create-modal__content ventas-create-page"
      >
        <div className="venta-create-modal__body">
          <VentaFormContainer
            onSuccess={handleSuccess}
            onCancel={onClose}
          />
        </div>
      </div>
    </AppModal>
  );
}

export default CrearVentaModal;
