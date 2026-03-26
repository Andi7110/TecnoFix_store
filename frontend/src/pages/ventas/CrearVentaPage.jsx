import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { CheckCircle } from "../../icons/phosphor";
import VentaForm from "../../components/ventas/VentaForm";
import { useProductoCatalogos } from "../../hooks/productos/useProductoCatalogos";
import { useVentaForm } from "../../hooks/ventas/useVentaForm";

function CrearVentaPage() {
  const navigate = useNavigate();
  const [ventaRegistrada, setVentaRegistrada] = useState(null);
  const form = useVentaForm({
    onSuccess: (venta) => setVentaRegistrada(venta),
  });
  const { modulos } = useProductoCatalogos("", true);

  useEffect(() => {
    if (!ventaRegistrada) {
      return undefined;
    }

    const timeoutId = window.setTimeout(() => {
      navigate("/ventas");
    }, 1400);

    return () => window.clearTimeout(timeoutId);
  }, [navigate, ventaRegistrada]);

  return (
    <section>
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
        onCancel={() => navigate("/ventas")}
      />

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
    </section>
  );
}

export default CrearVentaPage;
