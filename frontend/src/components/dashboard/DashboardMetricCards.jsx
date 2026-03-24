function formatMoney(value) {
  return new Intl.NumberFormat("es-SV", {
    style: "currency",
    currency: "USD",
  }).format(Number(value ?? 0));
}

function DashboardMetricCards({ today }) {
  const cards = [
    {
      label: "Total vendido hoy",
      value: formatMoney(today.total_vendido),
    },
    {
      label: "Entradas hoy",
      value: formatMoney(today.total_entradas),
    },
    {
      label: "Salidas hoy",
      value: formatMoney(today.total_salidas),
    },
    {
      label: "Productos con stock bajo",
      value: today.productos_stock_bajo,
    },
    {
      label: "Reparaciones pendientes",
      value: today.reparaciones_pendientes,
    },
  ];

  return (
    <div className="dashboard-metrics-grid">
      {cards.map((card) => (
        <article key={card.label} className="surface-card dashboard-metric-card">
          <p className="section-kicker">{card.label}</p>
          <h3>{card.value}</h3>
        </article>
      ))}
    </div>
  );
}

export default DashboardMetricCards;
