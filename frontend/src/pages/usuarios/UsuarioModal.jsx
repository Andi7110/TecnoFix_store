import { useEffect, useMemo, useState } from "react";
import { X } from "../../icons/phosphor";
import { createUsuario, updateUsuario } from "../../api/usuarios";
import { ACCESS_MODULES, USER_ROLES } from "../../utils/accessControl";
import { notifyError, notifySuccess } from "../../utils/toasts";

const EMPTY_FORM = {
  name: "",
  username: "",
  email: "",
  password: "",
  role: "vendedor",
  allowed_modules: ["dashboard", "ventas", "cuentas_cobrar"],
  is_active: true,
};

function errorFor(errors, field) {
  return errors?.[field]?.[0] ?? "";
}

function UsuarioModal({ usuario, onClose, onSaved }) {
  const isEditing = Boolean(usuario);
  const [form, setForm] = useState(() => usuario ? {
    name: usuario.name ?? "",
    username: usuario.username ?? "",
    email: usuario.email ?? "",
    password: "",
    role: usuario.role ?? "vendedor",
    allowed_modules: usuario.allowed_modules ?? [],
    is_active: Boolean(usuario.is_active),
  } : { ...EMPTY_FORM });
  const [errors, setErrors] = useState({});
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    function handleKeyDown(event) {
      if (event.key === "Escape") {
        onClose();
      }
    }

    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    window.addEventListener("keydown", handleKeyDown);

    return () => {
      document.body.style.overflow = previousOverflow;
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, [onClose]);

  const selectedModules = useMemo(
    () => form.role === "admin" ? ACCESS_MODULES.map((module) => module.value) : form.allowed_modules,
    [form.allowed_modules, form.role],
  );

  function updateField(field, value) {
    setForm((current) => {
      const next = { ...current, [field]: value };

      if (field === "role" && value === "admin") {
        next.allowed_modules = ACCESS_MODULES.map((module) => module.value);
      }

      if (field === "role" && value === "vendedor") {
        next.allowed_modules = ["dashboard", "ventas", "cuentas_cobrar"];
      }

      if (field === "role" && value === "tecnico") {
        next.allowed_modules = ["dashboard", "reparaciones"];
      }

      return next;
    });
  }

  function toggleModule(module) {
    if (form.role === "admin") {
      return;
    }

    setForm((current) => {
      const modules = new Set(current.allowed_modules);

      if (modules.has(module)) {
        modules.delete(module);
      } else {
        modules.add(module);
      }

      return { ...current, allowed_modules: [...modules] };
    });
  }

  async function handleSubmit(event) {
    event.preventDefault();
    setSaving(true);
    setErrors({});

    try {
      const payload = { ...form, allowed_modules: selectedModules };

      if (isEditing && !payload.password) {
        delete payload.password;
      }

      const savedUsuario = isEditing
        ? await updateUsuario(usuario.id, payload)
        : await createUsuario(payload);

      notifySuccess(isEditing ? "Usuario actualizado correctamente." : "Usuario registrado correctamente.");
      onSaved?.(savedUsuario);
    } catch (error) {
      if (error?.response?.status === 422) {
        setErrors(error.response.data.errors ?? {});
      } else {
        const message = error?.response?.data?.message ?? "No se pudo guardar el usuario.";
        setErrors({ general: [message] });
        notifyError(message);
      }
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="user-admin-modal" role="dialog" aria-modal="true" aria-label={isEditing ? "Editar usuario" : "Agregar nuevo usuario"} onClick={onClose}>
      <form className="user-admin-modal__card" onSubmit={handleSubmit} onClick={(event) => event.stopPropagation()}>
        <button type="button" className="user-admin-modal__close" onClick={onClose} aria-label="Cerrar registro de usuario" title="Cerrar">
          <X size={20} weight="bold" aria-hidden="true" />
        </button>

        <header className="user-admin-modal__header">
          <div>
            <p className="section-kicker">Administracion</p>
            <h3>{isEditing ? "Editar usuario" : "Agregar nuevo usuario"}</h3>
            <p>Configura sus datos de acceso, rol y permisos desde un solo lugar.</p>
          </div>
        </header>

        {errorFor(errors, "general") ? <div className="alert alert-danger">{errorFor(errors, "general")}</div> : null}

        <div className="user-admin-modal__body">
          <fieldset className="user-admin-form">
            <legend>Datos del usuario</legend>
            <div className="user-admin-form__grid">
              <label>
                <span className="form-label">Nombre completo</span>
                <input className={`form-control ${errorFor(errors, "name") ? "is-invalid" : ""}`} value={form.name} onChange={(event) => updateField("name", event.target.value)} autoFocus />
                {errorFor(errors, "name") ? <div className="invalid-feedback">{errorFor(errors, "name")}</div> : null}
              </label>

              <label>
                <span className="form-label">Usuario</span>
                <input className={`form-control ${errorFor(errors, "username") ? "is-invalid" : ""}`} value={form.username} onChange={(event) => updateField("username", event.target.value)} />
                {errorFor(errors, "username") ? <div className="invalid-feedback">{errorFor(errors, "username")}</div> : null}
              </label>

              <label>
                <span className="form-label">Correo electronico</span>
                <input type="email" className={`form-control ${errorFor(errors, "email") ? "is-invalid" : ""}`} value={form.email} onChange={(event) => updateField("email", event.target.value)} />
                {errorFor(errors, "email") ? <div className="invalid-feedback">{errorFor(errors, "email")}</div> : null}
              </label>

              <label>
                <span className="form-label">{isEditing ? "Nueva contrasena" : "Contrasena"}</span>
                <input type="password" className={`form-control ${errorFor(errors, "password") ? "is-invalid" : ""}`} value={form.password} onChange={(event) => updateField("password", event.target.value)} placeholder={isEditing ? "Dejar vacio para no cambiar" : "Minimo 8 caracteres"} />
                {errorFor(errors, "password") ? <div className="invalid-feedback">{errorFor(errors, "password")}</div> : null}
              </label>

              <label>
                <span className="form-label">Rol</span>
                <select className="form-select" value={form.role} onChange={(event) => updateField("role", event.target.value)}>
                  {USER_ROLES.map((role) => <option key={role.value} value={role.value}>{role.label}</option>)}
                </select>
              </label>

              <label className="user-admin-form__status">
                <span className="form-label">Estado de la cuenta</span>
                <span className="user-admin-switch">
                  <input type="checkbox" checked={form.is_active} onChange={(event) => updateField("is_active", event.target.checked)} />
                  <span>{form.is_active ? "Usuario activo" : "Usuario inactivo"}</span>
                </span>
              </label>
            </div>
          </fieldset>

          <section className="user-admin-modules">
            <div className="user-admin-modules__header">
              <p className="section-kicker">Accesos</p>
              <h4>Modulos permitidos</h4>
              <p>Selecciona las areas que este usuario puede consultar y utilizar.</p>
            </div>

            <div className="user-admin-modules__grid">
              {ACCESS_MODULES.map((module) => (
                <label key={module.value} className={`user-admin-module ${selectedModules.includes(module.value) ? "is-selected" : ""}`}>
                  <input
                    type="checkbox"
                    checked={selectedModules.includes(module.value)}
                    disabled={form.role === "admin" || module.value === "usuarios"}
                    onChange={() => toggleModule(module.value)}
                  />
                  <span>{module.label}</span>
                </label>
              ))}
            </div>
            <p className="user-admin-modules__note">El administrador conserva acceso completo a todos los modulos.</p>
          </section>
        </div>

        <div className="user-admin-modal__actions">
          <button type="button" className="btn btn-light" onClick={onClose} disabled={saving}>Cancelar</button>
          <button
            type="submit"
            className="btn btn-success"
            style={{ "--primary-color": "#15803d", "--hover-color": "#116b33" }}
            disabled={saving}
          >
            {saving ? "Guardando..." : isEditing ? "Guardar cambios" : "Agregar usuario"}
          </button>
        </div>
      </form>
    </div>
  );
}

export default UsuarioModal;
