import { Package } from "@phosphor-icons/react";
import { Dialog, Modal, ModalOverlay } from "react-aria-components";
import { useState } from "react";

const moneyFormatter = new Intl.NumberFormat("es-SV", {
  style: "currency",
  currency: "USD",
});

function ProductoDetalleModal({ producto, onClose }) {
  const [selectedImage, setSelectedImage] = useState(null);
  const stock = Number(producto?.stock ?? 0);
  const minimumStock = Number(producto?.stock_minimo ?? 0);
  const stockTone = stock <= 0 ? "is-empty" : stock <= minimumStock ? "is-low" : "is-available";

  return (
    <>
      <ModalOverlay
        isOpen
        isDismissable={!selectedImage}
        className="global-product-modal"
        onOpenChange={(isOpen) => !isOpen && onClose()}
      >
        <Modal className="global-product-modal__card">
        <Dialog className="global-product-modal__dialog" aria-labelledby="global-product-modal-title">
          {() => (
            <>
              <header className="global-product-modal__header">
          <div>
            <p className="section-kicker">Detalle del producto</p>
            <h2 id="global-product-modal-title">{producto.nombre}</h2>
            <p>{producto.codigo || "Sin codigo asignado"}</p>
          </div>
        </header>

        <div className="global-product-modal__body">
          <div className={`global-product-modal__visual ${producto.variantes?.length ? "is-gallery" : ""}`}>
            {producto.variantes?.length ? (
              <div className="global-product-modal__gallery">
                {producto.variantes.map((variante) => (
                  <figure key={variante.id}>
                    <button
                      type="button"
                      className="global-product-modal__gallery-button"
                      onClick={() => setSelectedImage({
                        url: variante.foto_url,
                        name: variante.nombre,
                      })}
                      aria-label={`Ver ${variante.nombre} en grande`}
                    >
                      <img src={variante.foto_url} alt={`${producto.nombre} - ${variante.nombre}`} />
                      <figcaption>{variante.nombre}</figcaption>
                    </button>
                  </figure>
                ))}
              </div>
            ) : producto.foto_url ? (
              <img src={producto.foto_url} alt={producto.nombre} />
            ) : (
              <div className="global-product-modal__placeholder" aria-hidden="true">
                <Package size={48} weight="duotone" />
                <small>Sin fotografia</small>
              </div>
            )}
          </div>

          <div className="global-product-modal__content">
            <div className="global-product-modal__price-row">
              <div>
                <span>Precio de venta</span>
                <strong>{moneyFormatter.format(Number(producto.precio_venta ?? 0))}</strong>
              </div>
              <span className={`global-product-modal__stock ${stockTone}`}>
                {stock > 0
                  ? producto.maneja_variantes
                    ? `${producto.variantes_disponibles_count} diseños disponibles`
                    : `${stock} ${producto.unidad_medida || "unidades"}`
                  : "Agotado"}
              </span>
            </div>

            <dl className="global-product-modal__details">
              <div>
                <dt>Categoria</dt>
                <dd>{producto.categoria?.nombre ?? "Sin categoria"}</dd>
              </div>
              <div>
                <dt>Modulo</dt>
                <dd>{producto.modulo?.nombre ?? "Sin modulo"}</dd>
              </div>
              <div>
                <dt>Precio de compra</dt>
                <dd>{moneyFormatter.format(Number(producto.precio_compra ?? 0))}</dd>
              </div>
              <div>
                <dt>Stock minimo</dt>
                <dd>{minimumStock}</dd>
              </div>
              <div>
                <dt>Estado</dt>
                <dd>{producto.estado ? "Activo" : "Inactivo"}</dd>
              </div>
              <div>
                <dt>Codigo</dt>
                <dd>{producto.codigo || "Sin codigo"}</dd>
              </div>
            </dl>

            <section className="global-product-modal__description">
              <span>Descripcion</span>
              <p>{producto.descripcion || "Este producto no tiene una descripcion registrada."}</p>
            </section>
          </div>
              </div>
            </>
          )}
        </Dialog>
        </Modal>
      </ModalOverlay>

      {selectedImage ? (
        <ModalOverlay
          isOpen
          isDismissable
          className="global-product-image-viewer"
          onOpenChange={(isOpen) => !isOpen && setSelectedImage(null)}
        >
          <Modal className="global-product-image-viewer__card">
            <Dialog
              className="global-product-image-viewer__dialog"
              aria-label={`${producto.nombre} - ${selectedImage.name}`}
            >
              {() => (
                <>
                  <img
                    src={selectedImage.url}
                    alt={`${producto.nombre} - ${selectedImage.name}`}
                  />
                  <p>{selectedImage.name}</p>
                </>
              )}
            </Dialog>
          </Modal>
        </ModalOverlay>
      ) : null}
    </>
  );
}

export default ProductoDetalleModal;
