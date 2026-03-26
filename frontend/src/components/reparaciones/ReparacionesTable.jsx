import { Link } from "react-router-dom";
import ReparacionEstadoBadge from "./ReparacionEstadoBadge";

function ReparacionesTable({ reparaciones, loading }) {
  if (loading) {
    return (
      <div className="surface-card">
        <p className="empty-state">Cargando reparaciones...</p>
      </div>
    );
  }

  if (reparaciones.length === 0) {
    return (
      <div className="surface-card">
        <p className="empty-state">No hay reparaciones para mostrar.</p>
      </div>
    );
  }

  return (
    <div className="surface-card products-table-wrapper repairs-table-card">
      <div className="table-responsive">
        <table className="table align-middle repairs-table">
          <thead>
            <tr>
              <th>Codigo</th>
              <th>Cliente</th>
              <th>Equipo</th>
              <th>Ingreso</th>
              <th>Montos</th>
              <th>Estado</th>
              <th className="text-end">Acciones</th>
            </tr>
          </thead>
          <tbody>
            {reparaciones.map((reparacion) => (
              <tr key={reparacion.id}>
                <td>
                  <div className="product-name">{reparacion.codigo_reparacion}</div>
                  <div className="product-code">{reparacion.tipo_equipo}</div>
                </td>
                <td>
                  <div>{reparacion.cliente?.nombre}</div>
                  <small className="muted-text">{reparacion.cliente?.telefono}</small>
                </td>
                <td>
                  <div>{reparacion.marca}</div>
                  <small className="muted-text">{reparacion.modelo}</small>
                </td>
                <td>{new Date(reparacion.fecha_ingreso).toLocaleString()}</td>
                <td>
                  <div>Costo: ${Number(reparacion.costo_reparacion ?? 0).toFixed(2)}</div>
                  <small className="muted-text">
                    Saldo: ${Number(reparacion.saldo_pendiente ?? 0).toFixed(2)}
                  </small>
                </td>
                <td>
                  <ReparacionEstadoBadge estado={reparacion.estado_reparacion} />
                </td>
                <td className="text-end">
                  <Link
                    to={`/reparaciones/${reparacion.id}/editar`}
                    className="btn btn-sm btn-outline-dark"
                  >
                    Ver detalle
                  </Link>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

export default ReparacionesTable;
