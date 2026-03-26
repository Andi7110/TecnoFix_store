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

function VentasTable({
  ventas,
  loading,
  onViewDetail,
}) {
  if (loading) {
    return (
      <div className="surface-card">
        <p className="empty-state">Cargando ventas...</p>
      </div>
    );
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
                    className="btn btn-sm btn-success"
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
