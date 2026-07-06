import { useEffect, useMemo, useState } from "react";
import { Plus, UserGear } from "../../icons/phosphor";
import { createUsuario, getUsuarios, updateUsuario } from "../../api/usuarios";
import { ACCESS_MODULES, USER_ROLES } from "../../utils/accessControl";
import { notifyError, notifySuccess } from "../../utils/toasts";

const EMPTY_FORM = {
  name: "",
  username: "",
  email: "",
  password: "",
  role: "vendedor",
  allowed_modules: ["dashboard", "ventas"],
  is_active: true,
};

function roleLabel(value) {
  return USER_ROLES.find((role) => role.value === value)?.label ?? value;
}

function moduleLabels(modules = []) {
  if (modules.includes("usuarios")) {
    return "Todos los modulos";
  }

  return modules
    .map((module) => ACCESS_MODULES.find((item) => item.value === module)?.label ?? module)
    .join(", ");
}

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
  } : EMPTY_FORM);
  const [errors, setErrors] = useState({});
  const [saving, setSaving] = useState(false);

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
        next.allowed_modules = ["dashboard", "ventas"];
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

      return {
        ...current,
        allowed_modules: [...modules],
      };
    });
  }

  async function handleSubmit(event) {
    event.preventDefault();
    setSaving(true);
    setErrors({});

    try {
      const payload = {
        ...form,
        allowed_modules: selectedModules,
      };

      if (isEditing && !payload.password) {
        delete payload.password;
      }

      if (isEditing) {
        await updateUsuario(usuario.id, payload);
      } else {
        await createUsuario(payload);
      }

      notifySuccess(isEditing ? "Usuario actualizado correctamente." : "Usuario registrado correctamente.");
      onSaved();
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
    <div className="user-admin-modal" role="dialog" aria-modal="true" onClick={onClose}>
      <form className="user-admin-modal__card" onSubmit={handleSubmit} onClick={(event) => event.stopPropagation()}>
        <div className="user-admin-modal__header">
          <div>
            <p className="section-kicker">Usuarios</p>
            <h3>{isEditing ? "Editar usuario" : "Nuevo usuario"}</h3>
          </div>
        </div>

        {errorFor(errors, "general") ? <div className="alert alert-danger">{errorFor(errors, "general")}</div> : null}

        <div className="user-admin-form__grid">
          <label>
            <span className="form-label">Nombre</span>
            <input className={`form-control ${errorFor(errors, "name") ? "is-invalid" : ""}`} value={form.name} onChange={(event) => updateField("name", event.target.value)} />
            {errorFor(errors, "name") ? <div className="invalid-feedback">{errorFor(errors, "name")}</div> : null}
          </label>

          <label>
            <span className="form-label">Usuario</span>
            <input className={`form-control ${errorFor(errors, "username") ? "is-invalid" : ""}`} value={form.username} onChange={(event) => updateField("username", event.target.value)} />
            {errorFor(errors, "username") ? <div className="invalid-feedback">{errorFor(errors, "username")}</div> : null}
          </label>

          <label>
            <span className="form-label">Correo</span>
            <input type="email" className={`form-control ${errorFor(errors, "email") ? "is-invalid" : ""}`} value={form.email} onChange={(event) => updateField("email", event.target.value)} />
            {errorFor(errors, "email") ? <div className="invalid-feedback">{errorFor(errors, "email")}</div> : null}
          </label>

          <label>
            <span className="form-label">{isEditing ? "Nueva contrasena" : "Contrasena"}</span>
            <input type="password" className={`form-control ${errorFor(errors, "password") ? "is-invalid" : ""}`} value={form.password} onChange={(event) => updateField("password", event.target.value)} placeholder={isEditing ? "Dejar vacio para no cambiar" : ""} />
            {errorFor(errors, "password") ? <div className="invalid-feedback">{errorFor(errors, "password")}</div> : null}
          </label>

          <label>
            <span className="form-label">Rol</span>
            <select className="form-select" value={form.role} onChange={(event) => updateField("role", event.target.value)}>
              {USER_ROLES.map((role) => <option key={role.value} value={role.value}>{role.label}</option>)}
            </select>
          </label>

          <label className="user-admin-form__status">
            <span className="form-label">Estado</span>
            <span className="user-admin-switch">
              <input type="checkbox" checked={form.is_active} onChange={(event) => updateField("is_active", event.target.checked)} />
              <span>{form.is_active ? "Activo" : "Inactivo"}</span>
            </span>
          </label>
        </div>

        <section className="user-admin-modules">
          <div>
            <h4>Modulos permitidos</h4>
            <p className="muted-text">El administrador siempre conserva acceso total.</p>
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
        </section>

        <div className="user-admin-modal__actions">
          <button type="button" className="btn btn-light" onClick={onClose} disabled={saving}>Cancelar</button>
          <button type="submit" className="btn btn-success" disabled={saving}>{saving ? "Guardando..." : "Guardar"}</button>
        </div>
      </form>
    </div>
  );
}

function UsuariosPage() {
  const [usuarios, setUsuarios] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [modalUsuario, setModalUsuario] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  async function loadUsuarios() {
    setLoading(true);
    setError("");

    try {
      const response = await getUsuarios();
      setUsuarios(response.data ?? []);
    } catch (requestError) {
      const message = requestError?.response?.data?.message ?? "No se pudieron cargar los usuarios.";
      setError(message);
      notifyError(message);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadUsuarios();
  }, []);

  function openCreateModal() {
    setModalUsuario(null);
    setIsModalOpen(true);
  }

  function openEditModal(usuario) {
    setModalUsuario(usuario);
    setIsModalOpen(true);
  }

  function closeModal() {
    setIsModalOpen(false);
    setModalUsuario(null);
  }

  async function handleSaved() {
    closeModal();
    await loadUsuarios();
  }

  return (
    <section className="products-page products-page--minimal user-admin-page">
      <div className="products-page__header products-page__header--minimal">
        <div>
          <p className="section-kicker">Administracion</p>
          <h2>Usuarios y permisos</h2>
          <p className="muted-text">
            Crea usuarios y define exactamente que modulos puede ver y utilizar cada uno.
          </p>
        </div>

        <button type="button" className="btn products-page__create-btn" onClick={openCreateModal}>
          <span className="products-page__create-btn-content">
            <Plus size={18} weight="bold" aria-hidden="true" />
            <span>Nuevo usuario</span>
          </span>
        </button>
      </div>

      {error ? <div className="alert alert-danger">{error}</div> : null}

      <section className="ventas-report-table-shell ventas-report-table-shell--simple user-admin-table-shell">
        <div className="table-responsive">
          <table className="table align-middle ventas-report-table ventas-report-simple__table user-admin-table">
            <thead>
              <tr>
                <th>Usuario</th>
                <th>Rol</th>
                <th>Modulos</th>
                <th>Estado</th>
                <th className="text-end">Acciones</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr><td colSpan={5} className="text-center muted-text">Cargando usuarios...</td></tr>
              ) : usuarios.length > 0 ? usuarios.map((usuario) => (
                <tr key={usuario.id}>
                  <td>
                    <div className="product-name">{usuario.name}</div>
                    <div className="product-code">{usuario.username}{usuario.email ? ` · ${usuario.email}` : ""}</div>
                  </td>
                  <td>{roleLabel(usuario.role)}</td>
                  <td>{moduleLabels(usuario.allowed_modules ?? [])}</td>
                  <td>
                    <span className={`user-admin-status ${usuario.is_active ? "is-active" : "is-inactive"}`}>
                      {usuario.is_active ? "Activo" : "Inactivo"}
                    </span>
                  </td>
                  <td className="text-end">
                    <button type="button" className="btn btn-light btn-sm" onClick={() => openEditModal(usuario)}>
                      <UserGear size={16} weight="bold" aria-hidden="true" />
                      <span>Editar</span>
                    </button>
                  </td>
                </tr>
              )) : (
                <tr><td colSpan={5} className="text-center muted-text">No hay usuarios registrados.</td></tr>
              )}
            </tbody>
          </table>
        </div>
      </section>

      {isModalOpen ? (
        <UsuarioModal
          usuario={modalUsuario}
          onClose={closeModal}
          onSaved={handleSaved}
        />
      ) : null}
    </section>
  );
}

export default UsuariosPage;
