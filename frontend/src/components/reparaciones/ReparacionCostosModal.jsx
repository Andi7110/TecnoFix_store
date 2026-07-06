import { useEffect, useState } from "react";
import { getReparacion } from "../../api/reparaciones";
import ReparacionCostosPanel from "./ReparacionCostosPanel";

function ReparacionCostosModal({ reparacion, onClose, onUpdated }) {
  const [detail, setDetail] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [reloadToken, setReloadToken] = useState(0);

  useEffect(() => {
    if (!reparacion?.id) {
      return undefined;
    }

    let ignore = false;

    async function loadDetail() {
      setLoading(true);
      setError("");

      try {
        const data = await getReparacion(reparacion.id);

        if (!ignore) {
          setDetail(data);
        }
      } catch {
        if (!ignore) {
          setError("No se pudo cargar la reparacion.");
        }
      } finally {
        if (!ignore) {
          setLoading(false);
        }
      }
    }

    loadDetail();

    return () => {
      ignore = true;
    };
  }, [reparacion?.id, reloadToken]);

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

  function handleUpdated() {
    setReloadToken((current) => current + 1);
    onUpdated?.();
  }

  return (
    <div
      className="repair-cost-modal"
      role="dialog"
      aria-modal="true"
      aria-label="Agregar costo de reparacion"
      onClick={onClose}
    >
      <div
        className="repair-cost-modal__content"
        onClick={(event) => event.stopPropagation()}
      >
        <div className="repair-cost-modal__header">
          <div>
            <p className="section-kicker">Costos</p>
            <h3>{reparacion?.codigo_reparacion ?? "Reparacion"}</h3>
            <p className="muted-text">
              {reparacion?.cliente?.nombre ?? "Cliente"} · {reparacion?.marca} {reparacion?.modelo}
            </p>
          </div>
          <button type="button" className="btn products-filter-actions__clear btn-sm" onClick={onClose}>
            Cerrar
          </button>
        </div>

        {error ? <div className="alert alert-danger">{error}</div> : null}

        {loading ? (
          <div className="surface-card">
            <p className="empty-state">Cargando costos...</p>
          </div>
        ) : detail ? (
          <ReparacionCostosPanel
            reparacionId={detail.id}
            values={detail}
            onCreated={handleUpdated}
          />
        ) : null}
      </div>
    </div>
  );
}

export default ReparacionCostosModal;
