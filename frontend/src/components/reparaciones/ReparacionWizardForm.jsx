import CalendarMonthOutlinedIcon from "@mui/icons-material/CalendarMonthOutlined";

function fieldError(errors, name) {
  return errors?.[name]?.[0];
}

function InputError({ errors, name }) {
  return <div className="invalid-feedback">{fieldError(errors, name)}</div>;
}

function ReparacionWizardForm({
  formId,
  step,
  values,
  errors,
  errorMessage,
  saving,
  onChange,
  onClienteChange,
  formatMoneyField,
  onSubmit,
  costAction,
}) {
  return (
    <form id={formId} className="repair-wizard__form" onSubmit={onSubmit} noValidate>
      {errorMessage ? <div className="alert alert-danger">{errorMessage}</div> : null}

      {step === 0 ? (
        <section className="repair-wizard__panel" aria-labelledby="repair-step-client-title">
          <div className="repair-wizard__section-heading">
            <span>Información de contacto</span>
            <h3 id="repair-step-client-title"></h3>
            <p>Registra los datos necesarios para identificar y contactar al cliente.</p>
          </div>
          <div className="row g-3">
            <div className="col-12">
              <label className="form-label">Nombre completo <span aria-hidden="true">*</span></label>
              <input autoFocus className={`form-control ${fieldError(errors, "cliente.nombre") ? "is-invalid" : ""}`} value={values.cliente.nombre} onChange={(event) => onClienteChange("nombre", event.target.value)} maxLength="150" placeholder="Ej. Ana Martínez" required />
              <InputError errors={errors} name="cliente.nombre" />
            </div>
            <div className="col-md-6">
              <label className="form-label">Teléfono</label>
              <input className={`form-control ${fieldError(errors, "cliente.telefono") ? "is-invalid" : ""}`} value={values.cliente.telefono} onChange={(event) => onClienteChange("telefono", event.target.value)} type="tel" inputMode="numeric" maxLength="9" placeholder="0000-0000" />
              <InputError errors={errors} name="cliente.telefono" />
            </div>
            <div className="col-md-6">
              <label className="form-label notranslate" translate="no">DUI</label>
              <input className={`form-control ${fieldError(errors, "cliente.documento") ? "is-invalid" : ""}`} value={values.cliente.documento} onChange={(event) => onClienteChange("documento", event.target.value)} inputMode="numeric" maxLength="10" placeholder="00000000-0" />
              <InputError errors={errors} name="cliente.documento" />
            </div>
            <div className="col-md-6">
              <label className="form-label">Correo electrónico</label>
              <input className={`form-control ${fieldError(errors, "cliente.email") ? "is-invalid" : ""}`} value={values.cliente.email} onChange={(event) => onClienteChange("email", event.target.value)} type="email" inputMode="email" maxLength="150" placeholder="cliente@correo.com" />
              <InputError errors={errors} name="cliente.email" />
            </div>
            <div className="col-md-6">
              <label className="form-label">Dirección</label>
              <input className={`form-control ${fieldError(errors, "cliente.direccion") ? "is-invalid" : ""}`} value={values.cliente.direccion} onChange={(event) => onClienteChange("direccion", event.target.value)} maxLength="255" placeholder="Colonia, calle, número de casa" />
              <InputError errors={errors} name="cliente.direccion" />
            </div>
          </div>
        </section>
      ) : null}

      {step === 1 ? (
        <section className="repair-wizard__panel" aria-labelledby="repair-step-device-title">
          <div className="repair-wizard__section-heading">
            <span>Recepción técnica</span>
            <h3 id="repair-step-device-title">Equipo y motivo de ingreso</h3>
            <p>Identifica el dispositivo y deja constancia clara de su condición.</p>
          </div>
          <div className="row g-3">
            <div className="col-md-4">
              <label className="form-label">Tipo de equipo <span aria-hidden="true">*</span></label>
              <select className={`form-select ${fieldError(errors, "tipo_equipo") ? "is-invalid" : ""}`} value={values.tipo_equipo} onChange={(event) => onChange("tipo_equipo", event.target.value)} required>
                <option value="celular">Celular</option><option value="tablet">Tablet</option><option value="otro">Otro</option>
              </select>
              <InputError errors={errors} name="tipo_equipo" />
            </div>
            <div className="col-md-4">
              <label className="form-label">Marca <span aria-hidden="true">*</span></label>
              <input autoFocus className={`form-control ${fieldError(errors, "marca") ? "is-invalid" : ""}`} value={values.marca} onChange={(event) => onChange("marca", event.target.value)} maxLength="100" placeholder="Ej. Samsung" required />
              <InputError errors={errors} name="marca" />
            </div>
            <div className="col-md-4">
              <label className="form-label">Modelo <span aria-hidden="true">*</span></label>
              <input className={`form-control ${fieldError(errors, "modelo") ? "is-invalid" : ""}`} value={values.modelo} onChange={(event) => onChange("modelo", event.target.value)} maxLength="100" placeholder="Ej. Galaxy A54" required />
              <InputError errors={errors} name="modelo" />
            </div>
            <div className="col-12">
              <label className="form-label">Problema reportado <span aria-hidden="true">*</span></label>
              <textarea className={`form-control ${fieldError(errors, "problema_reportado") ? "is-invalid" : ""}`} rows="3" value={values.problema_reportado} onChange={(event) => onChange("problema_reportado", event.target.value)} placeholder="Describe con las palabras del cliente qué falla o qué sucedió..." required />
              <InputError errors={errors} name="problema_reportado" />
            </div>
            <div className="col-md-6">
              <label className="form-label">Diagnóstico inicial</label>
              <textarea className={`form-control ${fieldError(errors, "diagnostico") ? "is-invalid" : ""}`} rows="3" value={values.diagnostico} onChange={(event) => onChange("diagnostico", event.target.value)} placeholder="Hallazgos o posible solución (opcional)" />
              <InputError errors={errors} name="diagnostico" />
            </div>
            <div className="col-md-6">
              <label className="form-label">Estado físico y observaciones</label>
              <textarea className={`form-control ${fieldError(errors, "observacion") ? "is-invalid" : ""}`} rows="3" value={values.observacion} onChange={(event) => onChange("observacion", event.target.value)} placeholder="Rayones, golpes, accesorios recibidos, bloqueo..." />
              <InputError errors={errors} name="observacion" />
            </div>
          </div>
        </section>
      ) : null}

      {step === 2 ? (
        <section className="repair-wizard__panel" aria-labelledby="repair-step-service-title">
          <div className="repair-wizard__section-heading repair-wizard__section-heading--service">
            <div>
              <span>Plan de servicio</span>
              <h3 id="repair-step-service-title">Fechas y presupuesto</h3>
              <p>Define la programación, el valor estimado y cualquier anticipo recibido.</p>
            </div>
            {costAction}
          </div>
          <div className="row g-3">
            <div className="col-md-6">
              <label className="form-label">Fecha de ingreso <span aria-hidden="true">*</span></label>
              <div className="input-group repair-date-input"><span className="input-group-text"><CalendarMonthOutlinedIcon fontSize="small" /></span><input autoFocus className={`form-control ${fieldError(errors, "fecha_ingreso") ? "is-invalid" : ""}`} type="datetime-local" value={values.fecha_ingreso} onChange={(event) => onChange("fecha_ingreso", event.target.value)} required /></div>
              <InputError errors={errors} name="fecha_ingreso" />
            </div>
            <div className="col-md-6">
              <label className="form-label">Entrega estimada</label>
              <div className="input-group repair-date-input"><span className="input-group-text"><CalendarMonthOutlinedIcon fontSize="small" /></span><input className={`form-control ${fieldError(errors, "fecha_estimada_entrega") ? "is-invalid" : ""}`} type="date" value={values.fecha_estimada_entrega} onChange={(event) => onChange("fecha_estimada_entrega", event.target.value)} /></div>
              <InputError errors={errors} name="fecha_estimada_entrega" />
            </div>
            <div className="col-md-6">
              <label className="form-label">Costo estimado</label>
              <div className="input-group product-money-input"><span className="input-group-text">$</span><input className={`form-control text-end ${fieldError(errors, "costo_reparacion") ? "is-invalid" : ""}`} type="text" value={values.costo_reparacion} onChange={(event) => onChange("costo_reparacion", event.target.value)} onBlur={() => formatMoneyField("costo_reparacion")} inputMode="decimal" autoComplete="off" placeholder="0.00" /></div>
              <InputError errors={errors} name="costo_reparacion" />
              <small className="muted-text">Puede quedar en $0.00 si aún requiere diagnóstico.</small>
            </div>
            <div className="col-md-6">
              <label className="form-label">Anticipo recibido</label>
              <div className="input-group product-money-input"><span className="input-group-text">$</span><input className={`form-control text-end ${fieldError(errors, "anticipo") ? "is-invalid" : ""}`} type="text" value={values.anticipo} onChange={(event) => onChange("anticipo", event.target.value)} onBlur={() => formatMoneyField("anticipo")} inputMode="decimal" autoComplete="off" placeholder="0.00" /></div>
              <InputError errors={errors} name="anticipo" />
              <small className="muted-text">No puede superar el costo estimado.</small>
            </div>
          </div>

          <div className="repair-wizard__summary" aria-label="Resumen de la reparacion">
            <div><span>Cliente</span><strong>{values.cliente.nombre || "Sin nombre"}</strong></div>
            <div><span>Equipo</span><strong>{[values.marca, values.modelo].filter(Boolean).join(" ") || "Sin equipo"}</strong></div>
            <div><span>Servicio</span><strong>{values.problema_reportado || "Sin descripción"}</strong></div>
            <div><span>Total estimado</span><strong>${Number(values.costo_reparacion || 0).toFixed(2)}</strong></div>
          </div>
          <p className="repair-wizard__submit-note">Al registrar, la reparación quedará con estado <strong>Registrado</strong>.</p>
          <button type="submit" className="visually-hidden" disabled={saving}>Registrar reparación</button>
        </section>
      ) : null}
    </form>
  );
}

export default ReparacionWizardForm;
