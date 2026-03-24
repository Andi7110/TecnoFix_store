function ReparacionesFilters({ values, onChange, onSubmit, onClear }) {
  return (
    <form className="surface-card repairs-filters" onSubmit={onSubmit}>
      <div className="section-heading">
        <div>
          <p className="section-kicker">Busqueda</p>
          <h2>Filtros de reparaciones</h2>
        </div>
      </div>

      <div className="repairs-grid">
        <div>
          <label className="form-label">Estado</label>
          <select
            className="form-select"
            value={values.estado}
            onChange={(event) => onChange("estado", event.target.value)}
          >
            <option value="">Todos</option>
            <option value="registrado">Registrado</option>
            <option value="en_proceso">En proceso</option>
            <option value="terminado">Terminado</option>
            <option value="entregado">Entregado</option>
            <option value="cancelado">Cancelado</option>
          </select>
        </div>

        <div>
          <label className="form-label">Cliente</label>
          <input
            className="form-control"
            value={values.cliente}
            onChange={(event) => onChange("cliente", event.target.value)}
          />
        </div>

        <div>
          <label className="form-label">Telefono</label>
          <input
            className="form-control"
            value={values.telefono}
            onChange={(event) => onChange("telefono", event.target.value)}
          />
        </div>

        <div>
          <label className="form-label">Marca</label>
          <input
            className="form-control"
            value={values.marca}
            onChange={(event) => onChange("marca", event.target.value)}
          />
        </div>

        <div>
          <label className="form-label">Modelo</label>
          <input
            className="form-control"
            value={values.modelo}
            onChange={(event) => onChange("modelo", event.target.value)}
          />
        </div>

        <div>
          <label className="form-label">Fecha desde</label>
          <input
            className="form-control"
            type="date"
            value={values.fecha_desde}
            onChange={(event) => onChange("fecha_desde", event.target.value)}
          />
        </div>

        <div>
          <label className="form-label">Fecha hasta</label>
          <input
            className="form-control"
            type="date"
            value={values.fecha_hasta}
            onChange={(event) => onChange("fecha_hasta", event.target.value)}
          />
        </div>
      </div>

      <div className="products-filter-actions">
        <button type="submit" className="btn btn-primary">
          Aplicar filtros
        </button>
        <button type="button" className="btn btn-light" onClick={onClear}>
          Limpiar
        </button>
      </div>
    </form>
  );
}

export default ReparacionesFilters;
