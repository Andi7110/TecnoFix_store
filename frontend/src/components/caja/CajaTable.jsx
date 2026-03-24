function money(value) {
  return new Intl.NumberFormat("es-SV", {
    style: "currency",
    currency: "USD",
  }).format(Number(value ?? 0));
}

function CajaTable({ movimientos, loading }) {
  if (loading) {
    return (
      <div className="surface-card">
        <p className="empty-state">Cargando movimientos...</p>
      </div>
    );
  }

  if (movimientos.length === 0) {
    return (
      <div className="surface-card">
        <p className="empty-state">No hay movimientos de caja para mostrar.</p>
      </div>
    );
  }

  return (
    <div className="surface-card products-table-wrapper">
      <div className="table-responsive">
        <table className="table align-middle repairs-table">
          <thead>
            <tr>
              <th>Fecha</th>
              <th>Tipo</th>
              <th>Categoria</th>
              <th>Modulo</th>
              <th>Concepto</th>
              <th>Referencia</th>
              <th className="text-end">Monto</th>
            </tr>
          </thead>
          <tbody>
            {movimientos.map((movimiento) => (
              <tr key={movimiento.id}>
                <td>{new Date(movimiento.fecha_movimiento).toLocaleString()}</td>
                <td>{movimiento.tipo_movimiento}</td>
                <td>{movimiento.categoria_movimiento}</td>
                <td>{movimiento.modulo?.nombre ?? "General"}</td>
                <td>
                  <div>{movimiento.concepto}</div>
                  {movimiento.observacion ? (
                    <small className="muted-text">{movimiento.observacion}</small>
                  ) : null}
                </td>
                <td>{movimiento.referencia ?? "-"}</td>
                <td className={`text-end fw-semibold ${movimiento.tipo_movimiento === "entrada" ? "text-success" : "text-danger"}`}>
                  {money(movimiento.monto)}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

export default CajaTable;
