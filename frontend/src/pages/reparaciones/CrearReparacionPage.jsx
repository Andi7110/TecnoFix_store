import { useNavigate } from "react-router-dom";
import ReparacionForm from "../../components/reparaciones/ReparacionForm";
import { useReparacionForm } from "../../hooks/reparaciones/useReparacionForm";

function CrearReparacionPage() {
  const navigate = useNavigate();
  const form = useReparacionForm({
    onSuccess: () => navigate("/reparaciones"),
  });

  return (
    <section>
      <ReparacionForm
        title="Registrar reparacion"
        onCancel={() => navigate("/reparaciones")}
        onClienteChange={form.updateClienteField}
        {...form}
      />
    </section>
  );
}

export default CrearReparacionPage;
