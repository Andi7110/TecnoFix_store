function formatMoney(value) {
  return new Intl.NumberFormat("es-SV", {
    style: "currency",
    currency: "USD",
  }).format(Number(value ?? 0));
}

function DashboardMetricCards({ today }) {
  const cards = [
    {
      label: "Ventas del dia",
      value: formatMoney(today.total_vendido),
      hint: "Ingreso comercial acumulado",
      tone: "accent",
    },
    {
      label: "Entradas",
      value: formatMoney(today.total_entradas),
      hint: "Flujo positivo registrado",
    },
    {
      label: "Salidas",
      value: formatMoney(today.total_salidas),
      hint: "Egreso operativo del dia",
    },
    {
      label: "Stock bajo",
      value: today.productos_stock_bajo,
      hint: "Productos que requieren atencion",
      tone: "warning",
    },
    {
      label: "Reparaciones pendientes",
      value: today.reparaciones_pendientes,
      hint: "Equipos en cola de trabajo",
    },
  ];

  return (
    <div className="dashboard-metrics-grid">
      {cards.map((card) => (
        <article key={card.label} className={`surface-card dashboard-metric-card dashboard-metric-card--${card.tone ?? "default"}`}>
          <div>
            <p className="section-kicker">{card.label}</p>
            <h3>{card.value}</h3>
          </div>
          <span className="muted-text">{card.hint}</span>
        </article>
      ))}
    </div>
  );
}

export default DashboardMetricCards;
