import { useEffect, useMemo, useState } from "react";
import { createPortal } from "react-dom";
import { Printer, X } from "../../icons/phosphor";
import { printProductBarcodes } from "../../utils/productBarcodePrint";

function ProductBarcodeModal({
  isOpen,
  productos,
  onClose,
}) {
  const [quantities, setQuantities] = useState({});
  const [errorMessage, setErrorMessage] = useState("");

  useEffect(() => {
    if (!isOpen) {
      return;
    }

    setQuantities(Object.fromEntries(
      productos.map((producto) => [String(producto.id), 1]),
    ));
    setErrorMessage("");
  }, [isOpen, productos]);

  const selectedProducts = useMemo(
    () => productos.filter((producto) => Number(quantities[String(producto.id)] ?? 0) > 0),
    [productos, quantities],
  );

  const selectedLabelsCount = useMemo(
    () => selectedProducts.reduce(
      (total, producto) => total + Number(quantities[String(producto.id)] ?? 0),
      0,
    ),
    [quantities, selectedProducts],
  );

  if (!isOpen) {
    return null;
  }

  function handleQuantityChange(productId, value) {
    const digitsOnly = String(value ?? "").replace(/\D/g, "");
    const nextValue = digitsOnly ? Math.min(99, Number(digitsOnly)) : 0;

    setQuantities((current) => ({
      ...current,
      [String(productId)]: nextValue,
    }));
  }

  function handleFillAll(quantity) {
    setQuantities(Object.fromEntries(
      productos.map((producto) => [String(producto.id), quantity]),
    ));
  }

  function handlePrint() {
    try {
      printProductBarcodes(
        productos.map((producto) => ({
          ...producto,
          quantity: Number(quantities[String(producto.id)] ?? 0),
        })),
      );
      onClose();
    } catch (error) {
      setErrorMessage(error instanceof Error ? error.message : "No se pudo generar la impresion.");
    }
  }

  return createPortal(
    <div className="barcode-modal" role="dialog" aria-modal="true" aria-labelledby="barcode-modal-title">
      <div className="barcode-modal__backdrop" onClick={onClose} aria-hidden="true" />
      <div className="barcode-modal__card surface-card">
        <div className="barcode-modal__header">
          <div>
            <p className="section-kicker">Etiquetas</p>
            <h3 id="barcode-modal-title">Codigos de barra para productos</h3>
            <p className="muted-text mb-0">
              Se imprimen en formato Code 39 para poder escanearlos en el punto de venta.
            </p>
          </div>

          <button
            type="button"
            className="barcode-modal__close"
            onClick={onClose}
            aria-label="Cerrar"
          >
            <X size={18} weight="bold" aria-hidden="true" />
          </button>
        </div>

        <div className="barcode-modal__toolbar">
          <div className="barcode-modal__summary">
            <strong>{selectedProducts.length}</strong>
            <span>productos seleccionados</span>
            <strong>{selectedLabelsCount}</strong>
            <span>etiquetas a imprimir</span>
          </div>

          <div className="barcode-modal__toolbar-actions">
            <button
              type="button"
              className="btn btn-light"
              onClick={() => handleFillAll(1)}
            >
              1 por producto
            </button>
            <button
              type="button"
              className="btn btn-light"
              onClick={() => handleFillAll(0)}
            >
              Limpiar
            </button>
          </div>
        </div>

        {errorMessage ? <div className="alert alert-danger mb-0">{errorMessage}</div> : null}

        <div className="barcode-modal__table-wrap">
          <table className="table align-middle barcode-modal__table">
            <thead>
              <tr>
                <th>Producto</th>
                <th>Codigo</th>
                <th>Precio</th>
                <th>Stock</th>
                <th className="text-end">Etiquetas</th>
              </tr>
            </thead>
            <tbody>
              {productos.map((producto) => (
                <tr key={producto.id}>
                  <td>
                    <div className="product-name">{producto.nombre}</div>
                  </td>
                  <td>
                    <div className="product-code">{producto.codigo}</div>
                  </td>
                  <td>{new Intl.NumberFormat("es-SV", { style: "currency", currency: "USD" }).format(Number(producto.precio_venta ?? 0))}</td>
                  <td>{Number(producto.stock ?? 0)}</td>
                  <td className="text-end">
                    <input
                      className="form-control barcode-modal__qty-input"
                      inputMode="numeric"
                      value={String(quantities[String(producto.id)] ?? 0)}
                      onChange={(event) => handleQuantityChange(producto.id, event.target.value)}
                    />
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <div className="barcode-modal__footer">
          <button type="button" className="btn btn-light" onClick={onClose}>
            Cancelar
          </button>
          <button
            type="button"
            className="btn products-page__barcode-btn"
            onClick={handlePrint}
          >
            <Printer size={18} weight="bold" aria-hidden="true" />
            <span>Imprimir etiquetas</span>
          </button>
        </div>
      </div>
    </div>,
    document.body,
  );
}

export default ProductBarcodeModal;
