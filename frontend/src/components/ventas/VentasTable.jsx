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

function VentasTableSkeleton() {
  return (
    <div className="surface-card ventas-table-wrapper ventas-table-wrapper--loading">
      <div className="table-responsive">
        <table className="table align-middle products-table inventory-table ventas-table">
          <thead>
            <tr>
              <th>Numero</th>
              <th>Modulo</th>
              <th>Fecha</th>
              <th>Items</th>
              <th>Metodo</th>
              <th>Total</th>
              <th className="text-end">Acciones</th>
            </tr>
          </thead>
          <tbody>
            {Array.from({ length: 4 }).map((_, index) => (
              <tr key={index}>
                <td>
                  <span className="ventas-loading-cell ventas-loading-cell--title" />
                  <span className="ventas-loading-cell ventas-loading-cell--small" />
                </td>
                <td><span className="ventas-loading-cell ventas-loading-cell--medium" /></td>
                <td><span className="ventas-loading-cell ventas-loading-cell--medium" /></td>
                <td><span className="ventas-loading-cell ventas-loading-cell--badge" /></td>
                <td><span className="ventas-loading-cell ventas-loading-cell--medium" /></td>
                <td><span className="ventas-loading-cell ventas-loading-cell--medium" /></td>
                <td className="text-end"><span className="ventas-loading-cell ventas-loading-cell--button" /></td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

function VentasTable({
  ventas,
  loading,
  onViewDetail,
}) {
  if (loading) {
    return <VentasTableSkeleton />;
  }

  if (ventas.length === 0) {
    return (
      <div className="surface-card">
        <p className="empty-state">No hay ventas que coincidan con los filtros.</p>
      </div>
    );
  }

  return (
    <div className="surface-card ventas-table-wrapper">
      <div className="table-responsive">
        <table className="table align-middle products-table inventory-table ventas-table">
          <thead>
            <tr>
              <th>Numero</th>
              <th>Modulo</th>
              <th>Fecha</th>
              <th>Items</th>
              <th>Metodo</th>
              <th>Total</th>
              <th className="text-end">Acciones</th>
            </tr>
          </thead>
          <tbody>
            {ventas.map((venta) => (
              <tr key={venta.id}>
                <td>
                  <div className="product-name">{venta.numero_venta}</div>
                  <div className="product-code">
                    {formatCurrency(venta.subtotal)} antes de descuento
                  </div>
                </td>
                <td>{venta.modulo?.nombre ?? "Sin modulo"}</td>
                <td>{formatDate(venta.fecha_venta)}</td>
                <td>{Number(venta.detalles_count ?? 0)}</td>
                <td>{formatMetodo(venta.metodo_pago)}</td>
                <td>{formatCurrency(venta.total)}</td>
                <td className="text-end">
                  <button
                    type="button"
                    className="btn btn-sm ventas-table__detail-button"
                    onClick={() => onViewDetail(venta.id)}
                  >
                    Detalle
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

export default VentasTable;
