import { useNavigate, useParams } from "react-router-dom";
import ProductoForm from "../../components/productos/ProductoForm";
import { useProductoForm } from "../../hooks/productos/useProductoForm";

function EditarProductoPage() {
  const navigate = useNavigate();
  const { productoId } = useParams();
  const form = useProductoForm({
    productoId,
    onSuccess: () => navigate("/productos"),
  });

  return (
    <section>
      <ProductoForm
        title="Editar producto"
        description="Actualiza datos comerciales y operativos del producto sin mezclar logica de inventario."
        onCancel={() => navigate("/productos")}
        {...form}
      />
    </section>
  );
}

export default EditarProductoPage;
