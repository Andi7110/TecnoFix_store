import ReparacionEstadoBadge from "./ReparacionEstadoBadge";

function ReparacionHistorial({ historiales = [] }) {
  const historialReciente = [...historiales]
    .sort((a, b) => new Date(b.fecha_cambio) - new Date(a.fecha_cambio))
    .slice(0, 1);

  return (
    <div className="surface-card repairs-history">
      <div className="section-heading">
        <div>
          <p className="section-kicker">Seguimiento</p>
          <h2>Historial de estados</h2>
        </div>
      </div>

      {historialReciente.length === 0 ? (
        <p className="empty-state">No hay cambios de estado registrados.</p>
      ) : (
        <div className="repair-history-list">
          {historialReciente.map((item) => (
            <div key={item.id} className="repair-history-item">
              <div className="repair-history-item__header">
                <ReparacionEstadoBadge estado={item.estado_nuevo} />
                <small className="muted-text">
                  {new Date(item.fecha_cambio).toLocaleString()}
                </small>
              </div>
              <p className="muted-text">
                {item.estado_anterior
                  ? `Cambio desde ${item.estado_anterior}`
                  : "Estado inicial"}
              </p>
              {item.comentario ? <p>{item.comentario}</p> : null}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

export default ReparacionHistorial;
