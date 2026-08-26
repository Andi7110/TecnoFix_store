import { useState } from "react";
import { ArrowLeft, ArrowRight, Check, DeviceMobile, User, Wrench } from "@phosphor-icons/react";
import ReparacionCostosPanel from "./ReparacionCostosPanel";
import ReparacionWizardForm from "./ReparacionWizardForm";
import { useReparacionForm } from "../../hooks/reparaciones/useReparacionForm";

const steps = [
  { title: "Cliente", description: "Datos de contacto", icon: User },
  { title: "Equipo", description: "Falla y diagnóstico", icon: DeviceMobile },
  { title: "Servicio", description: "Fechas y presupuesto", icon: Wrench },
];

const errorStep = {
  "cliente.nombre": 0, "cliente.telefono": 0, "cliente.documento": 0, "cliente.email": 0, "cliente.direccion": 0,
  marca: 1, modelo: 1, tipo_equipo: 1, problema_reportado: 1, diagnostico: 1, observacion: 1,
  fecha_ingreso: 2, fecha_estimada_entrega: 2, costo_reparacion: 2, anticipo: 2,
};

function ReparacionFormContainer({
  formId = "create-repair-form",
  onCancel,
  onSuccess,
}) {
  const [step, setStep] = useState(0);
  const [stepMessage, setStepMessage] = useState("");
  const form = useReparacionForm({
    onSuccess,
    onValidationError(validationErrors) {
      const firstError = Object.keys(validationErrors).find((name) => errorStep[name] !== undefined);
      if (firstError) setStep(errorStep[firstError]);
    },
  });

  function nextStep() {
    const messages = step === 0
      ? [
          !form.values.cliente.nombre.trim() && "Ingresa el nombre del cliente para continuar.",
          form.values.cliente.telefono && form.values.cliente.telefono.replace(/\D/g, "").length !== 8 && "El teléfono debe tener 8 números.",
          form.values.cliente.documento && form.values.cliente.documento.replace(/\D/g, "").length !== 9 && "El DUI debe tener 9 números.",
          form.values.cliente.email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.values.cliente.email) && "Ingresa un correo válido.",
        ]
      : [
          !form.values.marca.trim() && "Ingresa la marca del equipo.",
          !form.values.modelo.trim() && "Ingresa el modelo del equipo.",
          !form.values.problema_reportado.trim() && "Describe el problema reportado.",
        ];
    const message = messages.find(Boolean);
    if (message) {
      setStepMessage(message);
      return;
    }
    setStepMessage("");
    setStep((current) => Math.min(current + 1, steps.length - 1));
  }

  return (
    <>
      <div className="repair-wizard">
        <header className="repair-wizard__header">
          <div>
            <h2>Registrar reparación</h2>
            <p>Completa la recepción del equipo en tres pasos sencillos.</p>
          </div>
          <span className="repair-wizard__progress-label">Paso {step + 1} de {steps.length}</span>
        </header>

        <nav className="repair-wizard__steps" aria-label="Pasos del registro">
          {steps.map((item, index) => {
            const Icon = item.icon;
            const state = index < step ? "complete" : index === step ? "active" : "pending";
            return (
              <button key={item.title} type="button" className={`repair-wizard__step repair-wizard__step--${state}`} onClick={() => index < step && (setStepMessage(""), setStep(index))} disabled={index > step} aria-current={index === step ? "step" : undefined}>
                <span className="repair-wizard__step-icon">{index < step ? <Check size={20} weight="bold" /> : <Icon size={21} weight="duotone" />}</span>
                <span><strong>{item.title}</strong><small>{item.description}</small></span>
              </button>
            );
          })}
        </nav>

        <div className={`repair-wizard__content ${step === 2 ? "repair-wizard__content--service" : ""}`}>
          <ReparacionWizardForm
            formId={formId}
            step={step}
            costAction={step === 2 ? (
              <ReparacionCostosPanel
                mode="create"
                launcherOnly
                values={form.values}
                onLocalAdd={form.addCosto}
                onLocalRemove={form.removeCosto}
              />
            ) : null}
            {...form}
          />
        </div>

        {stepMessage ? <div className="repair-wizard__message" role="alert">{stepMessage}</div> : null}

        <footer className="repair-wizard__actions">
          <button type="button" className="btn products-filter-actions__clear" onClick={step === 0 ? onCancel : () => { setStepMessage(""); setStep((current) => current - 1); }}>
            {step === 0 ? "Cancelar" : <><ArrowLeft size={18} /> Anterior</>}
          </button>
          {step < 2 ? (
            <button type="button" className="btn products-filter-actions__apply" onClick={nextStep}>
              Continuar <ArrowRight size={18} />
            </button>
          ) : (
            <button
              type="submit"
              form={formId}
              className="btn products-filter-actions__apply"
              disabled={form.saving}
            >
              {form.saving ? "Guardando..." : <><Check size={18} weight="bold" /> Registrar reparación</>}
            </button>
          )}
        </footer>
      </div>
    </>
  );
}

export default ReparacionFormContainer;
