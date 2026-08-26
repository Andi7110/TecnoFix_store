import { useState } from "react";
import { Link } from "react-router-dom";
import { ChartBar, Package, Receipt, Wallet } from "../../icons/phosphor";
import CajaFilters from "../../components/caja/CajaFilters";
import SaldoInicialModal from "../../components/caja/SaldoInicialModal";
import CajaSummaryCards from "../../components/caja/CajaSummaryCards";
import CajaTable from "../../components/caja/CajaTable";
import ProductosPagination from "../../components/productos/ProductosPagination";
import { useProductoCatalogos } from "../../hooks/productos/useProductoCatalogos";
import { useCajaFilters } from "../../hooks/caja/useCajaFilters";
import { useCajaList } from "../../hooks/caja/useCajaList";
import { useAuth } from "../../hooks/auth/useAuth";

function CajaMovimientosPage() {
  const { user } = useAuth();
  const [isOpeningBalanceOpen, setIsOpeningBalanceOpen] = useState(false);
  const {
    filters,
    draftFilters,
    updateDraftFilter,
    applyFilters,
    clearFilters,
    changePage,
  } = useCajaFilters();
  const { modulos } = useProductoCatalogos();
  const { movimientos, meta, summary, loading, error, reload } = useCajaList(filters);
  const isAdmin = user?.is_admin || user?.role === "admin";

  return (
    <section className="products-page products-page--minimal cash-page">
      <div className="products-page__header products-page__header--minimal">
        <div>
          <p className="section-kicker">Caja</p>
          <h2>Movimientos de dinero</h2>
          <p className="muted-text">
            Consulta el dinero que entra o sale y revisa el balance de tu negocio.
          </p>
        </div>

        <div className="products-page__header-actions cash-page__header-actions">
          {isAdmin ? (
            <button
              type="button"
              className="btn btn-success cash-opening-balance-button"
              onClick={() => setIsOpeningBalanceOpen(true)}
              disabled={summary.saldo_inicial_registrado}
              title={summary.saldo_inicial_registrado ? "El saldo inicial ya fue registrado" : undefined}
            >
              <Wallet size={18} weight="bold" aria-hidden="true" />
              {summary.saldo_inicial_registrado ? "Saldo inicial registrado" : "Registrar saldo inicial"}
            </button>
          ) : null}

          <Link to="/caja/comprobantes" className="btn products-page__inventory-btn">
            <Receipt size={18} weight="bold" aria-hidden="true" />
            Comprobantes
          </Link>
          <Link to="/caja/reportes" className="btn products-page__inventory-btn">
            <ChartBar size={18} weight="bold" aria-hidden="true" />
            Reportes mensuales
          </Link>
          <Link to="/costos" className="btn products-page__create-btn cash-page__create-btn">
            <span className="products-page__create-btn-content">
              <Package size={18} weight="bold" aria-hidden="true" />
              <span>Gastos y compras</span>
            </span>
          </Link>
        </div>
      </div>

      <CajaSummaryCards summary={summary} />

      <section className="surface-card cash-history">
        <div className="cash-history__heading">
          <div>
            <p className="section-kicker">Historial de caja</p>
            <h3>Entradas y salidas</h3>
            <p className="muted-text">Consulta cuándo se movió el dinero y por qué.</p>
          </div>
          <span>{meta?.total ?? movimientos.length} movimientos</span>
        </div>

        <CajaFilters
          values={draftFilters}
          modulos={modulos}
          onChange={updateDraftFilter}
          onSubmit={applyFilters}
          onClear={clearFilters}
        />

        {error ? <div className="alert alert-danger">{error}</div> : null}

        <CajaTable movimientos={movimientos} loading={loading} />
      </section>

      <ProductosPagination meta={meta} onPageChange={changePage} />

      {isOpeningBalanceOpen ? (
        <SaldoInicialModal
          onClose={() => setIsOpeningBalanceOpen(false)}
          onCreated={reload}
        />
      ) : null}

    </section>
  );
}

export default CajaMovimientosPage;
