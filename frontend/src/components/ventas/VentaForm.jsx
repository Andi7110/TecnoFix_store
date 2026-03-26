function fieldError(errors, name) {
  return errors?.[name]?.[0];
}

function formatCurrency(value) {
  return new Intl.NumberFormat("es-SV", {
    style: "currency",
    currency: "USD",
  }).format(Number(value ?? 0));
}

function VentaForm({
  values,
  modulos,
  items,
  productos,
  searchTerm,
  loadingProductos,
  saving,
  errors,
  errorMessage,
  subtotal,
  descuento,
  total,
  productosCriticos,
  onChange,
  onDiscountBlur,
  onSearchChange,
  onAddProducto,
  onRemoveItem,
  onUpdateItem,
  onFormatItemPrice,
  onSubmit,
  onCancel,
}) {
  return (
    <form className="surface-card venta-form" onSubmit={onSubmit}>
      <div className="section-heading">
        <div>
          <p className="section-kicker">Ventas</p>
          <h2>Nueva venta</h2>
          <p className="muted-text mb-0">
            Registra articulos vendidos y descuenta el inventario automaticamente.
          </p>
        </div>
      </div>

      {errorMessage ? <div className="alert alert-danger">{errorMessage}</div> : null}
      {productosCriticos.length > 0 ? (
        <div className="alert alert-warning">
          Stock critico: {productosCriticos.map((item) => item.nombre).join(", ")} solo tiene 2 articulos.
        </div>
      ) : null}

      <div className="venta-form__grid">
        <div>
          <label className="form-label">Modulo</label>
          <select
            className={`form-select ${fieldError(errors, "modulo_id") ? "is-invalid" : ""}`}
            value={values.modulo_id}
            onChange={(event) => onChange("modulo_id", event.target.value)}
          >
            <option value="">Selecciona un modulo</option>
            {modulos.map((modulo) => (
              <option key={modulo.id} value={modulo.id}>
                {modulo.nombre}
              </option>
            ))}
          </select>
          <div className="invalid-feedback">{fieldError(errors, "modulo_id")}</div>
        </div>

        <div>
          <label className="form-label">Fecha de venta</label>
          <input
            className={`form-control ${fieldError(errors, "fecha_venta") ? "is-invalid" : ""}`}
            type="datetime-local"
            value={values.fecha_venta}
            onChange={(event) => onChange("fecha_venta", event.target.value)}
          />
          <div className="invalid-feedback">{fieldError(errors, "fecha_venta")}</div>
        </div>

        <div>
          <label className="form-label">Metodo de pago</label>
          <select
            className={`form-select ${fieldError(errors, "metodo_pago") ? "is-invalid" : ""}`}
            value={values.metodo_pago}
            onChange={(event) => onChange("metodo_pago", event.target.value)}
          >
            <option value="efectivo">Efectivo</option>
            <option value="transferencia">Transferencia</option>
            <option value="tarjeta">Tarjeta</option>
            <option value="mixto">Mixto</option>
          </select>
          <div className="invalid-feedback">{fieldError(errors, "metodo_pago")}</div>
        </div>

        <div>
          <label className="form-label">Descuento</label>
          <div className="input-group product-money-input">
            <span className="input-group-text">$</span>
            <input
              className={`form-control text-end ${fieldError(errors, "descuento") ? "is-invalid" : ""}`}
              value={values.descuento}
              onChange={(event) => onChange("descuento", event.target.value)}
              onBlur={onDiscountBlur}
              placeholder="0.00"
              inputMode="decimal"
            />
          </div>
          <div className="invalid-feedback d-block">{fieldError(errors, "descuento")}</div>
        </div>
      </div>

      <div className="mb-3">
        <label className="form-label">Observacion</label>
        <textarea
          className="form-control"
          rows="3"
          value={values.observacion}
          onChange={(event) => onChange("observacion", event.target.value)}
          placeholder="Comentario opcional sobre la venta"
        />
      </div>

      <div className="venta-form__picker">
        <div className="venta-form__picker-header">
          <div>
            <p className="section-kicker">Articulos</p>
            <h3>Agregar productos</h3>
          </div>
        </div>

        <div className="venta-form__search">
          <input
            className="form-control"
            value={searchTerm}
            onChange={(event) => onSearchChange(event.target.value)}
            placeholder={values.modulo_id
              ? "Buscar por nombre o codigo"
              : "Selecciona un modulo para habilitar la busqueda"}
            disabled={!values.modulo_id}
          />
        </div>

        <div className="venta-form__catalog">
          {!values.modulo_id ? (
            <p className="empty-state">Selecciona un modulo para ver productos disponibles.</p>
          ) : null}

          {values.modulo_id && loadingProductos ? (
            <p className="empty-state">Cargando productos del modulo...</p>
          ) : null}

          {values.modulo_id && !loadingProductos && productos.length === 0 ? (
            <p className="empty-state">No hay articulos disponibles para la busqueda actual.</p>
          ) : null}

          {productos.map((producto) => (
            <button
              key={producto.id}
              type="button"
              className="venta-form__product-card"
              onClick={() => onAddProducto(producto)}
            >
              <div>
                <div className="product-name">{producto.nombre}</div>
                <div className="product-code">{producto.codigo}</div>
              </div>
              <div className="venta-form__product-meta">
                <span className="inventory-stock-badge">
                  {Number(producto.stock ?? 0)}
                </span>
                <strong>{formatCurrency(producto.precio_venta)}</strong>
              </div>
            </button>
          ))}
        </div>
      </div>

      <div className="venta-form__items">
        <div className="section-heading">
          <div>
            <p className="section-kicker">Detalle</p>
            <h3>Articulos de la venta</h3>
          </div>
        </div>

        {fieldError(errors, "items") ? (
          <div className="alert alert-danger">{fieldError(errors, "items")}</div>
        ) : null}

        {items.length === 0 ? (
          <div className="surface-card">
            <p className="empty-state">Aun no has agregado articulos a esta venta.</p>
          </div>
        ) : (
          <div className="table-responsive">
            <table className="table align-middle ventas-detail-table">
              <thead>
                <tr>
                  <th>Articulo</th>
                  <th>Stock</th>
                  <th>Cantidad</th>
                  <th>Precio</th>
                  <th>Subtotal</th>
                  <th className="text-end">Accion</th>
                </tr>
              </thead>
              <tbody>
                {items.map((item) => (
                  <tr key={item.producto_id}>
                    <td>
                      <div className="product-name">{item.nombre}</div>
                      <div className="product-code">{item.codigo}</div>
                    </td>
                    <td>
                      <span className={`inventory-stock-badge ${Number(item.stock_disponible) === 2 ? "ventas-stock-warning" : ""}`}>
                        {Number(item.stock_disponible)}
                      </span>
                    </td>
                    <td>
                      <input
                        className="form-control ventas-qty-input"
                        value={item.cantidad}
                        inputMode="numeric"
                        onChange={(event) => onUpdateItem(item.producto_id, "cantidad", event.target.value)}
                      />
                    </td>
                    <td>
                      <div className="input-group product-money-input">
                        <span className="input-group-text">$</span>
                        <input
                          className="form-control text-end"
                          value={item.precio_unitario}
                          inputMode="decimal"
                          onChange={(event) => onUpdateItem(item.producto_id, "precio_unitario", event.target.value)}
                          onBlur={() => onFormatItemPrice(item.producto_id)}
                        />
                      </div>
                    </td>
                    <td>
                      {formatCurrency(Number(item.cantidad) * Number(item.precio_unitario))}
                    </td>
                    <td className="text-end">
                      <button
                        type="button"
                        className="btn btn-sm btn-outline-danger"
                        onClick={() => onRemoveItem(item.producto_id)}
                      >
                        Quitar
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      <div className="venta-form__summary">
        <div className="venta-form__summary-card">
          <span className="muted-text">Subtotal</span>
          <strong>{formatCurrency(subtotal)}</strong>
        </div>
        <div className="venta-form__summary-card">
          <span className="muted-text">Descuento</span>
          <strong>{formatCurrency(descuento)}</strong>
        </div>
        <div className="venta-form__summary-card venta-form__summary-card--accent">
          <span className="muted-text">Total</span>
          <strong>{formatCurrency(total)}</strong>
        </div>
      </div>

      <div className="products-filter-actions">
        <button type="submit" className="btn btn-primary" disabled={saving}>
          {saving ? "Registrando..." : "Registrar venta"}
        </button>
        <button type="button" className="btn btn-light" onClick={onCancel}>
          Cancelar
        </button>
      </div>
    </form>
  );
}

export default VentaForm;
