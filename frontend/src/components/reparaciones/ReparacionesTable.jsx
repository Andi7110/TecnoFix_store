import { Link } from "react-router-dom";
import { ClipboardText, CurrencyDollar } from "../../icons/phosphor";

const ESTADOS_REPARACION = [
  { value: "registrado", label: "Registrado" },
  { value: "en_proceso", label: "En proceso" },
  { value: "terminado", label: "Terminado" },
  { value: "entregado", label: "Entregado" },
];

const ESTADOS_REPARACION_LABELS = ESTADOS_REPARACION.reduce((labels, estado) => {
  labels[estado.value] = estado.label;
  return labels;
}, {});

const ESTADOS_PERMITIDOS_POR_ESTADO = {
  registrado: ["registrado", "en_proceso", "terminado"],
  en_proceso: ["en_proceso", "terminado", "entregado"],
  terminado: ["terminado", "entregado"],
  entregado: ["entregado"],
};

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
              <th className="text-center">Estado</th>
              <th className="text-center">Acciones</th>
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
                <td className="text-center"><span className="products-loading-cell products-loading-cell--button" /></td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

function ReparacionesTable({
  reparaciones,
  loading,
  statusSavingId,
  onEstadoChange,
  onAbonoClick,
}) {
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
              <th className="text-center">Estado</th>
              <th className="text-center">Acciones</th>
            </tr>
          </thead>
          <tbody>
            {reparaciones.map((reparacion) => {
              const isEntregado = reparacion.estado_reparacion === "entregado";
              const isSaving = statusSavingId === reparacion.id;
              const estadosDisponibles = ESTADOS_REPARACION.filter((estado) => (
                ESTADOS_PERMITIDOS_POR_ESTADO[reparacion.estado_reparacion]?.includes(estado.value)
              ));

              return (
                <tr key={reparacion.id}>
                  <td className="text-center">
                    <div className="product-name">{reparacion.codigo_reparacion}</div>
                    <div className="product-code">{reparacion.tipo_equipo}</div>
                  </td>
                  <td className="text-center">
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
                    {Number(reparacion.saldo_pendiente ?? 0) > 0 ? (
                      <span className="repair-balance-badge">Pendiente</span>
                    ) : null}
                  </td>
                  <td>
                    <div className={`repair-status-control repair-status-control--${reparacion.estado_reparacion}`}>
                      {isEntregado ? (
                        <span className="repair-status-control__readonly">
                          {ESTADOS_REPARACION_LABELS[reparacion.estado_reparacion]}
                        </span>
                      ) : (
                        <select
                          className="form-select repair-status-control__select"
                          value={reparacion.estado_reparacion}
                          onChange={(event) => onEstadoChange?.(reparacion, event.target.value)}
                          disabled={isSaving}
                          aria-label={`Cambiar estado de ${reparacion.codigo_reparacion}`}
                        >
                          {estadosDisponibles.map((estado) => (
                            <option key={estado.value} value={estado.value}>
                              {estado.label}
                            </option>
                          ))}
                        </select>
                      )}
                      {isSaving ? (
                        <span className="repair-status-control__saving">Guardando...</span>
                      ) : null}
                    </div>
                  </td>
                  <td className="text-center">
                    <div className="products-table__actions repairs-table__actions">
                      <Link
                        to={`/reparaciones/${reparacion.id}/editar`}
                        className="btn btn-sm repairs-table__action-btn"
                        title="Ver detalle"
                        aria-label={`Ver detalle de ${reparacion.codigo_reparacion}`}
                      >
                        <ClipboardText size={21} weight="bold" aria-hidden="true" />
                      </Link>
                      {Number(reparacion.saldo_pendiente ?? 0) > 0 ? (
                        <button
                          type="button"
                          className="btn btn-sm repairs-table__action-btn repairs-table__action-btn--payment"
                          onClick={() => onAbonoClick?.(reparacion)}
                          disabled={statusSavingId === reparacion.id}
                          title="Abonar saldo"
                          aria-label={`Abonar saldo de ${reparacion.codigo_reparacion}`}
                        >
                          <CurrencyDollar size={21} weight="bold" aria-hidden="true" />
                        </button>
                      ) : null}
                    </div>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}

export default ReparacionesTable;
