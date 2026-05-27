import { useNavigate, useParams } from "react-router-dom";
import { useState } from "react";
import ReparacionForm from "../../components/reparaciones/ReparacionForm";
import ReparacionCostosPanel from "../../components/reparaciones/ReparacionCostosPanel";
import ReparacionHistorial from "../../components/reparaciones/ReparacionHistorial";
import { useReparacionForm } from "../../hooks/reparaciones/useReparacionForm";

function EditarReparacionPage() {
  const navigate = useNavigate();
  const { reparacionId } = useParams();
  const [allowDeliveredEdit, setAllowDeliveredEdit] = useState(false);
  const form = useReparacionForm({
    reparacionId,
    onSuccess: () => navigate("/reparaciones"),
  });
  const isDelivered = form.values.estado_reparacion === "entregado";
  const isReadOnlyDelivered = isDelivered && !allowDeliveredEdit;

  return (
    <section className={`repairs-edit-layout ${isReadOnlyDelivered ? "repairs-edit-layout--readonly" : ""}`}>
      <div>
        <ReparacionForm
          title={isReadOnlyDelivered ? "Detalle de reparacion" : "Editar reparacion"}
          onCancel={() => navigate("/reparaciones")}
          onClienteChange={form.updateClienteField}
          readOnly={isReadOnlyDelivered}
          onEdit={() => setAllowDeliveredEdit(true)}
          {...form}
        />
      </div>

      <div className="d-flex flex-column gap-3">
        <ReparacionCostosPanel reparacionId={reparacionId} values={form.values} onCreated={form.reload} />
        <ReparacionHistorial historiales={form.values.historiales ?? []} />
      </div>
    </section>
  );
}

export default EditarReparacionPage;
