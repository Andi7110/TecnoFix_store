import { Dialog, Modal, ModalOverlay } from "react-aria-components";

function AppModal({
  children,
  onClose,
  overlayClassName,
  ariaLabel,
  ariaLabelledby,
  isDismissable = true,
  role = "dialog",
}) {
  return (
    <ModalOverlay
      isOpen
      isDismissable={isDismissable}
      isKeyboardDismissDisabled={!isDismissable}
      className={overlayClassName}
      onOpenChange={(isOpen) => !isOpen && onClose?.()}
    >
      <Modal className="app-aria-modal-shell">
        <Dialog
          className="app-aria-modal-dialog"
          aria-label={ariaLabel}
          aria-labelledby={ariaLabelledby}
          role={role}
        >
          {({ close }) => (typeof children === "function" ? children({ close }) : children)}
        </Dialog>
      </Modal>
    </ModalOverlay>
  );
}

export default AppModal;
