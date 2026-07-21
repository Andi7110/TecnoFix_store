function CajaFilters({ values, modulos, onChange, onSubmit, onClear }) {
  return (
    <form className="cash-filters" onSubmit={onSubmit}>
      <div className="repairs-grid products-filter-grid">
        <div>
          <label className="form-label">Tipo</label>
          <select
            className="form-select"
            value={values.tipo_movimiento}
            onChange={(event) => onChange("tipo_movimiento", event.target.value)}
          >
            <option value="">Todos</option>
            <option value="entrada">Entrada</option>
            <option value="salida">Salida</option>
          </select>
        </div>

        <div>
          <label className="form-label">Categoría</label>
          <select
            className="form-select"
            value={values.categoria_movimiento}
            onChange={(event) => onChange("categoria_movimiento", event.target.value)}
          >
            <option value="">Todas</option>
            <option value="venta">Venta</option>
            <option value="gasto">Gasto</option>
            <option value="costo_fijo">Costo fijo</option>
            <option value="reparacion">Reparacion</option>
            <option value="retiro">Retiro</option>
            <option value="ingreso_manual">Ingreso manual</option>
            <option value="ajuste_caja">Ajuste caja</option>
            <option value="compra_productos">Compra productos</option>
          </select>
        </div>

        <div>
          <label className="form-label">Área</label>
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
          <label className="form-label">Desde</label>
          <input
            className="form-control"
            type="date"
            value={values.fecha_desde}
            onChange={(event) => onChange("fecha_desde", event.target.value)}
          />
        </div>

        <div>
          <label className="form-label">Hasta</label>
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
          Aplicar
        </button>
        <button type="button" className="btn products-filter-actions__clear" onClick={onClear}>
          Limpiar
        </button>
      </div>
    </form>
  );
}

export default CajaFilters;
