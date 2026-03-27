import { useEffect, useState } from "react";
import { CheckCircle } from "../../icons/phosphor";
import { useVentaForm } from "../../hooks/ventas/useVentaForm";
import VentaForm from "./VentaForm";

function CrearVentaModal({ modulos, onClose, onCreated }) {
  const [ventaRegistrada, setVentaRegistrada] = useState(null);
  const form = useVentaForm({
    onSuccess: (venta) => {
      setVentaRegistrada(venta);
      onCreated?.(venta);
    },
  });

  useEffect(() => {
    if (!ventaRegistrada) {
      return undefined;
    }

    const timeoutId = window.setTimeout(() => {
      onClose();
    }, 1400);

    return () => window.clearTimeout(timeoutId);
  }, [onClose, ventaRegistrada]);

  return (
    <>
      <div
        className="venta-create-modal"
        role="dialog"
        aria-modal="true"
        aria-label="Registrar nueva venta"
        onClick={onClose}
      >
        <div
          className="venta-create-modal__content"
          onClick={(event) => event.stopPropagation()}
        >
          <VentaForm
            modulos={modulos}
            values={form.values}
            items={form.items}
            productos={form.productos}
            searchTerm={form.searchTerm}
            loadingProductos={form.loadingProductos}
            saving={form.saving}
            errors={form.errors}
            errorMessage={form.errorMessage}
            subtotal={form.subtotal}
            descuento={form.descuento}
            total={form.total}
            productosCriticos={form.productosCriticos}
            onChange={form.updateField}
            onDiscountBlur={form.formatDiscount}
            onSearchChange={form.setSearchTerm}
            onAddProducto={form.addProducto}
            onRemoveItem={form.removeItem}
            onUpdateItem={form.updateItem}
            onFormatItemPrice={form.formatItemPrice}
            onSubmit={form.submit}
            onCancel={onClose}
          />
        </div>
      </div>

      {ventaRegistrada ? (
        <div className="product-success-modal" role="status" aria-live="polite">
          <div className="product-success-modal__card">
            <CheckCircle
              size={52}
              weight="fill"
              className="product-success-modal__icon"
              aria-hidden="true"
            />
            <h3>Venta registrada</h3>
            <p className="muted-text mb-0">
              La venta {ventaRegistrada.numero_venta} se guardo correctamente.
            </p>
          </div>
        </div>
      ) : null}
    </>
  );
}

export default CrearVentaModal;
