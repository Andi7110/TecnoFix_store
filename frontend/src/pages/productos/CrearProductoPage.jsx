import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { CheckCircle } from "../../icons/phosphor";
import ProductoForm from "../../components/productos/ProductoForm";
import { useProductoForm } from "../../hooks/productos/useProductoForm";

function CrearProductoPage() {
  const navigate = useNavigate();
  const [showSuccessModal, setShowSuccessModal] = useState(false);

  const form = useProductoForm({
    onSuccess: () => setShowSuccessModal(true),
  });

  useEffect(() => {
    if (!showSuccessModal) {
      return undefined;
    }

    const timeoutId = window.setTimeout(() => {
      navigate("/productos");
    }, 1400);

    return () => window.clearTimeout(timeoutId);
  }, [navigate, showSuccessModal]);

  return (
    <section>
      <ProductoForm
        title="Crear producto"
        description="Registra un producto nuevo y, si aplica, deja configurado su stock inicial."
        onCancel={() => navigate("/productos")}
        {...form}
      />

      {showSuccessModal ? (
        <div className="product-success-modal" role="status" aria-live="polite">
          <div className="product-success-modal__card">
            <CheckCircle
              size={52}
              weight="fill"
              className="product-success-modal__icon"
              aria-hidden="true"
            />
            <h3>Registro con exito</h3>
            <p className="muted-text mb-0">
              El producto fue creado correctamente.
            </p>
          </div>
        </div>
      ) : null}
    </section>
  );
}

export default CrearProductoPage;
