function VentasFilters({
  values,
  modulos,
  onChange,
  onSubmit,
  onClear,
}) {
  return (
    <form className="surface-card ventas-filters" onSubmit={onSubmit}>
      <div className="section-heading">
        <div>
          <p className="section-kicker">Busqueda</p>
          <h2>Filtros de ventas</h2>
        </div>
      </div>

      <div className="ventas-filters__grid">
        <div>
          <label className="form-label">Modulo</label>
          <select
            className="form-select"
            value={values.modulo_id}
            onChange={(event) => onChange("modulo_id", event.target.value)}
          >
            <option value="">Todos</option>
            {modulos.map((modulo) => (
              <option key={modulo.id} value={modulo.id}>
                {modulo.nombre}
              </option>
            ))}
          </select>
        </div>

        <div>
          <label className="form-label">Numero de venta</label>
          <input
            className="form-control"
            placeholder="Buscar por numero"
            value={values.numero_venta}
            onChange={(event) => onChange("numero_venta", event.target.value)}
          />
        </div>

        <div>
          <label className="form-label">Metodo de pago</label>
          <select
            className="form-select"
            value={values.metodo_pago}
            onChange={(event) => onChange("metodo_pago", event.target.value)}
          >
            <option value="">Todos</option>
            <option value="efectivo">Efectivo</option>
            <option value="transferencia">Transferencia</option>
            <option value="mixto">Mixto</option>
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

export default VentasFilters;
