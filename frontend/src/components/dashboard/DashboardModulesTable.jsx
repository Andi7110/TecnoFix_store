function formatMoney(value) {
  return new Intl.NumberFormat("es-SV", {
    style: "currency",
    currency: "USD",
  }).format(Number(value ?? 0));
}

function DashboardModulesTable({ rows }) {
  return (
    <div className="surface-card">
      <div className="section-heading">
        <div>
          <p className="section-kicker">Ventas por modulo</p>
          <h2>Resumen por area</h2>
        </div>
      </div>

      {rows.length === 0 ? (
        <p className="empty-state">No hay ventas registradas hoy por modulo.</p>
      ) : (
        <div className="table-responsive mt-3">
          <table className="table align-middle repairs-table">
            <thead>
              <tr>
                <th>Modulo</th>
                <th>Ventas</th>
                <th className="text-end">Total vendido</th>
              </tr>
            </thead>
            <tbody>
              {rows.map((row) => (
                <tr key={row.modulo_id}>
                  <td>{row.modulo_nombre}</td>
                  <td>{row.ventas_count}</td>
                  <td className="text-end fw-semibold">
                    {formatMoney(row.total_vendido)}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}

export default DashboardModulesTable;
