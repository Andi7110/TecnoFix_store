import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { ChartLine, CheckCircle, Plus } from "../../icons/phosphor";
import ProductosPagination from "../../components/productos/ProductosPagination";
import CrearReparacionModal from "../../components/reparaciones/CrearReparacionModal";
import EntregarReparacionModal from "../../components/reparaciones/EntregarReparacionModal";
import ReparacionesFilters from "../../components/reparaciones/ReparacionesFilters";
import ReparacionesTable from "../../components/reparaciones/ReparacionesTable";
import { abonarReparacion, entregarReparacion, updateEstadoReparacion } from "../../api/reparaciones";
import { useReparacionesFilters } from "../../hooks/reparaciones/useReparacionesFilters";
import { useReparacionesList } from "../../hooks/reparaciones/useReparacionesList";

function ReparacionesPage() {
  const {
    filters,
    draftFilters,
    updateDraftFilter,
    applyFilters,
    clearFilters,
    changePage,
    changePerPage,
  } = useReparacionesFilters();
  const { reparaciones, meta, loading, error, reload } = useReparacionesList(filters);
  const [statusSavingId, setStatusSavingId] = useState(null);
  const [statusError, setStatusError] = useState("");
  const [deliveryReparacion, setDeliveryReparacion] = useState(null);
  const [paymentMode, setPaymentMode] = useState("entrega");
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [successMessage, setSuccessMessage] = useState("");

  useEffect(() => {
    if (!successMessage) {
      return undefined;
    }

    const timer = window.setTimeout(() => {
      setSuccessMessage("");
    }, 3200);

    return () => window.clearTimeout(timer);
  }, [successMessage]);

  function handleReparacionCreated(reparacion) {
    reload();
    setSuccessMessage(
      reparacion?.codigo_reparacion
        ? `Registro exitoso. Reparacion ${reparacion.codigo_reparacion} creada.`
        : "Registro exitoso.",
    );
  }

  async function handleEstadoChange(reparacion, estadoReparacion) {
    if (estadoReparacion === reparacion.estado_reparacion || statusSavingId) {
      return;
    }

    if (estadoReparacion === "entregado") {
      setStatusError("");
      setPaymentMode("entrega");
      setDeliveryReparacion(reparacion);
      return;
    }

    setStatusSavingId(reparacion.id);
    setStatusError("");

    try {
      await updateEstadoReparacion(reparacion.id, {
        estado_reparacion: estadoReparacion,
        comentario: `Estado actualizado desde tabla: ${estadoReparacion}`,
      });
      reload();
    } catch {
      setStatusError("No se pudo actualizar el estado de la reparacion.");
    } finally {
      setStatusSavingId(null);
    }
  }

  async function handleDeliveryConfirm(payload) {
    if (!deliveryReparacion || statusSavingId) {
      return;
    }

    setStatusSavingId(deliveryReparacion.id);
    setStatusError("");

    try {
      if (paymentMode === "abono") {
        await abonarReparacion(deliveryReparacion.id, payload);
      } else {
        await entregarReparacion(deliveryReparacion.id, payload);
      }
      setDeliveryReparacion(null);
      reload();
    } catch (error) {
      const message = error.response?.data?.message
        ?? Object.values(error.response?.data?.errors ?? {})?.[0]?.[0]
        ?? "No se pudo entregar y cobrar la reparacion.";
      setStatusError(message);
    } finally {
      setStatusSavingId(null);
    }
  }

  return (
    <section className="products-page products-page--minimal repairs-page">
      <div className="products-page__header products-page__header--minimal">
        <div>
          <p className="section-kicker">Taller</p>
          <h2>Gestion de reparaciones</h2>
          <p className="muted-text">
            Registra ingresos, seguimiento tecnico y entrega de equipos.
          </p>
        </div>

        <div className="products-page__header-actions repairs-page__header-actions">
          <Link to="/reparaciones/reportes" className="btn products-page__inventory-btn repairs-page__reports-btn">
            <ChartLine size={18} weight="bold" aria-hidden="true" />
            <span>Reportes</span>
          </Link>
          <button
            type="button"
            className="btn products-page__create-btn repairs-page__create-btn"
            onClick={() => setIsCreateModalOpen(true)}
          >
            <span className="products-page__create-btn-content">
              <Plus size={18} weight="bold" aria-hidden="true" />
              <span>Nueva reparacion</span>
            </span>
          </button>
        </div>
      </div>

      <ReparacionesFilters
        values={draftFilters}
        onChange={updateDraftFilter}
        onSubmit={applyFilters}
        onClear={clearFilters}
      />

      {error ? <div className="alert alert-danger">{error}</div> : null}
      {statusError && !deliveryReparacion ? <div className="alert alert-danger">{statusError}</div> : null}
      {successMessage ? (
        <div className="repair-create-success" role="status" aria-live="polite">
          <CheckCircle
            size={22}
            weight="fill"
            className="repair-create-success__icon"
            aria-hidden="true"
          />
          <span>{successMessage}</span>
        </div>
      ) : null}

      <ReparacionesTable
        reparaciones={reparaciones}
        loading={loading}
        statusSavingId={statusSavingId}
        onEstadoChange={handleEstadoChange}
        onAbonoClick={(reparacion) => {
          setStatusError("");
          setPaymentMode("abono");
          setDeliveryReparacion(reparacion);
        }}
      />

      <ProductosPagination
        meta={meta}
        onPageChange={changePage}
        showWhenSinglePage
        perPage={filters.per_page}
        onPerPageChange={changePerPage}
        perPageOptions={[5, 10, 15, 20, 25]}
      />

      <EntregarReparacionModal
        reparacion={deliveryReparacion}
        saving={statusSavingId === deliveryReparacion?.id}
        error={statusError}
        title={paymentMode === "abono" ? "Abonar saldo" : "Entregar y cobrar"}
        kicker={paymentMode === "abono" ? "Abono" : "Entrega"}
        submitLabel={paymentMode === "abono" ? "Registrar abono" : "Confirmar entrega"}
        defaultComment={
          paymentMode === "abono" && deliveryReparacion
            ? `Abono registrado para ${deliveryReparacion.codigo_reparacion}.`
            : undefined
        }
        requiredPaymentMessage={
          paymentMode === "abono"
            ? "Ingresa el monto recibido para registrar el abono."
            : "Ingresa el monto recibido para registrar la entrega."
        }
        onCancel={() => {
          setDeliveryReparacion(null);
          setStatusError("");
        }}
        onConfirm={handleDeliveryConfirm}
      />

      {isCreateModalOpen ? (
        <CrearReparacionModal
          onClose={() => setIsCreateModalOpen(false)}
          onCreated={handleReparacionCreated}
        />
      ) : null}
    </section>
  );
}

export default ReparacionesPage;
