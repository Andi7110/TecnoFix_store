const labels = {
  registrado: "Registrado",
  en_proceso: "En proceso",
  terminado: "Terminado",
  entregado: "Entregado",
  cancelado: "Cancelado",
};

function ReparacionEstadoBadge({ estado }) {
  return (
    <span className={`repair-status repair-status--${estado}`}>
      {labels[estado] ?? estado}
    </span>
  );
}

export default ReparacionEstadoBadge;
