function formatMoney(value) {
  return new Intl.NumberFormat("es-SV", {
    style: "currency",
    currency: "USD",
  }).format(Number(value ?? 0));
}

function DashboardDaySummary({ resumen, generatedAt }) {
  return (
    <div className="surface-card">
      <div className="section-heading">
        <div>
          <p className="section-kicker">Resumen del dia</p>
          <h2>Operacion consolidada</h2>
        </div>
      </div>

      <div className="dashboard-day-summary">
        <div>
          <span className="muted-text">Fecha</span>
          <strong>{resumen.fecha || "-"}</strong>
        </div>
        <div>
          <span className="muted-text">Balance de caja</span>
          <strong>{formatMoney(resumen.balance_caja)}</strong>
        </div>
        <div>
          <span className="muted-text">Modulos con ventas</span>
          <strong>{resumen.modulos_con_ventas}</strong>
        </div>
        <div>
          <span className="muted-text">Ultima actualizacion</span>
          <strong>
            {generatedAt ? new Date(generatedAt).toLocaleString() : "-"}
          </strong>
        </div>
      </div>
    </div>
  );
}

export default DashboardDaySummary;
