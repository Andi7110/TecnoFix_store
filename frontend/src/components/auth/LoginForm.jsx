function LoginForm({
  values,
  errors,
  message,
  submitting,
  onChange,
  onSubmit,
}) {
  return (
    <form className="surface-card auth-card" onSubmit={onSubmit}>
      <div className="auth-card__header">
        <p className="section-kicker">Acceso</p>
        <h1>Ingresar al sistema</h1>
        <p className="muted-text">
          Usa tu usuario y contrasena para entrar a TecnoFix.
        </p>
      </div>

      {message ? <div className="alert alert-danger">{message}</div> : null}

      <div className="auth-form__group">
        <label className="form-label" htmlFor="username">
          Usuario
        </label>
        <input
          id="username"
          type="text"
          className={`form-control ${errors.username ? "is-invalid" : ""}`}
          value={values.username}
          onChange={(event) => onChange("username", event.target.value)}
          autoComplete="username"
          required
        />
        {errors.username ? (
          <div className="invalid-feedback d-block">{errors.username[0]}</div>
        ) : null}
      </div>

      <div className="auth-form__group">
        <label className="form-label" htmlFor="password">
          Contrasena
        </label>
        <input
          id="password"
          type="password"
          className={`form-control ${errors.password ? "is-invalid" : ""}`}
          value={values.password}
          onChange={(event) => onChange("password", event.target.value)}
          autoComplete="current-password"
          required
        />
        {errors.password ? (
          <div className="invalid-feedback d-block">{errors.password[0]}</div>
        ) : null}
      </div>

      <label className="form-check auth-form__check">
        <input
          className="form-check-input"
          type="checkbox"
          checked={values.remember}
          onChange={(event) => onChange("remember", event.target.checked)}
        />
        <span className="form-check-label">Recordar sesion</span>
      </label>

      <button type="submit" className="btn btn-primary auth-form__submit" disabled={submitting}>
        {submitting ? "Ingresando..." : "Entrar"}
      </button>
    </form>
  );
}

export default LoginForm;
