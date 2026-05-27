import { useProductoCatalogos } from "../../hooks/productos/useProductoCatalogos";
import { useVentaForm } from "../../hooks/ventas/useVentaForm";
import VentaForm from "./VentaForm";

function VentaFormContainer({ onCancel, onSuccess }) {
  const form = useVentaForm({ onSuccess });
  const { modulos, categorias, loadingCategorias } = useProductoCatalogos(
    form.values.modulo_id,
    true,
  );
  const modulosPos = modulos.filter(
    (modulo) => String(modulo.nombre ?? "").trim().toLowerCase() !== "bitacora",
  );

  return (
    <VentaForm
      modulos={modulosPos}
      categorias={categorias}
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
      loadingCategorias={loadingCategorias}
      savingTransferAccount={form.savingTransferAccount}
      transferAccountsError={form.transferAccountsError}
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
      onSubmit={form.submit}
      onCancel={onCancel}
    />
  );
}

export default VentaFormContainer;
