import { useNavigate } from "react-router-dom";
import ProductoForm from "../../components/productos/ProductoForm";
import { useProductoForm } from "../../hooks/productos/useProductoForm";

function CrearProductoPage() {
  const navigate = useNavigate();
  const form = useProductoForm({
    onSuccess: () => navigate("/productos"),
  });

  return (
    <section>
      <ProductoForm
        title="Crear producto"
        description="Registra un producto nuevo y, si aplica, deja configurado su stock inicial."
        onCancel={() => navigate("/productos")}
        {...form}
      />
    </section>
  );
}

export default CrearProductoPage;
