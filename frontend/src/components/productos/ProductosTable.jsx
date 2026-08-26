import { useState } from "react";
import { MagnifyingGlassPlus, WarningCircle } from "../../icons/phosphor";
import AppModal from "../common/AppModal";

const moneyFormatter = new Intl.NumberFormat("es-SV", {
  style: "currency",
  currency: "USD",
});

function ProductsTableSkeleton() {
  return (
    <div className="surface-card products-table-wrapper inventory-table-wrapper products-table-wrapper--loading">
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
              <th className="text-end">Acciones</th>
            </tr>
          </thead>
          <tbody>
            {Array.from({ length: 4 }).map((_, index) => (
              <tr key={index}>
                <td><span className="products-loading-cell products-loading-cell--photo" /></td>
                <td>
                  <span className="products-loading-cell products-loading-cell--title" />
                  <span className="products-loading-cell products-loading-cell--small" />
                </td>
                <td><span className="products-loading-cell products-loading-cell--medium" /></td>
                <td><span className="products-loading-cell products-loading-cell--medium" /></td>
                <td>
                  <span className="products-loading-cell products-loading-cell--medium" />
                  <span className="products-loading-cell products-loading-cell--small" />
                </td>
                <td><span className="products-loading-cell products-loading-cell--badge" /></td>
                <td className="text-end"><span className="products-loading-cell products-loading-cell--button" /></td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

function ProductosTable({
  productos,
  loading,
  onDetalleClick,
  onAgregarStockClick,
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
    return <ProductsTableSkeleton />;
  }

  return (
    <>
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
                <th className="text-end">Acciones</th>
              </tr>
            </thead>
            <tbody>
              {productos.length === 0 ? (
                <tr>
                  <td colSpan={7} className="empty-state text-center">
                    No hay productos que coincidan con los filtros.
                  </td>
                </tr>
              ) : productos.map((producto) => (
                <tr key={producto.id}>
                  <td>
                    {producto.foto_url ? (
                      <button
                        type="button"
                        className="inventory-photo-button"
                        onClick={() => openPhoto(producto)}
                        title="Ver foto"
                        aria-label={`Ver foto de ${producto.nombre}`}
                      >
                        <img
                          src={producto.foto_url}
                          alt={producto.nombre}
                          className="inventory-photo"
                        />
                        <span className="inventory-photo-button__hint" aria-hidden="true">
                          <MagnifyingGlassPlus size={14} weight="bold" />
                        </span>
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
                    <div>
                      <span className="inventory-stock-badge">
                        {Number(producto.stock ?? 0)}
                      </span>
                    </div>
                  </td>
                  <td className="text-end">
                    <div className="products-table__actions">
                      {onAgregarStockClick ? (
                        <button
                          type="button"
                          className="btn btn-sm products-table__stock-button"
                          onClick={() => onAgregarStockClick(producto)}
                        >
                          Agregar stock
                        </button>
                      ) : null}
                      <button
                        type="button"
                        className="table-detail-icon-btn"
                        onClick={() => onDetalleClick?.(producto)}
                        title="Ver detalle"
                        aria-label={`Ver detalle de ${producto.nombre}`}
                      >
                        <WarningCircle size={18} weight="bold" aria-hidden="true" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {selectedPhoto ? (
        <AppModal overlayClassName="inventory-photo-modal" ariaLabel={`Fotografia de ${selectedPhoto.name}`} onClose={closePhoto}>
          <div
            className="inventory-photo-modal__content"
          >
            <img
              src={selectedPhoto.url}
              alt={selectedPhoto.name}
              className="inventory-photo-modal__image"
            />
          </div>
        </AppModal>
      ) : null}
    </>
  );
}

export default ProductosTable;
