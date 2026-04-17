function money(value) {
  return new Intl.NumberFormat("es-SV", {
    style: "currency",
    currency: "USD",
  }).format(Number(value ?? 0));
}

function CajaSummaryCards({ summary }) {
  return (
    <div className="cash-summary-grid">
      <article className="surface-card cash-summary-card cash-summary-card--accent">
        <p className="section-kicker">Entradas</p>
        <h3>{money(summary.total_entradas)}</h3>
        <p className="muted-text mb-0">Ingresos registrados en el periodo filtrado.</p>
      </article>

      <article className="surface-card cash-summary-card">
        <p className="section-kicker">Salidas</p>
        <h3>{money(summary.total_salidas)}</h3>
        <p className="muted-text mb-0">Egresos operativos y movimientos de salida.</p>
      </article>

      <article className="surface-card cash-summary-card cash-summary-card--success">
        <p className="section-kicker">Balance</p>
        <h3>{money(summary.balance)}</h3>
        <p className="muted-text mb-0">Resultado neto entre entradas y salidas.</p>
      </article>
    </div>
  );
}

export default CajaSummaryCards;
