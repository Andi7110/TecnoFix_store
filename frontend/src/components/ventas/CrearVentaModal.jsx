import { useState } from "react";
import { CheckCircle } from "../../icons/phosphor";
import { useVentaForm } from "../../hooks/ventas/useVentaForm";
import { printSaleTicket } from "../../utils/saleTicketPrint";
import VentaForm from "./VentaForm";

function CrearVentaModal({ modulos, onClose, onCreated }) {
  const [ventaRegistrada, setVentaRegistrada] = useState(null);
  const [ticketConfig, setTicketConfig] = useState(null);
  const form = useVentaForm({
    onSuccess: (venta, nextTicketConfig) => {
      setVentaRegistrada(venta);
      setTicketConfig(nextTicketConfig);
      onCreated?.(venta);
    },
  });

  return (
    <>
      <div
        className="venta-create-modal"
        role="dialog"
        aria-modal="true"
        aria-label="Registrar nueva venta"
        onClick={onClose}
      >
        <div
          className="venta-create-modal__content"
          onClick={(event) => event.stopPropagation()}
        >
          <VentaForm
            modulos={modulos}
            values={form.values}
            items={form.items}
            productos={form.productos}
            searchTerm={form.searchTerm}
            loadingProductos={form.loadingProductos}
            saving={form.saving}
            errors={form.errors}
            errorMessage={form.errorMessage}
            subtotal={form.subtotal}
            descuento={form.descuento}
            total={form.total}
            montoRecibido={form.montoRecibido}
            montoTransferencia={form.montoTransferencia}
            totalPagado={form.totalPagado}
            cambio={form.cambio}
            faltante={form.faltante}
            productosCriticos={form.productosCriticos}
            productosSugeridos={form.productosSugeridos}
            resumenVenta={form.resumenVenta}
            ticketConfig={form.ticketConfig}
            transferAccounts={form.transferAccounts}
            transferAccount={form.transferAccount}
            selectedTransferAccountId={form.selectedTransferAccountId}
            isCreatingTransferAccount={form.isCreatingTransferAccount}
            loadingTransferAccounts={form.loadingTransferAccounts}
            savingTransferAccount={form.savingTransferAccount}
            transferAccountsError={form.transferAccountsError}
            ventasSuspendidas={form.ventasSuspendidas}
            onChange={form.updateField}
            onDiscountBlur={form.formatDiscount}
            onSearchChange={form.setSearchTerm}
            onSearchSubmit={form.addProductoBySearch}
            onAddProducto={form.addProducto}
            onRemoveItem={form.removeItem}
            onUpdateItem={form.updateItem}
            onFormatItemPrice={form.formatItemPrice}
            onMontoRecibidoChange={form.updateMontoRecibido}
            onMontoRecibidoBlur={form.formatMontoRecibido}
            onMontoTransferenciaChange={form.updateMontoTransferencia}
            onMontoTransferenciaBlur={form.formatMontoTransferencia}
            onApplyQuickCash={form.applyQuickCash}
            onTicketConfigChange={form.updateTicketField}
            onTransferAccountChange={form.updateTransferAccountField}
            onSelectTransferAccount={form.selectTransferAccount}
            onAddTransferAccount={form.addTransferAccount}
            onSaveTransferAccount={form.saveSelectedTransferAccount}
            onDeleteTransferAccount={form.deleteSelectedTransferAccount}
            onSuspendSale={form.suspendCurrentSale}
            onResumeSuspendedSale={form.resumeSuspendedSale}
            onRemoveSuspendedSale={form.removeSuspendedSale}
            onSubmit={form.submit}
            onCancel={onClose}
          />
        </div>
      </div>

      {ventaRegistrada ? (
        <div className="product-success-modal" role="status" aria-live="polite">
          <div className="product-success-modal__card">
            <CheckCircle
              size={52}
              weight="fill"
              className="product-success-modal__icon"
              aria-hidden="true"
            />
            <h3>Venta registrada</h3>
            <p className="muted-text mb-0">
              La venta {ventaRegistrada.numero_venta} se guardo correctamente.
            </p>
            <div className="venta-success-actions">
              <button
                type="button"
                className="btn btn-primary"
                onClick={() => printSaleTicket(ventaRegistrada, ticketConfig)}
              >
                Imprimir ticket
              </button>
              <button type="button" className="btn btn-light" onClick={onClose}>
                Cerrar
              </button>
            </div>
          </div>
        </div>
      ) : null}
    </>
  );
}

export default CrearVentaModal;
