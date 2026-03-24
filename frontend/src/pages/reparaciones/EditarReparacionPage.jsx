import { useNavigate, useParams } from "react-router-dom";
import ReparacionEstadoForm from "../../components/reparaciones/ReparacionEstadoForm";
import ReparacionForm from "../../components/reparaciones/ReparacionForm";
import ReparacionHistorial from "../../components/reparaciones/ReparacionHistorial";
import { useReparacionEstado } from "../../hooks/reparaciones/useReparacionEstado";
import { useReparacionForm } from "../../hooks/reparaciones/useReparacionForm";

function EditarReparacionPage() {
  const navigate = useNavigate();
  const { reparacionId } = useParams();
  const form = useReparacionForm({
    reparacionId,
    onSuccess: () => navigate("/reparaciones"),
  });
  const status = useReparacionEstado({
    onSuccess: () => navigate(0),
  });

  return (
    <section className="repairs-edit-layout">
      <div>
        <ReparacionForm
          title="Editar reparacion"
          onCancel={() => navigate("/reparaciones")}
          onClienteChange={form.updateClienteField}
          {...form}
        />
      </div>

      <div className="d-flex flex-column gap-3">
        <ReparacionEstadoForm
          key={`${reparacionId}-${form.values.estado_reparacion}`}
          reparacion={form.values}
          saving={status.saving}
          error={status.error}
          onSubmit={(payload) => status.submitEstado(reparacionId, payload)}
        />
        <ReparacionHistorial historiales={form.values.historiales ?? []} />
      </div>
    </section>
  );
}

export default EditarReparacionPage;
