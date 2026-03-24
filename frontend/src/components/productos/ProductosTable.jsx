import { Link } from "react-router-dom";
import { useState } from "react";
import ProductoEstadoBadge from "./ProductoEstadoBadge";

const moneyFormatter = new Intl.NumberFormat("es-SV", {
  style: "currency",
  currency: "USD",
});

function ProductosTable({
  productos,
  loading,
  pendingId,
  onToggleEstado,
}) {
  const [selectedPhoto, setSelectedPhoto] = useState(null);

  function openPhoto(producto) {
    if (!producto?.foto_url) {
      return;
    }

    setSelectedPhoto({
      url: producto.foto_url,
      name: producto.nombre ?? "Producto",
    });
  }

  function closePhoto() {
    setSelectedPhoto(null);
  }

  if (loading) {
    return (
      <div className="surface-card">
        <p className="empty-state">Cargando productos...</p>
      </div>
    );
  }

  if (productos.length === 0) {
    return (
      <div className="surface-card">
        <p className="empty-state">No hay productos que coincidan con los filtros.</p>
      </div>
    );
  }

  return (
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
              <th className="text-end">Acciones</th>
            </tr>
          </thead>
          <tbody>
            {productos.map((producto) => (
              <tr key={producto.id}>
                <td>
                  {producto.foto_url ? (
                    <button
                      type="button"
                      className="inventory-photo-button"
                      onClick={() => openPhoto(producto)}
                      title="Ver foto"
                    >
                      <img
                        src={producto.foto_url}
                        alt={producto.nombre}
                        className="inventory-photo"
                      />
                    </button>
                  ) : (
                    <span className="muted-text">Sin foto</span>
                  )}
                </td>
                <td>
                  <div className="product-name">{producto.nombre}</div>
                  <div className="product-code">{producto.codigo}</div>
                </td>
                <td>{producto.modulo?.nombre ?? "Sin modulo"}</td>
                <td>{producto.categoria?.nombre ?? "Sin categoria"}</td>
                <td>
                  <div>{moneyFormatter.format(Number(producto.precio_venta ?? 0))}</div>
                  <small className="muted-text">
                    Compra: {moneyFormatter.format(Number(producto.precio_compra ?? 0))}
                  </small>
                </td>
                <td>
                  <div>{producto.stock}</div>
                  <small
                    className={producto.stock_bajo ? "text-danger" : "muted-text"}
                  >
                    Minimo: {producto.stock_minimo}
                  </small>
                </td>
                <td>
                  <ProductoEstadoBadge estado={producto.estado} />
                </td>
                <td className="text-end">
                  <div className="products-table__actions">
                    <Link
                      to={`/productos/${producto.id}/editar`}
                      className="btn btn-sm btn-success"
                    >
                      Editar
                    </Link>
                    <button
                      type="button"
                      className={`btn btn-sm ${producto.estado ? "btn-danger" : "btn-success"}`}
                      onClick={() => onToggleEstado(producto)}
                      disabled={pendingId === producto.id}
                    >
                      {pendingId === producto.id
                        ? "Guardando..."
                        : producto.estado
                          ? "Desactivar"
                          : "Activar"}
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

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
    </div>
  );
}

export default ProductosTable;
