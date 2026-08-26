function money(value) {
  return new Intl.NumberFormat("es-SV", {
    style: "currency",
    currency: "USD",
  }).format(Number(value ?? 0));
}

function CajaSummaryCards({ summary }) {
  return (
    <div className="cash-summary-grid">
      <article className="surface-card cash-summary-card cash-summary-card--opening">
        <span className="cash-summary-card__icon cash-summary-card__icon--opening"><Wallet size={20} weight="bold" /></span>
        <p className="section-kicker">Saldo inicial</p>
        <h3>{money(summary.saldo_inicial)}</h3>
        <p className="muted-text mb-0">Base registrada al comenzar.</p>
      </article>

      <article className="surface-card cash-summary-card cash-summary-card--accent">
        <span className="cash-summary-card__icon cash-summary-card__icon--entry"><TrendUp size={20} weight="bold" /></span>
        <p className="section-kicker">Entradas</p>
        <h3>{money(summary.total_entradas)}</h3>
        <p className="muted-text mb-0">Ingresos operativos, sin saldo inicial.</p>
      </article>

      <article className="surface-card cash-summary-card">
        <span className="cash-summary-card__icon cash-summary-card__icon--exit"><TrendDown size={20} weight="bold" /></span>
        <p className="section-kicker">Salidas</p>
        <h3>{money(summary.total_salidas)}</h3>
        <p className="muted-text mb-0">Dinero pagado desde Caja.</p>
      </article>

      <article className="surface-card cash-summary-card cash-summary-card--success">
        <span className="cash-summary-card__icon cash-summary-card__icon--balance"><CurrencyDollar size={20} weight="bold" /></span>
        <p className="section-kicker">Balance disponible</p>
        <h3>{money(summary.balance)}</h3>
        <p className="muted-text mb-0">Saldo inicial más entradas, menos salidas.</p>
      </article>
    </div>
  );
}

export default CajaSummaryCards;
import { CurrencyDollar, TrendDown, TrendUp, Wallet } from "../../icons/phosphor";
