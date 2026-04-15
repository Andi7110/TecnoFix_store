function ProductosFilters({
  values,
  modulos,
  categorias,
  loadingCategorias,
  onChange,
  onSubmit,
  onClear,
}) {
  const visibleModulos = modulos.filter((modulo) => modulo.nombre !== "Bitacora");

  return (
    <form className="surface-card products-filters products-filters--minimal" onSubmit={onSubmit}>
      <div className="section-heading">
        <div>
          <p className="section-kicker">Busqueda</p>
          <h2>Filtros de productos</h2>
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
            {visibleModulos.map((modulo) => (
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
          <label className="form-label">Nombre</label>
          <input
            className="form-control"
            placeholder="Buscar por nombre"
            value={values.nombre}
            onChange={(event) => onChange("nombre", event.target.value)}
          />
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
          <label className="form-label">Stock bajo</label>
          <select
            className="form-select"
            value={values.stock_bajo}
            onChange={(event) => onChange("stock_bajo", event.target.value)}
          >
            <option value="">Todos</option>
            <option value="true">Solo stock bajo</option>
          </select>
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

export default ProductosFilters;
