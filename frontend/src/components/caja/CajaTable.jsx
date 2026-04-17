function money(value) {
  return new Intl.NumberFormat("es-SV", {
    style: "currency",
    currency: "USD",
  }).format(Number(value ?? 0));
}

function CajaTableSkeleton() {
  return (
    <div className="surface-card products-table-wrapper inventory-table-wrapper products-table-wrapper--loading cash-table-card">
      <div className="table-responsive">
        <table className="table align-middle repairs-table inventory-table cash-table">
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
            {Array.from({ length: 4 }).map((_, index) => (
              <tr key={index}>
                <td><span className="products-loading-cell products-loading-cell--medium" /></td>
                <td><span className="products-loading-cell products-loading-cell--badge" /></td>
                <td><span className="products-loading-cell products-loading-cell--medium" /></td>
                <td><span className="products-loading-cell products-loading-cell--medium" /></td>
                <td>
                  <span className="products-loading-cell products-loading-cell--title" />
                  <span className="products-loading-cell products-loading-cell--small" />
                </td>
                <td><span className="products-loading-cell products-loading-cell--small" /></td>
                <td className="text-end"><span className="products-loading-cell products-loading-cell--medium" /></td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

function CajaTable({ movimientos, loading }) {
  if (loading) {
    return <CajaTableSkeleton />;
  }

  if (movimientos.length === 0) {
    return (
      <div className="surface-card">
        <p className="empty-state">No hay movimientos de caja para mostrar.</p>
      </div>
    );
  }

  return (
    <div className="surface-card products-table-wrapper inventory-table-wrapper cash-table-card">
      <div className="table-responsive">
        <table className="table align-middle repairs-table inventory-table cash-table">
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
                <td>
                  <span className={`cash-table__badge cash-table__badge--${movimiento.tipo_movimiento}`}>
                    {movimiento.tipo_movimiento}
                  </span>
                </td>
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
