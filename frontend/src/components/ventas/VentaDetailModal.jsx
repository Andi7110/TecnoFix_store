function formatCurrency(value) {
  return new Intl.NumberFormat("es-SV", {
    style: "currency",
    currency: "USD",
  }).format(Number(value ?? 0));
}

function formatDate(value) {
  if (!value) {
    return "-";
  }

  return new Intl.DateTimeFormat("es-SV", {
    dateStyle: "medium",
    timeStyle: "short",
  }).format(new Date(value));
}

function formatMetodo(value) {
  return String(value ?? "")
    .replace(/_/g, " ")
    .replace(/\b\w/g, (char) => char.toUpperCase());
}

function VentaDetailModal({
  venta,
  loading,
  error,
  onClose,
}) {
  if (!venta && !loading && !error) {
    return null;
  }

  return (
    <div
      className="venta-detail-modal"
      role="dialog"
      aria-modal="true"
      onClick={onClose}
    >
      <div
        className="venta-detail-modal__card"
        onClick={(event) => event.stopPropagation()}
      >
        <div className="venta-detail-modal__header">
          <div>
            <p className="section-kicker">Historial</p>
            <h3 className="mb-0">
              {venta?.numero_venta ?? "Detalle de venta"}
            </h3>
          </div>

          <button type="button" className="btn btn-light btn-sm" onClick={onClose}>
            Cerrar
          </button>
        </div>

        {loading ? <p className="empty-state">Cargando detalle...</p> : null}
        {error ? <div className="alert alert-danger">{error}</div> : null}

        {venta ? (
          <>
            <div className="venta-detail-modal__meta">
              <div>
                <span className="muted-text">Modulo</span>
                <strong>{venta.modulo?.nombre ?? "Sin modulo"}</strong>
              </div>
              <div>
                <span className="muted-text">Fecha</span>
                <strong>{formatDate(venta.fecha_venta)}</strong>
              </div>
              <div>
                <span className="muted-text">Metodo</span>
                <strong>{formatMetodo(venta.metodo_pago)}</strong>
              </div>
            </div>

            <div className="table-responsive">
              <table className="table align-middle ventas-detail-table">
                <thead>
                  <tr>
                    <th>Articulo</th>
                    <th>Cantidad</th>
                    <th>Precio</th>
                    <th>Subtotal</th>
                  </tr>
                </thead>
                <tbody>
                  {venta.detalles?.map((detalle) => (
                    <tr key={detalle.id}>
                      <td>
                        <div className="product-name">
                          {detalle.producto?.nombre ?? detalle.descripcion_item}
                        </div>
                        <div className="product-code">
                          {detalle.producto?.codigo ?? "Sin codigo"}
                        </div>
                      </td>
                      <td>{Number(detalle.cantidad ?? 0)}</td>
                      <td>{formatCurrency(detalle.precio_unitario)}</td>
                      <td>{formatCurrency(detalle.subtotal)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            <div className="venta-detail-modal__summary">
              <div>
                <span className="muted-text">Subtotal</span>
                <strong>{formatCurrency(venta.subtotal)}</strong>
              </div>
              <div>
                <span className="muted-text">Descuento</span>
                <strong>{formatCurrency(venta.descuento)}</strong>
              </div>
              <div>
                <span className="muted-text">Total</span>
                <strong>{formatCurrency(venta.total)}</strong>
              </div>
            </div>

            {venta.observacion ? (
              <div className="venta-detail-modal__notes">
                <span className="muted-text">Observacion</span>
                <p className="mb-0">{venta.observacion}</p>
              </div>
            ) : null}
          </>
        ) : null}
      </div>
    </div>
  );
}

export default VentaDetailModal;
