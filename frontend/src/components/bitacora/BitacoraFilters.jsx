const MODULE_OPTIONS = [
  "Inventario",
  "Productos",
  "Ventas",
  "Reparaciones",
  "Caja",
  "Bitacora",
];

function BitacoraFilters({ values, onChange, onSubmit, onClear }) {
  return (
    <form className="surface-card bitacora-filters products-filters--minimal" onSubmit={onSubmit}>
      <div className="section-heading">
        <div>
          <p className="section-kicker">Auditoria</p>
          <h2>Filtros de bitacora</h2>
        </div>
      </div>

      <div className="bitacora-filters__grid products-filter-grid">
        <div>
          <label className="form-label">Buscar</label>
          <input
            className="form-control"
            type="search"
            value={values.buscar}
            placeholder="Usuario, ruta o descripcion"
            onChange={(event) => onChange("buscar", event.target.value)}
          />
        </div>

        <div>
          <label className="form-label">Modulo</label>
          <select
            className="form-select"
            value={values.modulo}
            onChange={(event) => onChange("modulo", event.target.value)}
          >
            <option value="">Todos</option>
            {MODULE_OPTIONS.map((modulo) => (
              <option key={modulo} value={modulo}>
                {modulo}
              </option>
            ))}
          </select>
        </div>

        <div>
          <label className="form-label">Accion</label>
          <select
            className="form-select"
            value={values.accion}
            onChange={(event) => onChange("accion", event.target.value)}
          >
            <option value="">Todas</option>
            <option value="crear">Crear</option>
            <option value="actualizar">Actualizar</option>
            <option value="eliminar">Eliminar</option>
            <option value="otro">Otro</option>
          </select>
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
        <button type="submit" className="btn products-filter-actions__apply">
          Aplicar filtros
        </button>
        <button type="button" className="btn products-filter-actions__clear" onClick={onClear}>
          Limpiar
        </button>
      </div>
    </form>
  );
}

export default BitacoraFilters;
