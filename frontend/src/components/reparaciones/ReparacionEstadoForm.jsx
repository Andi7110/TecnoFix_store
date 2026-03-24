import { useState } from "react";

function ReparacionEstadoForm({
  reparacion,
  saving,
  error,
  onSubmit,
}) {
  const [estado, setEstado] = useState(reparacion.estado_reparacion);
  const [comentario, setComentario] = useState("");

  function handleSubmit(event) {
    event.preventDefault();

    onSubmit({
      estado_reparacion: estado,
      comentario: comentario.trim() || null,
    });
  }

  return (
    <form className="surface-card repairs-state-form" onSubmit={handleSubmit}>
      <div className="section-heading">
        <div>
          <p className="section-kicker">Estado</p>
          <h2>Actualizar estado</h2>
        </div>
      </div>

      {error ? <div className="alert alert-danger">{error}</div> : null}

      <div className="mb-3">
        <label className="form-label">Nuevo estado</label>
        <select
          className="form-select"
          value={estado}
          onChange={(event) => setEstado(event.target.value)}
        >
          <option value="registrado">Registrado</option>
          <option value="en_proceso">En proceso</option>
          <option value="terminado">Terminado</option>
          <option value="entregado">Entregado</option>
          <option value="cancelado">Cancelado</option>
        </select>
      </div>

      <div className="mb-3">
        <label className="form-label">Comentario</label>
        <textarea
          className="form-control"
          rows="3"
          value={comentario}
          onChange={(event) => setComentario(event.target.value)}
        />
      </div>

      <button type="submit" className="btn btn-outline-dark" disabled={saving}>
        {saving ? "Actualizando..." : "Guardar estado"}
      </button>
    </form>
  );
}

export default ReparacionEstadoForm;
