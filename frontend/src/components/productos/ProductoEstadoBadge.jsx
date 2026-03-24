function ProductoEstadoBadge({ estado }) {
  return (
    <span className={`status-pill ${estado ? "is-active" : "is-inactive"}`}>
      {estado ? "Activo" : "Inactivo"}
    </span>
  );
}

export default ProductoEstadoBadge;
