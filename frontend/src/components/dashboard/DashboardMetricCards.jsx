import {
  ChartLineUp,
  CurrencyDollar,
  DeviceMobileCamera,
  Package,
  Receipt,
  ShoppingCartSimple,
  TrendDown,
  TrendUp,
} from "../../icons/phosphor";

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
      badge: "Hoy",
      tone: "sales",
      icon: ShoppingCartSimple,
    },
    {
      label: "Entradas",
      value: formatMoney(today.total_entradas),
      hint: "Flujo positivo registrado",
      badge: "Flujo",
      tone: "income",
      icon: TrendUp,
    },
    {
      label: "Salidas",
      value: formatMoney(today.total_salidas),
      hint: "Egreso operativo del dia",
      badge: "Flujo",
      tone: "expense",
      icon: TrendDown,
    },
    {
      label: "Utilidad bruta",
      value: formatMoney(today.utilidad_bruta),
      hint: "Ventas menos costo de productos",
      badge: "Resultado",
      tone: "gross",
      icon: ChartLineUp,
    },
    {
      label: "Costos operativos",
      value: formatMoney(today.costos_operativos),
      hint: "Gastos registrados para operar",
      badge: "Operacion",
      tone: "costs",
      icon: Receipt,
    },
    {
      label: "Utilidad neta",
      value: formatMoney(today.utilidad_neta),
      hint: `Margen neto ${Number(today.margen_neto_porcentaje ?? 0).toFixed(2)}%`,
      badge: "Balance",
      tone: Number(today.utilidad_neta ?? 0) < 0 ? "net-negative" : "net",
      icon: CurrencyDollar,
    },
    {
      label: "Stock bajo",
      value: today.productos_stock_bajo,
      hint: "Productos que requieren atencion",
      badge: "Inventario",
      tone: "stock",
      icon: Package,
    },
    {
      label: "Reparaciones pendientes",
      value: today.reparaciones_pendientes,
      hint: "Equipos en cola de trabajo",
      badge: "Taller",
      tone: "repairs",
      icon: DeviceMobileCamera,
    },
  ];

  return (
    <section className="dashboard-metrics-board" aria-label="Indicadores del dia">
      {cards.map((card, index) => (
        <article
          key={card.label}
          className={`dashboard-metric-item dashboard-metric-item--${card.tone}`}
          style={{ "--metric-index": index }}
        >
          <div className="dashboard-metric-item__heading">
            <span className="dashboard-metric-item__icon" aria-hidden="true">
              <card.icon size={19} weight="duotone" />
            </span>
            <span className="dashboard-metric-item__label">{card.label}</span>
          </div>

          <strong className="dashboard-metric-item__value">{card.value}</strong>

          <div className="dashboard-metric-item__footer">
            <span>{card.hint}</span>
            <span className="dashboard-metric-item__badge">{card.badge}</span>
          </div>

          <span className="dashboard-metric-item__line" aria-hidden="true" />
        </article>
      ))}
    </section>
  );
}

export default DashboardMetricCards;
