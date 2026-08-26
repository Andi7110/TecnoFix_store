import AppModal from "../common/AppModal";

function DocumentPreviewModal({
  title,
  subtitle = "Vista previa",
  html,
  src,
  onClose,
  frameClassName = "",
}) {
  return (
    <AppModal overlayClassName="report-preview-modal" ariaLabel={title} onClose={onClose}>
      <div
        className="report-preview-modal__content"
      >
        <div className="report-preview-modal__header">
          <div>
            <p className="section-kicker">{subtitle}</p>
            <h3>{title}</h3>
          </div>
          <div className="report-preview-modal__actions">
            <button type="button" className="btn products-filter-actions__clear" onClick={onClose}>
              Cerrar
            </button>
          </div>
        </div>

        <div className="report-preview-modal__frame-shell">
          <iframe
            title={title}
            className={`report-preview-modal__frame ${frameClassName}`.trim()}
            src={src}
            srcDoc={src ? undefined : html}
          />
        </div>
      </div>
    </AppModal>
  );
}

export default DocumentPreviewModal;
