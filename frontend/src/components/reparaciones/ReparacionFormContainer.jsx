import ReparacionCostosPanel from "./ReparacionCostosPanel";
import ReparacionForm from "./ReparacionForm";
import { useReparacionForm } from "../../hooks/reparaciones/useReparacionForm";

function ReparacionFormContainer({
  formId = "create-repair-form",
  onCancel,
  onSuccess,
}) {
  const form = useReparacionForm({ onSuccess });

  return (
    <>
      <div className="repair-create-layout">
        <div className="repair-create-layout__main">
          <ReparacionForm
            formId={formId}
            title="Registrar reparacion"
            onCancel={onCancel}
            onClienteChange={form.updateClienteField}
            hideActions
            {...form}
          />
        </div>

        <aside className="repair-create-layout__side">
          <ReparacionCostosPanel
            mode="create"
            values={form.values}
            onLocalAdd={form.addCosto}
            onLocalRemove={form.removeCosto}
          />
        </aside>
      </div>

      <div className="products-filter-actions repair-create-actions">
        <button
          type="submit"
          form={formId}
          className="btn products-filter-actions__apply"
          disabled={form.saving}
        >
          {form.saving ? "Guardando..." : "Registrar reparacion"}
        </button>
        <button type="button" className="btn products-filter-actions__clear" onClick={onCancel}>
          Cancelar
        </button>
      </div>
    </>
  );
}

export default ReparacionFormContainer;
