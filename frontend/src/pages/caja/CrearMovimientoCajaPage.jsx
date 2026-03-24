import { useNavigate } from "react-router-dom";
import MovimientoCajaForm from "../../components/caja/MovimientoCajaForm";
import { useCajaForm } from "../../hooks/caja/useCajaForm";

function CrearMovimientoCajaPage() {
  const navigate = useNavigate();
  const form = useCajaForm({
    onSuccess: () => navigate("/caja"),
  });

  return (
    <section>
      <MovimientoCajaForm
        onCancel={() => navigate("/caja")}
        {...form}
      />
    </section>
  );
}

export default CrearMovimientoCajaPage;
