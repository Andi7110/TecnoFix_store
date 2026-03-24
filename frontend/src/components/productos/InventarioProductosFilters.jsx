function InventarioProductosFilters({
  values,
  modulos,
  categorias,
  loadingCategorias,
  onChange,
  onSubmit,
  onClear,
}) {
  return (
    <form className="surface-card products-filters" onSubmit={onSubmit}>
      <div className="section-heading">
        <div>
          <p className="section-kicker">Submodulo</p>
          <h2>Inventario de productos</h2>
          <p className="muted-text">
            Historial de productos creados con foto, precios y datos principales.
          </p>
        </div>
      </div>

      <div className="products-filter-grid">
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
          <label className="form-label">Categoria</label>
          <select
            className="form-select"
            value={values.categoria_id}
            onChange={(event) => onChange("categoria_id", event.target.value)}
            disabled={loadingCategorias}
          >
            <option value="">Todas</option>
            {categorias.map((categoria) => (
              <option key={categoria.id} value={categoria.id}>
                {categoria.nombre}
              </option>
            ))}
          </select>
        </div>

        <div>
          <label className="form-label">Codigo</label>
          <input
            className="form-control"
            placeholder="Buscar por codigo"
            value={values.codigo}
            onChange={(event) => onChange("codigo", event.target.value)}
          />
        </div>

        <div>
          <label className="form-label">Nombre</label>
          <input
            className="form-control"
            placeholder="Buscar por nombre"
            value={values.nombre}
            onChange={(event) => onChange("nombre", event.target.value)}
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

export default InventarioProductosFilters;
