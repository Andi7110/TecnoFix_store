import { useEffect, useState } from "react";
import { Plus, UserGear } from "../../icons/phosphor";
import { getUsuarios } from "../../api/usuarios";
import { ACCESS_MODULES, USER_ROLES } from "../../utils/accessControl";
import { notifyError } from "../../utils/toasts";
import UsuarioModal from "./UsuarioModal";

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
