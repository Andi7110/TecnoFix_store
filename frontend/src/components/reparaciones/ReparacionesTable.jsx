import { Link } from "react-router-dom";
import ReparacionEstadoBadge from "./ReparacionEstadoBadge";

function ReparacionesTableSkeleton() {
  return (
    <div className="surface-card products-table-wrapper inventory-table-wrapper products-table-wrapper--loading repairs-table-card">
      <div className="table-responsive">
        <table className="table align-middle repairs-table inventory-table">
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
            {Array.from({ length: 4 }).map((_, index) => (
              <tr key={index}>
                <td>
                  <span className="products-loading-cell products-loading-cell--title" />
                  <span className="products-loading-cell products-loading-cell--small" />
                </td>
                <td>
                  <span className="products-loading-cell products-loading-cell--medium" />
                  <span className="products-loading-cell products-loading-cell--small" />
                </td>
                <td>
                  <span className="products-loading-cell products-loading-cell--medium" />
                  <span className="products-loading-cell products-loading-cell--small" />
                </td>
                <td><span className="products-loading-cell products-loading-cell--medium" /></td>
                <td>
                  <span className="products-loading-cell products-loading-cell--medium" />
                  <span className="products-loading-cell products-loading-cell--small" />
                </td>
                <td><span className="products-loading-cell products-loading-cell--badge" /></td>
                <td className="text-end"><span className="products-loading-cell products-loading-cell--button" /></td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

function ReparacionesTable({ reparaciones, loading }) {
  if (loading) {
    return <ReparacionesTableSkeleton />;
  }

  if (reparaciones.length === 0) {
    return (
      <div className="surface-card">
        <p className="empty-state">No hay reparaciones para mostrar.</p>
      </div>
    );
  }

  return (
    <div className="surface-card products-table-wrapper inventory-table-wrapper repairs-table-card">
      <div className="table-responsive">
        <table className="table align-middle repairs-table inventory-table">
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
                  <div className="products-table__actions">
                    <Link
                      to={`/reparaciones/${reparacion.id}/editar`}
                      className="btn btn-sm"
                    >
                      Ver detalle
                    </Link>
                  </div>
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
