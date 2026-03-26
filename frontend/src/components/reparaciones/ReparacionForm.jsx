import CalendarMonthOutlinedIcon from "@mui/icons-material/CalendarMonthOutlined";

function fieldError(errors, name) {
  return errors?.[name]?.[0];
}

function ReparacionForm({
  title,
  values,
  loading,
  saving,
  errors,
  errorMessage,
  isEdit,
  onChange,
  onClienteChange,
  formatMoneyField,
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
    <form className="surface-card product-form repair-form" onSubmit={onSubmit} noValidate>
      <div className="section-heading">
        <div>
          <p className="section-kicker">Taller</p>
          <h2>{title}</h2>
        </div>
      </div>

      {errorMessage ? <div className="alert alert-danger">{errorMessage}</div> : null}

      <div className="row g-3">
        <div className="col-md-4">
          <label className="form-label">Modulo</label>
          <input
            className="form-control"
            value="Reparaciones"
            readOnly
            disabled
          />
        </div>

        <div className="col-md-8">
          <label className="form-label">Nombre cliente</label>
          <input
            className={`form-control ${fieldError(errors, "cliente.nombre") ? "is-invalid" : ""}`}
            value={values.cliente.nombre}
            onChange={(event) => onClienteChange("nombre", event.target.value)}
            maxLength="150"
            required
          />
          <div className="invalid-feedback">{fieldError(errors, "cliente.nombre")}</div>
        </div>

        <div className="col-md-4">
          <label className="form-label">Telefono</label>
          <input
            className={`form-control ${fieldError(errors, "cliente.telefono") ? "is-invalid" : ""}`}
            value={values.cliente.telefono}
            onChange={(event) => onClienteChange("telefono", event.target.value)}
            type="tel"
            inputMode="numeric"
            maxLength="9"
            placeholder="0000-0000"
          />
          <div className="invalid-feedback">{fieldError(errors, "cliente.telefono")}</div>
        </div>

        <div className="col-md-4">
          <label className="form-label">DUI</label>
          <input
            className={`form-control ${fieldError(errors, "cliente.documento") ? "is-invalid" : ""}`}
            value={values.cliente.documento}
            onChange={(event) => onClienteChange("documento", event.target.value)}
            inputMode="numeric"
            maxLength="10"
            placeholder="00000000-0"
          />
          <div className="invalid-feedback">{fieldError(errors, "cliente.documento")}</div>
        </div>

        <div className="col-md-4">
          <label className="form-label">Email cliente</label>
          <input
            className={`form-control ${fieldError(errors, "cliente.email") ? "is-invalid" : ""}`}
            value={values.cliente.email}
            onChange={(event) => onClienteChange("email", event.target.value)}
            type="email"
            inputMode="email"
            maxLength="150"
            placeholder="cliente@correo.com"
          />
          <div className="invalid-feedback">{fieldError(errors, "cliente.email")}</div>
        </div>

        <div className="col-12">
          <label className="form-label">Direccion cliente</label>
          <input
            className={`form-control ${fieldError(errors, "cliente.direccion") ? "is-invalid" : ""}`}
            value={values.cliente.direccion}
            onChange={(event) => onClienteChange("direccion", event.target.value)}
            maxLength="255"
            placeholder="Colonia, calle, numero de casa"
          />
          <div className="invalid-feedback">{fieldError(errors, "cliente.direccion")}</div>
        </div>

        <div className="col-md-4">
          <label className="form-label">Marca de dispositivo</label>
          <input
            className={`form-control ${fieldError(errors, "marca") ? "is-invalid" : ""}`}
            value={values.marca}
            onChange={(event) => onChange("marca", event.target.value)}
            maxLength="100"
            required
          />
          <div className="invalid-feedback">{fieldError(errors, "marca")}</div>
        </div>

        <div className="col-md-4">
          <label className="form-label">Modelo</label>
          <input
            className={`form-control ${fieldError(errors, "modelo") ? "is-invalid" : ""}`}
            value={values.modelo}
            onChange={(event) => onChange("modelo", event.target.value)}
            maxLength="100"
            required
          />
          <div className="invalid-feedback">{fieldError(errors, "modelo")}</div>
        </div>

        <div className="col-md-4">
          <label className="form-label">Tipo equipo</label>
          <select
            className={`form-select ${fieldError(errors, "tipo_equipo") ? "is-invalid" : ""}`}
            value={values.tipo_equipo}
            onChange={(event) => onChange("tipo_equipo", event.target.value)}
            required
          >
            <option value="celular">Celular</option>
            <option value="tablet">Tablet</option>
            <option value="otro">Otro</option>
          </select>
          <div className="invalid-feedback">{fieldError(errors, "tipo_equipo")}</div>
        </div>

        <div className="col-md-4">
          <label className="form-label">Fecha ingreso</label>
          <div className="input-group repair-date-input">
            <span className="input-group-text">
              <CalendarMonthOutlinedIcon fontSize="small" />
            </span>
            <input
              className={`form-control ${fieldError(errors, "fecha_ingreso") ? "is-invalid" : ""}`}
              type="datetime-local"
              value={values.fecha_ingreso}
              onChange={(event) => onChange("fecha_ingreso", event.target.value)}
              required
            />
          </div>
          <div className="invalid-feedback">{fieldError(errors, "fecha_ingreso")}</div>
        </div>

        <div className="col-md-4">
          <label className="form-label">Fecha estimada</label>
          <div className="input-group repair-date-input">
            <span className="input-group-text">
              <CalendarMonthOutlinedIcon fontSize="small" />
            </span>
            <input
              className={`form-control ${fieldError(errors, "fecha_estimada_entrega") ? "is-invalid" : ""}`}
              type="date"
              value={values.fecha_estimada_entrega}
              onChange={(event) => onChange("fecha_estimada_entrega", event.target.value)}
            />
          </div>
          <div className="invalid-feedback">{fieldError(errors, "fecha_estimada_entrega")}</div>
        </div>

        <div className="col-md-2">
          <label className="form-label">Costo</label>
          <div className="input-group product-money-input">
            <span className="input-group-text">$</span>
            <input
              className={`form-control text-end ${fieldError(errors, "costo_reparacion") ? "is-invalid" : ""}`}
              type="text"
              value={values.costo_reparacion}
              onChange={(event) => onChange("costo_reparacion", event.target.value)}
              onBlur={() => formatMoneyField("costo_reparacion")}
              inputMode="decimal"
              autoComplete="off"
              placeholder="0.00"
            />
          </div>
          <div className="invalid-feedback">{fieldError(errors, "costo_reparacion")}</div>
          <small className="muted-text d-block mt-2">
            Ingresa el costo de la reparacion. Acepta coma o punto y se ajusta a 2 decimales.
          </small>
        </div>

        <div className="col-md-2">
          <label className="form-label">Anticipo</label>
          <div className="input-group product-money-input">
            <span className="input-group-text">$</span>
            <input
              className={`form-control text-end ${fieldError(errors, "anticipo") ? "is-invalid" : ""}`}
              type="text"
              value={values.anticipo}
              onChange={(event) => onChange("anticipo", event.target.value)}
              onBlur={() => formatMoneyField("anticipo")}
              inputMode="decimal"
              autoComplete="off"
              placeholder="0.00"
            />
          </div>
          <div className="invalid-feedback">{fieldError(errors, "anticipo")}</div>
          <small className="muted-text d-block mt-2">
            Ingresa el anticipo recibido. Acepta coma o punto y se ajusta a 2 decimales.
          </small>
        </div>

        <div className="col-12">
          <label className="form-label">Problema reportado</label>
          <textarea
            className={`form-control ${fieldError(errors, "problema_reportado") ? "is-invalid" : ""}`}
            rows="3"
            value={values.problema_reportado}
            onChange={(event) => onChange("problema_reportado", event.target.value)}
            required
          />
          <div className="invalid-feedback">{fieldError(errors, "problema_reportado")}</div>
        </div>

        <div className="col-12">
          <label className="form-label">Diagnostico</label>
          <textarea
            className={`form-control ${fieldError(errors, "diagnostico") ? "is-invalid" : ""}`}
            rows="3"
            value={values.diagnostico}
            onChange={(event) => onChange("diagnostico", event.target.value)}
          />
          <div className="invalid-feedback">{fieldError(errors, "diagnostico")}</div>
        </div>

        <div className="col-12">
          <label className="form-label">Observacion</label>
          <textarea
            className={`form-control ${fieldError(errors, "observacion") ? "is-invalid" : ""}`}
            rows="3"
            value={values.observacion}
            onChange={(event) => onChange("observacion", event.target.value)}
          />
          <div className="invalid-feedback">{fieldError(errors, "observacion")}</div>
        </div>
      </div>

      <div className="products-filter-actions mt-4">
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
