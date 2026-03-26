import { Link } from "react-router-dom";

const moneyFormatter = new Intl.NumberFormat("es-SV", {
  style: "currency",
  currency: "USD",
});

function ProductosTable({
  productos,
  loading,
}) {
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
              <th className="text-end">Acciones</th>
            </tr>
          </thead>
          <tbody>
            {productos.map((producto) => (
              <tr key={producto.id}>
                <td>
                  {producto.foto_url ? (
                    <div className="inventory-photo-button inventory-photo-button--static">
                      <img
                        src={producto.foto_url}
                        alt={producto.nombre}
                        className="inventory-photo"
                      />
                    </div>
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
                    <Link
                      to={`/productos/${producto.id}/editar`}
                      className="btn btn-sm btn-success"
                    >
                      Detalle
                    </Link>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

    </div>
  );
}

export default ProductosTable;
