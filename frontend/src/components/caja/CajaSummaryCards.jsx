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
        <span className="cash-summary-card__icon cash-summary-card__icon--entry"><TrendUp size={20} weight="bold" /></span>
        <p className="section-kicker">Entradas</p>
        <h3>{money(summary.total_entradas)}</h3>
        <p className="muted-text mb-0">Dinero recibido en el periodo.</p>
      </article>

      <article className="surface-card cash-summary-card">
        <span className="cash-summary-card__icon cash-summary-card__icon--exit"><TrendDown size={20} weight="bold" /></span>
        <p className="section-kicker">Salidas</p>
        <h3>{money(summary.total_salidas)}</h3>
        <p className="muted-text mb-0">Dinero pagado desde Caja.</p>
      </article>

      <article className="surface-card cash-summary-card cash-summary-card--success">
        <span className="cash-summary-card__icon cash-summary-card__icon--balance"><CurrencyDollar size={20} weight="bold" /></span>
        <p className="section-kicker">Balance del periodo</p>
        <h3>{money(summary.balance)}</h3>
        <p className="muted-text mb-0">Entradas menos salidas.</p>
      </article>
    </div>
  );
}

export default CajaSummaryCards;
import { CurrencyDollar, TrendDown, TrendUp } from "../../icons/phosphor";
