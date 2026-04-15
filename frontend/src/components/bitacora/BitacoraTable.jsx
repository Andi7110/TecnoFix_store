function formatDateTime(value) {
  if (!value) {
    return "-";
  }

  return new Intl.DateTimeFormat("es-SV", {
    dateStyle: "medium",
    timeStyle: "short",
  }).format(new Date(value));
}

function actionLabel(action) {
  return {
    crear: "Crear",
    actualizar: "Actualizar",
    eliminar: "Eliminar",
    otro: "Otro",
  }[action] ?? action;
}

function BitacoraTable({ movimientos, loading }) {
  if (loading) {
    return (
      <div className="surface-card">
        <p className="empty-state">Cargando bitacora...</p>
      </div>
    );
  }

  if (movimientos.length === 0) {
    return (
      <div className="surface-card">
        <p className="empty-state">No hay movimientos registrados en la bitacora.</p>
      </div>
    );
  }

  return (
    <div className="surface-card bitacora-table-wrapper">
      <div className="table-responsive">
        <table className="table align-middle bitacora-table">
          <thead>
            <tr>
              <th>Fecha</th>
              <th>Usuario</th>
              <th>Modulo</th>
              <th>Accion</th>
              <th>Descripcion</th>
              <th>Ruta</th>
              <th className="text-end">Estado</th>
            </tr>
          </thead>
          <tbody>
            {movimientos.map((movimiento) => (
              <tr key={movimiento.id}>
                <td>{formatDateTime(movimiento.fecha_movimiento)}</td>
                <td>
                  <div className="bitacora-table__user">
                    <strong>{movimiento.usuario?.name ?? movimiento.usuario_nombre ?? "Sistema"}</strong>
                    {movimiento.ip_address ? <span>{movimiento.ip_address}</span> : null}
                  </div>
                </td>
                <td>{movimiento.modulo}</td>
                <td>
                  <span className={`bitacora-action bitacora-action--${movimiento.accion}`}>
                    {actionLabel(movimiento.accion)}
                  </span>
                </td>
                <td>
                  <div>{movimiento.descripcion}</div>
                  <small className="muted-text">{movimiento.metodo_http}</small>
                </td>
                <td>
                  <code className="bitacora-table__route">{movimiento.ruta}</code>
                </td>
                <td className="text-end fw-semibold">{movimiento.codigo_respuesta ?? "-"}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

export default BitacoraTable;
