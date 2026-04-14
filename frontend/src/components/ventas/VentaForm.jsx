import { Check, Copy, CreditCard, ShareNetwork, X } from "../../icons/phosphor";
import { useState } from "react";
import { createPortal } from "react-dom";

function fieldError(errors, name) {
  return errors?.[name]?.[0];
}

function formatCurrency(value) {
  return new Intl.NumberFormat("es-SV", {
    style: "currency",
    currency: "USD",
  }).format(Number(value ?? 0));
}

function metodoLabel(value) {
  return String(value ?? "")
    .replace(/_/g, " ")
    .replace(/\b\w/g, (char) => char.toUpperCase());
}

function formatDateTime(value) {
  if (!value) {
    return "-";
  }

  return new Intl.DateTimeFormat("es-SV", {
    dateStyle: "short",
    timeStyle: "short",
  }).format(new Date(value));
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
  montoRecibido,
  montoTransferencia,
  totalPagado,
  cambio,
  faltante,
  productosCriticos,
  productosSugeridos,
  resumenVenta,
  ticketConfig,
  transferAccounts,
  transferAccount,
  selectedTransferAccountId,
  isCreatingTransferAccount,
  loadingTransferAccounts,
  savingTransferAccount,
  transferAccountsError,
  ventasSuspendidas,
  onChange,
  onDiscountBlur,
  onSearchChange,
  onSearchSubmit,
  onAddProducto,
  onRemoveItem,
  onUpdateItem,
  onFormatItemPrice,
  onMontoRecibidoChange,
  onMontoRecibidoBlur,
  onMontoTransferenciaChange,
  onMontoTransferenciaBlur,
  onApplyQuickCash,
  onTicketConfigChange,
  onTransferAccountChange,
  onSelectTransferAccount,
  onAddTransferAccount,
  onSaveTransferAccount,
  onDeleteTransferAccount,
  onSuspendSale,
  onResumeSuspendedSale,
  onRemoveSuspendedSale,
  onSubmit,
  onCancel,
}) {
  const [isTransferModalOpen, setIsTransferModalOpen] = useState(false);
  const [transferActionMessage, setTransferActionMessage] = useState("");
  const quickAmounts = [10, 20, 50, 100];
  const moduloPorId = new Map(modulos.map((modulo) => [String(modulo.id), modulo.nombre]));
  const montoRecibidoInsuficiente = values.metodo_pago === "efectivo" && total > 0 && faltante > 0;
  const montoTransferenciaInsuficiente = values.metodo_pago === "transferencia" && total > 0 && faltante > 0;
  const pagoMixtoInsuficiente = values.metodo_pago === "mixto" && total > 0 && faltante > 0;
  const transferSummary = [
    transferAccount.bank_name ? `Banco: ${transferAccount.bank_name}` : "",
    transferAccount.account_number ? `Numero de cuenta: ${transferAccount.account_number}` : "",
    transferAccount.owner_name ? `Propietario: ${transferAccount.owner_name}` : "",
    transferAccount.owner_type ? `Tipo: ${transferAccount.owner_type}` : "",
  ].filter(Boolean).join("\n");

  function showTransferActionMessage(message) {
    setTransferActionMessage(message);

    if (typeof window !== "undefined") {
      window.setTimeout(() => {
        setTransferActionMessage((current) => (current === message ? "" : current));
      }, 2200);
    }
  }

  async function copyTransferSummary() {
    if (!transferSummary || typeof navigator === "undefined" || !navigator.clipboard?.writeText) {
      showTransferActionMessage("No se pudo copiar los datos.");
      return;
    }

    try {
      await navigator.clipboard.writeText(transferSummary);
      showTransferActionMessage("Datos copiados.");
    } catch {
      showTransferActionMessage("No se pudo copiar los datos.");
    }
  }

  async function shareTransferSummary() {
    if (!transferSummary) {
      showTransferActionMessage("Completa los datos de la cuenta para compartirlos.");
      return;
    }

    if (typeof navigator === "undefined" || !navigator.share) {
      await copyTransferSummary();
      return;
    }

    try {
      await navigator.share({
        title: "Datos de cuenta para transferencia",
        text: transferSummary,
      });
      showTransferActionMessage("Datos compartidos.");
    } catch {
      // Ignore cancelled shares.
    }
  }

  return (
    <form className="surface-card venta-form" onSubmit={onSubmit}>
      <div className="venta-pos-layout">
        <section className="venta-pos-main">
          <div className="venta-pos-hero">
            <div>
              <p className="section-kicker">Punto de venta</p>
              <h2>Caja registradora</h2>
              <p className="muted-text mb-0">
                Vende mas rapido, controla inventario al instante y deja ticket listo para imprimir.
              </p>
            </div>

            <div className="venta-pos-hero__stats">
              <div className="venta-pos-hero__stat">
                <span className="muted-text">Productos</span>
                <strong>{resumenVenta.productos_count}</strong>
              </div>
              <div className="venta-pos-hero__stat">
                <span className="muted-text">Unidades</span>
                <strong>{resumenVenta.items_count}</strong>
              </div>
              <div className="venta-pos-hero__stat">
                <span className="muted-text">Pago</span>
                <strong>{metodoLabel(values.metodo_pago)}</strong>
              </div>
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
              <div className="venta-form__payment-row">
                <select
                  className={`form-select ${fieldError(errors, "metodo_pago") ? "is-invalid" : ""}`}
                  value={values.metodo_pago}
                  onChange={(event) => onChange("metodo_pago", event.target.value)}
                >
                  <option value="efectivo">Efectivo</option>
                  <option value="transferencia">Transferencia</option>
                  <option value="mixto">Mixto</option>
                </select>
                {(values.metodo_pago === "transferencia" || values.metodo_pago === "mixto") ? (
                  <button
                    type="button"
                    className="btn venta-form__accounts-button"
                    onClick={() => setIsTransferModalOpen(true)}
                  >
                    <CreditCard size={18} weight="duotone" aria-hidden="true" />
                    <span>Ver cuentas</span>
                  </button>
                ) : null}
              </div>
              <div className="invalid-feedback">{fieldError(errors, "metodo_pago")}</div>
            </div>

            <div>
              <label className="form-label">Descuento</label>
              <div className="input-group product-money-input venta-form__money-input">
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

          <div className="venta-pos-searchbar">
            <div className="venta-pos-searchbar__input">
              <label className="form-label">Busqueda rapida</label>
              <input
                className="form-control venta-pos-searchbar__field"
                value={searchTerm}
                onChange={(event) => onSearchChange(event.target.value)}
                onKeyDown={(event) => {
                  if (event.key === "Enter") {
                    event.preventDefault();
                    onSearchSubmit();
                  }
                }}
                placeholder={values.modulo_id
                  ? "Escribe codigo o nombre y presiona Enter"
                  : "Selecciona un modulo para habilitar la caja"}
                disabled={!values.modulo_id}
              />
            </div>

            <button
              type="button"
              className="btn btn-dark venta-pos-searchbar__action"
              onClick={onSearchSubmit}
              disabled={!values.modulo_id}
            >
              Agregar rapido
            </button>
          </div>

          <div className="venta-form__picker">
            <div className="venta-form__picker-header">
              <div>
                <p className="section-kicker">Catalogo rapido</p>
                <h3>Productos sugeridos</h3>
              </div>
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
                    <span className={`inventory-stock-badge ${Number(producto.stock_bajo) ? "ventas-stock-warning" : ""}`}>
                      {Number(producto.stock ?? 0)}
                    </span>
                    <strong>{formatCurrency(producto.precio_venta)}</strong>
                  </div>
                </button>
              ))}
            </div>
          </div>

          {productosSugeridos.length > 0 ? (
            <div className="venta-pos-suggestions">
              <div className="venta-pos-suggestions__header">
                <div>
                  <p className="section-kicker">Smart upsell</p>
                  <h3>Sugerencias para esta venta</h3>
                </div>
              </div>

              <div className="venta-pos-suggestions__grid">
                {productosSugeridos.map((producto) => (
                  <button
                    key={producto.id}
                    type="button"
                    className="venta-pos-suggestion"
                    onClick={() => onAddProducto(producto)}
                  >
                    <span className="venta-pos-suggestion__badge">
                      {Number(producto.stock_bajo) ? "Stock bajo" : "Margen sugerido"}
                    </span>
                    <strong>{producto.nombre}</strong>
                    <small>{producto.codigo}</small>
                    <span>{formatCurrency(producto.precio_venta)}</span>
                  </button>
                ))}
              </div>
            </div>
          ) : null}

          {ventasSuspendidas.length > 0 ? (
            <div className="venta-pos-suspended">
              <div className="venta-pos-suggestions__header">
                <div>
                  <p className="section-kicker">Pendientes</p>
                  <h3>Ventas suspendidas</h3>
                </div>
              </div>

              <div className="venta-pos-suspended__list">
                {ventasSuspendidas.map((ventaSuspendida) => (
                  <article key={ventaSuspendida.id} className="venta-pos-suspended__item">
                    <div>
                      <strong>
                        {ventaSuspendida.values?.modulo_id
                          ? moduloPorId.get(String(ventaSuspendida.values.modulo_id))
                            ?? `Modulo #${ventaSuspendida.values.modulo_id}`
                          : "Sin modulo"}
                      </strong>
                      <small>{formatDateTime(ventaSuspendida.created_at)}</small>
                      <span>
                        {ventaSuspendida.items_count} unidades · {metodoLabel(ventaSuspendida.metodo_pago)}
                      </span>
                    </div>
                    <div className="venta-pos-suspended__actions">
                      <button
                        type="button"
                        className="btn btn-sm btn-primary"
                        onClick={() => onResumeSuspendedSale(ventaSuspendida.id)}
                      >
                        Reanudar
                      </button>
                      <button
                        type="button"
                        className="btn btn-sm btn-light"
                        onClick={() => onRemoveSuspendedSale(ventaSuspendida.id)}
                      >
                        Eliminar
                      </button>
                    </div>
                  </article>
                ))}
              </div>
            </div>
          ) : null}

          <div className="venta-form__items">
            <div className="section-heading">
              <div>
                <p className="section-kicker">Detalle</p>
                <h3>Carrito de venta</h3>
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
        </section>

        <aside className="venta-pos-sidebar">
          <div className="venta-pos-sidebar__card venta-pos-sidebar__card--accent">
            <span className="muted-text">Total a cobrar</span>
            <strong>{formatCurrency(total)}</strong>
            <small>{resumenVenta.items_count} unidades en la venta</small>
          </div>

          <div className="venta-pos-sidebar__card">
            <div className="venta-pos-sidebar__row">
              <span className="muted-text">Subtotal</span>
              <strong>{formatCurrency(subtotal)}</strong>
            </div>
            <div className="venta-pos-sidebar__row">
              <span className="muted-text">Descuento</span>
              <strong>{formatCurrency(descuento)}</strong>
            </div>
            <div className="venta-pos-sidebar__row venta-pos-sidebar__row--total">
              <span>Total</span>
              <strong>{formatCurrency(total)}</strong>
            </div>
          </div>

          <div className="venta-pos-sidebar__card">
            {values.metodo_pago === "efectivo" ? (
              <>
                <label className="form-label">Monto recibido</label>
                <div className="input-group product-money-input venta-form__money-input">
                  <span className="input-group-text">$</span>
                  <input
                    className={`form-control text-end ${fieldError(errors, "monto_recibido") ? "is-invalid" : ""}`}
                    value={montoRecibido}
                    onChange={(event) => onMontoRecibidoChange(event.target.value)}
                    onBlur={onMontoRecibidoBlur}
                    placeholder="0.00"
                    inputMode="decimal"
                  />
                </div>
                <div className="invalid-feedback d-block">{fieldError(errors, "monto_recibido")}</div>
                {montoRecibidoInsuficiente ? (
                  <p className="venta-pos-helper venta-pos-helper--danger mb-0">
                    El monto recibido debe ser igual o mayor al total de la venta.
                  </p>
                ) : null}

                <div className="venta-pos-quickcash">
                  {quickAmounts.map((amount) => (
                    <button
                      key={amount}
                      type="button"
                      className="btn btn-light btn-sm"
                      onClick={() => onApplyQuickCash(amount)}
                    >
                      {formatCurrency(amount)}
                    </button>
                  ))}
                  <button
                    type="button"
                    className="btn btn-outline-dark btn-sm"
                    onClick={() => onApplyQuickCash(total)}
                  >
                    Exacto
                  </button>
                </div>

                <div className="venta-pos-balance">
                  <div className="venta-pos-balance__item">
                    <span className="muted-text">Cambio</span>
                    <strong>{formatCurrency(cambio)}</strong>
                  </div>
                  <div className="venta-pos-balance__item">
                    <span className="muted-text">Faltante</span>
                    <strong>{formatCurrency(faltante)}</strong>
                  </div>
                </div>
              </>
            ) : null}

            {values.metodo_pago === "transferencia" ? (
              <>
                <label className="form-label">Monto transferido</label>
                <div className="input-group product-money-input venta-form__money-input">
                  <span className="input-group-text">$</span>
                  <input
                    className={`form-control text-end ${fieldError(errors, "monto_transferencia") ? "is-invalid" : ""}`}
                    value={montoTransferencia}
                    onChange={(event) => onMontoTransferenciaChange(event.target.value)}
                    onBlur={onMontoTransferenciaBlur}
                    placeholder="0.00"
                    inputMode="decimal"
                  />
                </div>
                <div className="invalid-feedback d-block">{fieldError(errors, "monto_transferencia")}</div>
                {montoTransferenciaInsuficiente ? (
                  <p className="venta-pos-helper venta-pos-helper--danger mb-0">
                    El monto transferido debe ser igual o mayor al total de la venta.
                  </p>
                ) : null}

                <div className="venta-pos-balance">
                  <div className="venta-pos-balance__item">
                    <span className="muted-text">Transferido</span>
                    <strong>{formatCurrency(totalPagado)}</strong>
                  </div>
                  <div className="venta-pos-balance__item">
                    <span className="muted-text">{faltante > 0 ? "Faltante" : "Excedente"}</span>
                    <strong>{formatCurrency(faltante > 0 ? faltante : cambio)}</strong>
                  </div>
                </div>
              </>
            ) : null}

            {values.metodo_pago === "mixto" ? (
              <>
                <label className="form-label">Monto en efectivo</label>
                <div className="input-group product-money-input venta-form__money-input">
                  <span className="input-group-text">$</span>
                  <input
                    className="form-control text-end"
                    value={montoRecibido}
                    onChange={(event) => onMontoRecibidoChange(event.target.value)}
                    onBlur={onMontoRecibidoBlur}
                    placeholder="0.00"
                    inputMode="decimal"
                  />
                </div>

                <div className="venta-pos-quickcash">
                  {quickAmounts.map((amount) => (
                    <button
                      key={amount}
                      type="button"
                      className="btn btn-light btn-sm"
                      onClick={() => onApplyQuickCash(amount)}
                    >
                      {formatCurrency(amount)}
                    </button>
                  ))}
                  <button
                    type="button"
                    className="btn btn-outline-dark btn-sm"
                    onClick={() => onApplyQuickCash(total)}
                  >
                    Exacto en efectivo
                  </button>
                </div>

                <label className="form-label">Monto por transferencia</label>
                <div className="input-group product-money-input venta-form__money-input">
                  <span className="input-group-text">$</span>
                  <input
                    className={`form-control text-end ${fieldError(errors, "pago_mixto") ? "is-invalid" : ""}`}
                    value={montoTransferencia}
                    onChange={(event) => onMontoTransferenciaChange(event.target.value)}
                    onBlur={onMontoTransferenciaBlur}
                    placeholder="0.00"
                    inputMode="decimal"
                  />
                </div>
                <div className="invalid-feedback d-block">{fieldError(errors, "pago_mixto")}</div>
                {pagoMixtoInsuficiente ? (
                  <p className="venta-pos-helper venta-pos-helper--danger mb-0">
                    La suma del efectivo y la transferencia debe ser igual o mayor al total.
                  </p>
                ) : (
                  <p className="venta-pos-helper mb-0">
                    Digita por separado lo que entregan en efectivo y lo que enviaron por transferencia.
                  </p>
                )}

                <div className="venta-pos-balance">
                  <div className="venta-pos-balance__item">
                    <span className="muted-text">Total pagado</span>
                    <strong>{formatCurrency(totalPagado)}</strong>
                  </div>
                  <div className="venta-pos-balance__item">
                    <span className="muted-text">{faltante > 0 ? "Faltante" : "Excedente"}</span>
                    <strong>{formatCurrency(faltante > 0 ? faltante : cambio)}</strong>
                  </div>
                </div>
              </>
            ) : null}
          </div>

          <div className="venta-pos-sidebar__card">
            <label className="form-label">Observacion</label>
            <textarea
              className="form-control"
              rows="4"
              value={values.observacion}
              onChange={(event) => onChange("observacion", event.target.value)}
              placeholder="Comentario opcional para ticket o control interno"
            />
          </div>

          {(values.metodo_pago === "transferencia" || values.metodo_pago === "mixto") ? (
            <div className="venta-pos-sidebar__card">
              <div>
                <p className="section-kicker">Transferencia</p>
                <h3 className="mb-0">Confirmacion del deposito</h3>
              </div>

              <button
                type="button"
                className="btn venta-form__accounts-button venta-form__accounts-button--inline"
                onClick={() => setIsTransferModalOpen(true)}
              >
                <CreditCard size={18} weight="duotone" aria-hidden="true" />
                <span>Ver cuentas para transferir</span>
              </button>

              <input
                className="form-control"
                value={values.cliente_transferente}
                onChange={(event) => onChange("cliente_transferente", event.target.value)}
                placeholder="Nombre de quien transfiere"
              />
              <input
                className="form-control"
                value={values.referencia_transferencia}
                onChange={(event) => onChange("referencia_transferencia", event.target.value)}
                placeholder="Numero de referencia o comprobante"
              />
              <textarea
                className="form-control"
                rows="3"
                value={values.nota_transferencia}
                onChange={(event) => onChange("nota_transferencia", event.target.value)}
                placeholder="Nota adicional de la transferencia"
              />
            </div>
          ) : null}

          <div className="venta-pos-sidebar__card">
            <div>
              <p className="section-kicker">Ticket</p>
              <h3 className="mb-0">Datos del negocio</h3>
            </div>
            <input
              className="form-control"
              value={ticketConfig.businessName}
              onChange={(event) => onTicketConfigChange("businessName", event.target.value)}
              placeholder="Nombre del negocio"
            />
            <input
              className="form-control"
              value={ticketConfig.businessPhone}
              onChange={(event) => onTicketConfigChange("businessPhone", event.target.value)}
              placeholder="Telefono"
            />
            <textarea
              className="form-control"
              rows="2"
              value={ticketConfig.businessAddress}
              onChange={(event) => onTicketConfigChange("businessAddress", event.target.value)}
              placeholder="Direccion"
            />
            <input
              className="form-control"
              value={ticketConfig.footerNote}
              onChange={(event) => onTicketConfigChange("footerNote", event.target.value)}
              placeholder="Mensaje final del ticket"
            />
          </div>

          <div className="venta-pos-sidebar__actions">
            <button
              type="submit"
              className="btn btn-lg venta-pos-sidebar__submit"
              disabled={saving || montoRecibidoInsuficiente || montoTransferenciaInsuficiente || pagoMixtoInsuficiente}
            >
              {saving ? "Registrando..." : "Cobrar y generar ticket"}
            </button>
            <button
              type="button"
              className="btn venta-pos-sidebar__suspend"
              onClick={onSuspendSale}
            >
              Suspender venta
            </button>
            <button type="button" className="btn btn-light" onClick={onCancel}>
              Cancelar
            </button>
          </div>
        </aside>
      </div>

      {isTransferModalOpen && typeof document !== "undefined" ? createPortal((
        <div
          className="venta-transfer-modal"
          role="dialog"
          aria-modal="true"
          aria-label="Cuentas para transferencia"
          onClick={() => setIsTransferModalOpen(false)}
        >
          <div
            className="venta-transfer-modal__card"
            onClick={(event) => event.stopPropagation()}
          >
            <div className="venta-transfer-modal__header">
              <div>
                <p className="section-kicker">Transferencia</p>
                <h3>Cuentas disponibles</h3>
                <p className="muted-text mb-0">
                  Comparte estos datos con el cliente y actualizalos cuando cambie la cuenta de cobro.
                </p>
              </div>
              <button
                type="button"
                className="btn venta-transfer-modal__close"
                onClick={() => setIsTransferModalOpen(false)}
                aria-label="Cerrar ventana de cuentas"
              >
                <X size={18} weight="bold" aria-hidden="true" />
              </button>
              <div className="venta-transfer-modal__actions">
                <button
                  type="button"
                  className="btn venta-transfer-modal__icon-button"
                  onClick={shareTransferSummary}
                  aria-label="Compartir datos de transferencia"
                  title="Compartir datos"
                >
                    <ShareNetwork size={18} weight="bold" aria-hidden="true" />
                  </button>
              </div>
            </div>

            {transferAccountsError ? (
              <div className="alert alert-danger mb-0">{transferAccountsError}</div>
            ) : null}

            {loadingTransferAccounts ? (
              <p className="muted-text mb-0">Cargando cuentas guardadas...</p>
            ) : null}

            {transferAccounts.length > 0 ? (
              <div className="venta-transfer-modal__account-list">
                {transferAccounts.map((account, index) => (
                  <button
                    key={account.id}
                    type="button"
                    className={`venta-transfer-modal__account-chip ${Number(account.id) === Number(selectedTransferAccountId) ? "is-active" : ""}`}
                    onClick={() => onSelectTransferAccount(account.id)}
                  >
                    <strong>{account.bank_name?.trim() || `Cuenta ${index + 1}`}</strong>
                    <span>{account.account_number?.trim() || "Sin numero registrado"}</span>
                  </button>
                ))}
              </div>
            ) : null}

            {isCreatingTransferAccount ? (
              <div className="venta-transfer-modal__grid">
                <div>
                  <label className="form-label">Banco</label>
                  <input
                    className="form-control"
                    value={transferAccount.bank_name ?? ""}
                    onChange={(event) => onTransferAccountChange("bank_name", event.target.value)}
                    placeholder="Banco"
                  />
                </div>

                <div>
                  <label className="form-label">Numero de cuenta</label>
                  <input
                    className="form-control"
                    value={transferAccount.account_number ?? ""}
                    onChange={(event) => onTransferAccountChange("account_number", event.target.value)}
                    placeholder="Numero de cuenta"
                  />
                </div>

                <div>
                  <label className="form-label">Nombre del propietario</label>
                  <input
                    className="form-control"
                    value={transferAccount.owner_name ?? ""}
                    onChange={(event) => onTransferAccountChange("owner_name", event.target.value)}
                    placeholder="Nombre del propietario"
                  />
                </div>

                <div>
                  <label className="form-label">Tipo de propietario</label>
                  <select
                    className="form-select"
                    value={transferAccount.owner_type ?? "Natural"}
                    onChange={(event) => onTransferAccountChange("owner_type", event.target.value)}
                  >
                    <option value="Natural">Natural</option>
                    <option value="Juridico">Juridico</option>
                  </select>
                </div>
              </div>
            ) : (
              <div className="venta-transfer-modal__grid">
                <div className="venta-transfer-modal__static-field">
                  <span className="form-label">Banco</span>
                  <strong>{transferAccount.bank_name || "-"}</strong>
                </div>

                <div className="venta-transfer-modal__static-field">
                  <span className="form-label">Numero de cuenta</span>
                  <strong>{transferAccount.account_number || "-"}</strong>
                </div>

                <div className="venta-transfer-modal__static-field">
                  <span className="form-label">Nombre del propietario</span>
                  <strong>{transferAccount.owner_name || "-"}</strong>
                </div>

                <div className="venta-transfer-modal__static-field">
                  <span className="form-label">Tipo de propietario</span>
                  <strong>{transferAccount.owner_type || "-"}</strong>
                </div>
              </div>
            )}

            <div className="venta-transfer-modal__copy-row">
              <div className="venta-transfer-modal__copy-wrap">
                <button
                  type="button"
                  className="btn venta-transfer-modal__copy-button"
                  onClick={copyTransferSummary}
                  aria-label="Copiar datos de transferencia"
                  title="Copiar datos"
                  disabled={!selectedTransferAccountId || isCreatingTransferAccount}
                >
                  <Copy size={18} weight="bold" aria-hidden="true" />
                  <span>Copiar datos</span>
                </button>
                {transferActionMessage === "Datos copiados." ? (
                  <span className="venta-transfer-modal__copy-popover">
                    <Check size={16} weight="fill" aria-hidden="true" />
                    <span>Datos copiados</span>
                  </span>
                ) : null}
              </div>
              <div className="venta-transfer-modal__footer-actions">
                <button
                  type="button"
                  className="btn venta-transfer-modal__secondary-button"
                  onClick={onAddTransferAccount}
                  disabled={savingTransferAccount}
                >
                  <span aria-hidden="true">+</span>
                  {savingTransferAccount ? "Agregando..." : "Agregar otra cuenta"}
                </button>
                <button
                  type="button"
                  className="btn venta-transfer-modal__save-button"
                  onClick={onSaveTransferAccount}
                  disabled={!isCreatingTransferAccount || savingTransferAccount}
                >
                  {savingTransferAccount ? "Guardando..." : "Guardar"}
                </button>
                <button
                  type="button"
                  className="btn venta-transfer-modal__delete-button"
                  onClick={onDeleteTransferAccount}
                  disabled={!selectedTransferAccountId || savingTransferAccount || isCreatingTransferAccount}
                >
                  Eliminar
                </button>
              </div>
            </div>

            <div className="venta-pos-transfer-note">
              Estos datos se guardan en este equipo para reutilizarlos en las siguientes ventas.
            </div>
          </div>
        </div>
      ), document.body) : null}
    </form>
  );
}

export default VentaForm;
