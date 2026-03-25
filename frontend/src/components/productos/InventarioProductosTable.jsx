import { Link } from "react-router-dom";
import { useState } from "react";
import ProductosPagination from "./ProductosPagination";

function formatCurrency(value) {
  const numeric = Number(value ?? 0);

  return new Intl.NumberFormat("es-SV", {
    style: "currency",
    currency: "USD",
  }).format(numeric);
}

function formatDate(value) {
  if (!value) {
    return "-";
  }

  return new Intl.DateTimeFormat("es-SV", {
    dateStyle: "medium",
    timeStyle: "short",
  }).format(new Date(value));
}

function normalizeText(value) {
  return String(value ?? "")
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .trim();
}

function InventarioProductosTable({
  accesoriosRegistros,
  accesoriosLoading,
  accesoriosMeta,
  onAccesoriosPageChange,
  accesoriosPerPage,
  onAccesoriosPerPageChange,
  accesoriosFilters,
  onAccesoriosFilterChange,
  onAccesoriosFiltersApply,
  onAccesoriosFiltersClear,
  libreriaRegistros,
  libreriaLoading,
  libreriaMeta,
  onLibreriaPageChange,
  libreriaPerPage,
  onLibreriaPerPageChange,
  libreriaFilters,
  onLibreriaFilterChange,
  onLibreriaFiltersApply,
  onLibreriaFiltersClear,
  deletingProductoId,
  onDelete,
}) {
  const [selectedPhoto, setSelectedPhoto] = useState(null);

  function openPhoto(registro) {
    if (!registro?.foto_url) {
      return;
    }

    setSelectedPhoto({
      url: registro.foto_url,
      name: registro.nombre ?? "Producto",
    });
  }

  function closePhoto() {
    setSelectedPhoto(null);
  }

  function resolveCategorias(items) {
    const categoriasEnTabla = new Map();

    items.forEach((registro) => {
      const id = registro?.categoria?.id;
      const nombre = registro?.categoria?.nombre;

      if (id) {
        categoriasEnTabla.set(String(id), { id: String(id), nombre: nombre ?? "Sin categoria" });
      }
    });

    return Array.from(categoriasEnTabla.values())
      .sort((a, b) => normalizeText(a.nombre).localeCompare(normalizeText(b.nombre)));
  }

  function renderRows(items, loading, emptyMessage) {
    if (loading) {
      return (
        <tr>
          <td colSpan={9} className="text-center muted-text py-4">
            Cargando inventario...
          </td>
        </tr>
      );
    }

    if (items.length === 0) {
      return (
        <tr>
          <td colSpan={9} className="text-center muted-text py-4">
            {emptyMessage}
          </td>
        </tr>
      );
    }

    return items.map((registro) => (
      <tr key={registro.id}>
        <td>
          {registro.foto_url ? (
            <button
              type="button"
              className="inventory-photo-button"
              onClick={() => openPhoto(registro)}
              title="Ver foto"
            >
              <img
                src={registro.foto_url}
                alt={registro.nombre}
                className="inventory-photo"
              />
            </button>
          ) : (
            <span className="muted-text">Sin foto</span>
          )}
        </td>
        <td>
          <div className="product-name">{registro.nombre}</div>
          <div className="product-code">{registro.codigo}</div>
        </td>
        <td>{registro.modulo?.nombre ?? "-"}</td>
        <td>{registro.categoria?.nombre ?? "-"}</td>
        <td>
          <div>{formatCurrency(registro.precio_compra)}</div>
          <small className="muted-text">
            Venta: {formatCurrency(registro.precio_venta)}
          </small>
        </td>
        <td>
          <div>Inicial: {registro.stock_inicial}</div>
          <small className="muted-text">Min: {registro.stock_minimo}</small>
        </td>
        <td>
          <span className={`status-pill ${registro.estado ? "is-active" : "is-inactive"}`}>
            {registro.estado ? "Activo" : "Inactivo"}
          </span>
        </td>
        <td>
          <div>{formatDate(registro.fecha_registro)}</div>
          <small className="muted-text">
            {registro.registrado_por_usuario?.name
              ?? registro.registrado_por_usuario?.username
              ?? "Sistema"}
          </small>
        </td>
        <td>
          <div className="products-table__actions">
            <Link
              className="btn btn-success btn-sm"
              to={`/productos/${registro.producto_id}/editar`}
            >
              Editar
            </Link>
            <button
              type="button"
              className="btn btn-danger btn-sm"
              disabled={!registro.producto_id || deletingProductoId === registro.producto_id}
              onClick={() => onDelete(registro)}
            >
              {deletingProductoId === registro.producto_id ? "Eliminando..." : "Eliminar"}
            </button>
          </div>
        </td>
      </tr>
    ));
  }

  function renderTableSection({
    sectionKey,
    title,
    items,
    loading,
    meta,
    onPageChange,
    perPage,
    onPerPageChange,
    filters,
    onFilterChange,
    onFiltersApply,
    onFiltersClear,
    emptyMessage,
  }) {
    const categorias = resolveCategorias(items);

    return (
      <section
        className={`inventory-section ${sectionKey === "libreria" ? "inventory-section--separated" : ""}`}
      >
        {sectionKey === "libreria" ? (
          <div className="inventory-section__divider" aria-hidden="true">
            <span />
          </div>
        ) : null}
        <h3 className="inventory-section__title">{title}</h3>
        <form
          className="inventory-section__filters"
          onSubmit={(event) => {
            event.preventDefault();
            onFiltersApply();
          }}
        >
          <div>
            <label className="form-label">Nombre</label>
            <input
              className="form-control"
              placeholder="Buscar por nombre"
              value={filters.nombre}
              onChange={(event) => onFilterChange("nombre", event.target.value)}
            />
          </div>
          <div>
            <label className="form-label">Codigo</label>
            <input
              className="form-control"
              placeholder="Buscar por codigo"
              value={filters.codigo}
              onChange={(event) => onFilterChange("codigo", event.target.value)}
            />
          </div>
          <div>
            <label className="form-label">Categoria</label>
            <select
              className="form-select"
              value={filters.categoria_id}
              onChange={(event) => onFilterChange("categoria_id", event.target.value)}
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
            <label className="form-label">Estado</label>
            <select
              className="form-select"
              value={filters.estado}
              onChange={(event) => onFilterChange("estado", event.target.value)}
            >
              <option value="">Todos</option>
              <option value="1">Activo</option>
              <option value="0">Inactivo</option>
            </select>
          </div>
          <div className="inventory-section__filters-action">
            <button type="submit" className="btn btn-primary">
              Aplicar
            </button>
            <button
              type="button"
              className="btn btn-light"
              onClick={onFiltersClear}
            >
              Limpiar
            </button>
          </div>
        </form>
        <div className="surface-card products-table-wrapper inventory-table-wrapper">
          <div className="table-responsive">
            <table className="table align-middle products-table inventory-table">
              <thead>
                <tr>
                  <th>Foto</th>
                  <th>Producto</th>
                  <th>Modulo</th>
                  <th>Categoria</th>
                  <th>Precios</th>
                  <th>Stock</th>
                  <th>Estado</th>
                  <th>Registrado</th>
                  <th>Acciones</th>
                </tr>
              </thead>
              <tbody>{renderRows(items, loading, emptyMessage)}</tbody>
            </table>
          </div>
        </div>
        <ProductosPagination
          meta={meta}
          onPageChange={onPageChange}
          showWhenSinglePage
          perPage={perPage}
          onPerPageChange={onPerPageChange}
        />
      </section>
    );
  }

  return (
    <>
      {renderTableSection({
        sectionKey: "accesorios",
        title: "Accesorios",
        items: accesoriosRegistros,
        loading: accesoriosLoading,
        meta: accesoriosMeta,
        onPageChange: onAccesoriosPageChange,
        perPage: accesoriosPerPage,
        onPerPageChange: onAccesoriosPerPageChange,
        filters: accesoriosFilters,
        onFilterChange: onAccesoriosFilterChange,
        onFiltersApply: onAccesoriosFiltersApply,
        onFiltersClear: onAccesoriosFiltersClear,
        emptyMessage: "No hay productos registrados en Accesorios.",
      })}
      {renderTableSection({
        sectionKey: "libreria",
        title: "Libreria",
        items: libreriaRegistros,
        loading: libreriaLoading,
        meta: libreriaMeta,
        onPageChange: onLibreriaPageChange,
        perPage: libreriaPerPage,
        onPerPageChange: onLibreriaPerPageChange,
        filters: libreriaFilters,
        onFilterChange: onLibreriaFilterChange,
        onFiltersApply: onLibreriaFiltersApply,
        onFiltersClear: onLibreriaFiltersClear,
        emptyMessage: "No hay productos registrados en Libreria.",
      })}

      {selectedPhoto ? (
        <div
          className="inventory-photo-modal"
          role="dialog"
          aria-modal="true"
          onClick={closePhoto}
        >
          <div
            className="inventory-photo-modal__content"
            onClick={(event) => event.stopPropagation()}
          >
            <button
              type="button"
              className="btn btn-light btn-sm inventory-photo-modal__close"
              onClick={closePhoto}
            >
              Cerrar
            </button>
            <img
              src={selectedPhoto.url}
              alt={selectedPhoto.name}
              className="inventory-photo-modal__image"
            />
          </div>
        </div>
      ) : null}
    </>
  );
}

export default InventarioProductosTable;
