import { useEffect } from "react";

function DocumentPreviewModal({
  title,
  subtitle = "Vista previa",
  html,
  src,
  onClose,
  frameClassName = "",
}) {
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
      className="report-preview-modal"
      role="dialog"
      aria-modal="true"
      aria-label={title}
      onClick={onClose}
    >
      <div
        className="report-preview-modal__content"
        onClick={(event) => event.stopPropagation()}
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
    </div>
  );
}

export default DocumentPreviewModal;
