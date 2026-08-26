import AppModal from "../common/AppModal";

function fieldError(errors, name) {
  return errors?.[name]?.[0];
}

function ProductoForm({
  title,
  description,
  values,
  errors,
  errorMessage,
  validationModal,
  saving,
  loading,
  loadingCode,
  codeError,
  isEdit,
  modulos,
  categorias,
  loadingCategorias,
  codePrefix,
  codeSequence,
  variantPreviews,
  existingVariants,
  variantFilesCount,
  fixedStockMinimo,
  onChange,
  onVariantPhotosChange,
  onPriceChange,
  onPriceBlur,
  onStockInitialChange,
  onStockInitialIncrement,
  onStockInitialDecrement,
  onSubmit,
  onCancel,
  closeValidationModal,
}) {
  if (loading) {
    return (
      <div className="surface-card">
        <p className="empty-state">Cargando formulario...</p>
      </div>
    );
  }

  const hasSelectedModulo = Boolean(values.modulo_id);
  const categoriaSelectDisabled = !hasSelectedModulo || loadingCategorias;
  const stockControlledByPhotos = values.maneja_variantes;

  return (
    <>
      <form className={`surface-card product-form ${isEdit ? "product-form--edit" : ""}`} onSubmit={onSubmit}>
        <div className="section-heading">
          <div>
            <h2>{title}</h2>
            <p className="muted-text">{description}</p>
          </div>

          {isEdit ? (
            <div className="product-form__stock-box">
              <span className="muted-text">Stock actual</span>
              <strong>{values.stock}</strong>
            </div>
          ) : null}
        </div>

        {errorMessage ? <div className="alert alert-danger">{errorMessage}</div> : null}

        <div className="product-form__scroll-area">
          <div className="products-filter-grid">
          <div>
            <label className="form-label">Módulo</label>
            <select
              className={`form-select ${fieldError(errors, "modulo_id") ? "is-invalid" : ""}`}
              value={values.modulo_id}
              onChange={(event) => onChange("modulo_id", event.target.value)}
            >
              <option value="">Selecciona un módulo</option>
              {modulos.map((modulo) => (
                <option key={modulo.id} value={modulo.id}>
                  {modulo.nombre}
                </option>
              ))}
            </select>
            <div className="invalid-feedback">{fieldError(errors, "modulo_id")}</div>
          </div>

          <div>
            <label className="form-label">Categoría</label>
            <select
              className={`form-select ${fieldError(errors, "categoria_id") ? "is-invalid" : ""}`}
              value={values.categoria_id}
              onChange={(event) => onChange("categoria_id", event.target.value)}
              disabled={categoriaSelectDisabled}
            >
              <option value="">
                {!hasSelectedModulo
                  ? "Selecciona primero un módulo"
                  : loadingCategorias
                    ? "Cargando categorías..."
                    : categorias.length === 0
                      ? "No hay categorías para este módulo"
                      : "Selecciona una categoría"}
              </option>
              {categorias.map((categoria) => (
                <option key={categoria.id} value={categoria.id}>
                  {categoria.nombre}
                </option>
              ))}
            </select>
            <div className="invalid-feedback">{fieldError(errors, "categoria_id")}</div>
          </div>

          <div>
            <label className="form-label">Código</label>
            {isEdit ? (
              <input
                className={`form-control ${fieldError(errors, "codigo") ? "is-invalid" : ""}`}
                placeholder="ACC-CAR-001"
                autoComplete="off"
                value={values.codigo}
                onChange={(event) => onChange("codigo", event.target.value)}
              />
            ) : (
              <div className="input-group">
                <span className="input-group-text">
                  {codePrefix || "MOD-CAT"}
                </span>
                <input
                  className={`form-control ${fieldError(errors, "codigo") ? "is-invalid" : ""}`}
                  type="text"
                  inputMode="numeric"
                  placeholder={loadingCode ? "..." : "001"}
                  maxLength="3"
                  autoComplete="off"
                  value={codeSequence}
                  readOnly
                  disabled
                />
              </div>
            )}
            {(isEdit || loadingCode || codeError || values.codigo) && (
              <small className="muted-text d-block mt-2">
                {isEdit
                  ? "Formato recomendado: MOD-CAT-001."
                  : loadingCode
                    ? "Buscando el siguiente código disponible..."
                    : codeError
                      ? codeError
                      : `Código automático: ${values.codigo}. Se confirmará al guardar.`}
              </small>
            )}
            <div className="invalid-feedback">{fieldError(errors, "codigo")}</div>
          </div>

          <div>
            <label className="form-label">Nombre</label>
            <input
              className={`form-control ${fieldError(errors, "nombre") ? "is-invalid" : ""}`}
              value={values.nombre}
              onChange={(event) => onChange("nombre", event.target.value)}
            />
            <div className="invalid-feedback">{fieldError(errors, "nombre")}</div>
          </div>

          <div className="product-variants-field">
            {!isEdit ? (
              <label className="product-stock-mode">
                <input
                  className="form-check-input"
                  type="checkbox"
                  checked={values.maneja_variantes}
                  onChange={(event) => onChange("maneja_variantes", event.target.checked)}
                />
                <span>
                  <strong>Controlar cada diseño por separado</strong>
                  <small>
                    Actívalo para cases u otros productos donde cada foto representa una unidad diferente.
                  </small>
                </span>
              </label>
            ) : null}

            {existingVariants.length > 0 ? (
              <div className="product-existing-variants">
                <div className="product-existing-variants__heading">
                  <div>
                    <span className="form-label">Diseños registrados</span>
                    <small className="muted-text">Estas son las unidades disponibles actualmente.</small>
                  </div>
                  <strong>{existingVariants.length}</strong>
                </div>
                <div className="product-variants-preview" aria-label="Diseños registrados">
                  {existingVariants.map((variante, index) => (
                    <div className="product-variants-preview__item" key={variante.id}>
                      <img src={variante.foto_url} alt={variante.nombre || `Diseño ${index + 1}`} />
                      <span>{variante.nombre || `Diseño ${index + 1}`}</span>
                    </div>
                  ))}
                </div>
              </div>
            ) : null}

            <label className="form-label">
              {values.maneja_variantes
                ? isEdit ? "Agregar fotos de nuevos diseños" : "Fotos de los diseños"
                : isEdit ? "Cambiar foto del producto" : "Foto del producto"}
            </label>
            <input
              key={values.maneja_variantes ? "variant-photos" : "product-photo"}
              className={`form-control ${fieldError(errors, values.maneja_variantes ? "fotos_variantes" : "foto") ? "is-invalid" : ""}`}
              type="file"
              multiple={values.maneja_variantes}
              accept="image/png,image/jpeg,image/jpg,image/webp"
              onChange={(event) => onVariantPhotosChange(event.target.files)}
            />
            <small className="muted-text d-block mt-2">
              {values.maneja_variantes
                ? "Puedes elegir hasta 30 imágenes. Cada foto representa una unidad o diseño único."
                : "Elige una foto de referencia. Esta imagen no modifica la cantidad en inventario."}
            </small>
            <div className="invalid-feedback d-block">
              {fieldError(errors, values.maneja_variantes ? "fotos_variantes" : "foto")}
            </div>
            {variantPreviews.length > 0 ? (
              <div className="product-variants-preview" aria-label={values.maneja_variantes ? "Diseños seleccionados" : "Foto seleccionada"}>
                {variantPreviews.map((preview, index) => (
                  <div className="product-variants-preview__item" key={`${preview.slice(-24)}-${index}`}>
                    <img src={preview} alt={values.maneja_variantes ? `Diseño ${index + 1}` : "Producto"} />
                    <span>{values.maneja_variantes ? `Diseño ${index + 1}` : "Foto principal"}</span>
                  </div>
                ))}
              </div>
            ) : null}
          </div>

        <div>
          <label className="form-label">Precio compra</label>
          <div className="input-group product-money-input">
            <span className="input-group-text">$</span>
            <input
              className={`form-control text-end ${fieldError(errors, "precio_compra") ? "is-invalid" : ""}`}
              type="text"
              inputMode="decimal"
              placeholder="0.00"
              autoComplete="off"
              value={values.precio_compra}
              onChange={(event) => onPriceChange("precio_compra", event.target.value)}
              onBlur={() => onPriceBlur("precio_compra")}
            />
          </div>
          <small className="muted-text d-block mt-2">
            Ingresa el costo real de compra. Acepta coma o punto y se ajusta a 2 decimales.
          </small>
          <div className="invalid-feedback">{fieldError(errors, "precio_compra")}</div>
        </div>

        <div>
          <label className="form-label">Precio venta</label>
          <div className="input-group product-money-input">
            <span className="input-group-text">$</span>
            <input
              className={`form-control text-end ${fieldError(errors, "precio_venta") ? "is-invalid" : ""}`}
              type="text"
              inputMode="decimal"
              placeholder="0.00"
              autoComplete="off"
              value={values.precio_venta}
              onChange={(event) => onPriceChange("precio_venta", event.target.value)}
              onBlur={() => onPriceBlur("precio_venta")}
            />
          </div>
          <small className="muted-text d-block mt-2">
            Define el precio final al cliente. Debe ser igual o mayor que el precio de compra.
          </small>
          <div className="invalid-feedback">{fieldError(errors, "precio_venta")}</div>
        </div>

        {!isEdit ? (
          <div>
            <label className="form-label">Stock inicial</label>
            <div className="input-group product-stock-input">
              <button
                type="button"
                className="btn btn-light product-stock-input__button"
                onClick={onStockInitialDecrement}
                disabled={stockControlledByPhotos}
              >
                -
              </button>
              <input
                className={`form-control text-end ${fieldError(errors, "stock_inicial") ? "is-invalid" : ""}`}
                type="text"
                inputMode="numeric"
                placeholder="0"
                autoComplete="off"
                value={values.stock_inicial}
                onChange={(event) => onStockInitialChange(event.target.value)}
                readOnly={stockControlledByPhotos}
              />
              <button
                type="button"
                className="btn btn-light product-stock-input__button"
                onClick={onStockInitialIncrement}
                disabled={stockControlledByPhotos}
              >
                +
              </button>
              <span className="input-group-text">unid.</span>
            </div>
            <small className="muted-text d-block mt-2">
              {stockControlledByPhotos
                ? `Cada diseño representa una unidad. Stock calculado con las fotos: ${variantFilesCount}.`
                : "Escribe la cantidad real de unidades disponibles; no depende de la foto."}
            </small>
            <div className="invalid-feedback">{fieldError(errors, "stock_inicial")}</div>
          </div>
        ) : null}

        <div>
          <label className="form-label">Stock mínimo</label>
          <div className="input-group product-stock-input">
            <input
              className="form-control text-end"
              type="text"
              value={fixedStockMinimo}
              readOnly
              disabled
            />
            <span className="input-group-text">fijo</span>
          </div>
          <small className="muted-text d-block mt-2">
            Configurado automaticamente en {fixedStockMinimo} para todos los productos.
          </small>
          <div className="invalid-feedback">{fieldError(errors, "stock_minimo")}</div>
        </div>

        <div>
          <label className="form-label">Unidad de medida</label>
          <input
            className={`form-control ${fieldError(errors, "unidad_medida") ? "is-invalid" : ""}`}
            value={values.unidad_medida}
            onChange={(event) => onChange("unidad_medida", event.target.value)}
          />
          <div className="invalid-feedback">{fieldError(errors, "unidad_medida")}</div>
        </div>

        {!isEdit ? (
          <div className="product-form__checkbox">
            <label className="form-label d-block">Estado inicial</label>
            <div className="form-check">
              <input
                id="estado"
                className="form-check-input"
                type="checkbox"
                checked={values.estado}
                onChange={(event) => onChange("estado", event.target.checked)}
              />
              <label htmlFor="estado" className="form-check-label">
                Crear como producto activo
              </label>
            </div>
          </div>
        ) : null}
          </div>

          <div className="mb-3">
            <label className="form-label">Descripción</label>
            <textarea
              className={`form-control ${fieldError(errors, "descripcion") ? "is-invalid" : ""}`}
              rows="4"
              value={values.descripcion}
              onChange={(event) => onChange("descripcion", event.target.value)}
            />
            <div className="invalid-feedback">{fieldError(errors, "descripcion")}</div>
          </div>
        </div>

        <div className="products-filter-actions">
          <button
            type="button"
            className="btn product-form__cancel"
            onClick={onCancel}
          >
            Cancelar
          </button>
          <button
            type="submit"
            className="btn product-form__submit"
            style={{ "--primary-color": "#15803d", "--hover-color": "#116b33" }}
            disabled={saving}
          >
            {saving ? "Guardando..." : isEdit ? "Actualizar producto" : "Crear producto"}
          </button>
        </div>
      </form>

      {validationModal ? (
        <AppModal overlayClassName="product-form-modal" ariaLabelledby="product-form-modal-title" role="alertdialog" onClose={closeValidationModal}>
          <div
            className="product-form-modal__card"
          >
            <h3 id="product-form-modal-title">{validationModal.title}</h3>
            <p className="muted-text">{validationModal.message}</p>
            <div className="product-form-modal__actions">
              <button
                type="button"
                className="btn btn-success"
                onClick={closeValidationModal}
              >
                Entendido
              </button>
            </div>
          </div>
        </AppModal>
      ) : null}
    </>
  );
}

export default ProductoForm;
