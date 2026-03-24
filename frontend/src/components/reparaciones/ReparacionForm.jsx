function fieldError(errors, name) {
  return errors?.[name]?.[0];
}

function ReparacionForm({
  title,
  values,
  modulos,
  loading,
  saving,
  errors,
  errorMessage,
  isEdit,
  onChange,
  onClienteChange,
  onSubmit,
  onCancel,
}) {
  if (loading) {
    return (
      <div className="surface-card">
        <p className="empty-state">Cargando formulario...</p>
      </div>
    );
  }

  return (
    <form className="surface-card product-form" onSubmit={onSubmit}>
      <div className="section-heading">
        <div>
          <p className="section-kicker">Taller</p>
          <h2>{title}</h2>
        </div>
      </div>

      {errorMessage ? <div className="alert alert-danger">{errorMessage}</div> : null}

      <div className="repairs-grid">
        <div>
          <label className="form-label">Modulo</label>
          <select
            className="form-select"
            value={values.modulo_id}
            onChange={(event) => onChange("modulo_id", event.target.value)}
          >
            <option value="">Sin modulo</option>
            {modulos.map((modulo) => (
              <option key={modulo.id} value={modulo.id}>
                {modulo.nombre}
              </option>
            ))}
          </select>
        </div>

        <div>
          <label className="form-label">Nombre cliente</label>
          <input
            className={`form-control ${fieldError(errors, "cliente.nombre") ? "is-invalid" : ""}`}
            value={values.cliente.nombre}
            onChange={(event) => onClienteChange("nombre", event.target.value)}
          />
          <div className="invalid-feedback">{fieldError(errors, "cliente.nombre")}</div>
        </div>

        <div>
          <label className="form-label">Telefono</label>
          <input
            className="form-control"
            value={values.cliente.telefono}
            onChange={(event) => onClienteChange("telefono", event.target.value)}
          />
        </div>

        <div>
          <label className="form-label">Documento</label>
          <input
            className="form-control"
            value={values.cliente.documento}
            onChange={(event) => onClienteChange("documento", event.target.value)}
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
          <label className="form-label">Tipo equipo</label>
          <select
            className="form-select"
            value={values.tipo_equipo}
            onChange={(event) => onChange("tipo_equipo", event.target.value)}
          >
            <option value="celular">Celular</option>
            <option value="tablet">Tablet</option>
            <option value="otro">Otro</option>
          </select>
        </div>

        <div>
          <label className="form-label">Fecha ingreso</label>
          <input
            className="form-control"
            type="datetime-local"
            value={values.fecha_ingreso}
            onChange={(event) => onChange("fecha_ingreso", event.target.value)}
          />
        </div>

        <div>
          <label className="form-label">Fecha estimada</label>
          <input
            className="form-control"
            type="date"
            value={values.fecha_estimada_entrega}
            onChange={(event) => onChange("fecha_estimada_entrega", event.target.value)}
          />
        </div>

        <div>
          <label className="form-label">Costo</label>
          <input
            className="form-control"
            type="number"
            min="0"
            step="0.01"
            value={values.costo_reparacion}
            onChange={(event) => onChange("costo_reparacion", event.target.value)}
          />
        </div>

        <div>
          <label className="form-label">Anticipo</label>
          <input
            className="form-control"
            type="number"
            min="0"
            step="0.01"
            value={values.anticipo}
            onChange={(event) => onChange("anticipo", event.target.value)}
          />
        </div>
      </div>

      <div className="mb-3">
        <label className="form-label">Problema reportado</label>
        <textarea
          className="form-control"
          rows="3"
          value={values.problema_reportado}
          onChange={(event) => onChange("problema_reportado", event.target.value)}
        />
      </div>

      <div className="mb-3">
        <label className="form-label">Diagnostico</label>
        <textarea
          className="form-control"
          rows="3"
          value={values.diagnostico}
          onChange={(event) => onChange("diagnostico", event.target.value)}
        />
      </div>

      <div className="mb-3">
        <label className="form-label">Direccion cliente</label>
        <input
          className="form-control"
          value={values.cliente.direccion}
          onChange={(event) => onClienteChange("direccion", event.target.value)}
        />
      </div>

      <div className="mb-3">
        <label className="form-label">Email cliente</label>
        <input
          className="form-control"
          value={values.cliente.email}
          onChange={(event) => onClienteChange("email", event.target.value)}
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
          {saving ? "Guardando..." : isEdit ? "Actualizar reparacion" : "Registrar reparacion"}
        </button>
        <button type="button" className="btn btn-light" onClick={onCancel}>
          Cancelar
        </button>
      </div>
    </form>
  );
}

export default ReparacionForm;
