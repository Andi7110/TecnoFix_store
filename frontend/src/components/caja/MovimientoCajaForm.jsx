function fieldError(errors, name) {
  return errors?.[name]?.[0];
}

function MovimientoCajaForm({
  values,
  modulos,
  saving,
  errors,
  errorMessage,
  onChange,
  onSubmit,
  onCancel,
}) {
  return (
    <form className="surface-card product-form" onSubmit={onSubmit}>
      <div className="section-heading">
        <div>
          <p className="section-kicker">Caja</p>
          <h2>Registrar movimiento</h2>
        </div>
      </div>

      {errorMessage ? <div className="alert alert-danger">{errorMessage}</div> : null}

      <div className="repairs-grid">
        <div>
          <label className="form-label">Tipo</label>
          <select
            className={`form-select ${fieldError(errors, "tipo_movimiento") ? "is-invalid" : ""}`}
            value={values.tipo_movimiento}
            onChange={(event) => onChange("tipo_movimiento", event.target.value)}
          >
            <option value="entrada">Entrada</option>
            <option value="salida">Salida</option>
          </select>
          <div className="invalid-feedback">{fieldError(errors, "tipo_movimiento")}</div>
        </div>

        <div>
          <label className="form-label">Categoria</label>
          <select
            className={`form-select ${fieldError(errors, "categoria_movimiento") ? "is-invalid" : ""}`}
            value={values.categoria_movimiento}
            onChange={(event) => onChange("categoria_movimiento", event.target.value)}
          >
            <option value="venta">Venta</option>
            <option value="gasto">Gasto</option>
            <option value="costo_fijo">Costo fijo</option>
            <option value="reparacion">Reparacion</option>
            <option value="retiro">Retiro</option>
            <option value="ingreso_manual">Ingreso manual</option>
            <option value="ajuste_caja">Ajuste caja</option>
            <option value="compra_productos">Compra productos</option>
          </select>
          <div className="invalid-feedback">{fieldError(errors, "categoria_movimiento")}</div>
        </div>

        <div>
          <label className="form-label">Modulo</label>
          <select
            className="form-select"
            value={values.modulo_id}
            onChange={(event) => onChange("modulo_id", event.target.value)}
          >
            <option value="">General</option>
            {modulos.map((modulo) => (
              <option key={modulo.id} value={modulo.id}>
                {modulo.nombre}
              </option>
            ))}
          </select>
        </div>

        <div>
          <label className="form-label">Monto</label>
          <input
            className={`form-control ${fieldError(errors, "monto") ? "is-invalid" : ""}`}
            type="number"
            min="0.01"
            step="0.01"
            value={values.monto}
            onChange={(event) => onChange("monto", event.target.value)}
          />
          <div className="invalid-feedback">{fieldError(errors, "monto")}</div>
        </div>

        <div>
          <label className="form-label">Fecha</label>
          <input
            className={`form-control ${fieldError(errors, "fecha_movimiento") ? "is-invalid" : ""}`}
            type="datetime-local"
            value={values.fecha_movimiento}
            onChange={(event) => onChange("fecha_movimiento", event.target.value)}
          />
          <div className="invalid-feedback">{fieldError(errors, "fecha_movimiento")}</div>
        </div>
      </div>

      <div className="mb-3">
        <label className="form-label">Concepto</label>
        <input
          className={`form-control ${fieldError(errors, "concepto") ? "is-invalid" : ""}`}
          value={values.concepto}
          onChange={(event) => onChange("concepto", event.target.value)}
        />
        <div className="invalid-feedback">{fieldError(errors, "concepto")}</div>
      </div>

      <div className="mb-3">
        <label className="form-label">Referencia</label>
        <input
          className="form-control"
          value={values.referencia}
          onChange={(event) => onChange("referencia", event.target.value)}
        />
      </div>

      <div className="mb-3">
        <label className="form-label">Observacion</label>
        <textarea
          className="form-control"
          rows="3"
          value={values.observacion}
          onChange={(event) => onChange("observacion", event.target.value)}
        />
      </div>

      <div className="products-filter-actions">
        <button type="submit" className="btn btn-primary" disabled={saving}>
          {saving ? "Guardando..." : "Registrar movimiento"}
        </button>
        <button type="button" className="btn btn-light" onClick={onCancel}>
          Cancelar
        </button>
      </div>
    </form>
  );
}

export default MovimientoCajaForm;
