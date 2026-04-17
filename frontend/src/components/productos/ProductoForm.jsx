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
  isEdit,
  modulos,
  categorias,
  loadingCategorias,
  codePrefix,
  codeSequence,
  fotoPreview,
  fixedStockMinimo,
  onChange,
  onFotoChange,
  onCodeSequenceChange,
  onCodeSequenceBlur,
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

  return (
    <>
      <form className={`surface-card product-form ${isEdit ? "product-form--edit" : ""}`} onSubmit={onSubmit}>
        <div className="section-heading">
          <div>
            <p className="section-kicker">Formulario</p>
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

        <div className="products-filter-grid">
          <div>
            <label className="form-label">Modulo</label>
            <select
              className={`form-select ${fieldError(errors, "modulo_id") ? "is-invalid" : ""}`}
              value={values.modulo_id}
              onChange={(event) => onChange("modulo_id", event.target.value)}
            >
              <option value="">Selecciona un modulo</option>
              {modulos.map((modulo) => (
                <option key={modulo.id} value={modulo.id}>
                  {modulo.nombre}
                </option>
              ))}
            </select>
            <div className="invalid-feedback">{fieldError(errors, "modulo_id")}</div>
          </div>

          <div>
            <label className="form-label">Categoria</label>
            <select
              className={`form-select ${fieldError(errors, "categoria_id") ? "is-invalid" : ""}`}
              value={values.categoria_id}
              onChange={(event) => onChange("categoria_id", event.target.value)}
              disabled={categoriaSelectDisabled}
            >
              <option value="">
                {!hasSelectedModulo
                  ? "Selecciona primero un modulo"
                  : loadingCategorias
                    ? "Cargando categorias..."
                    : categorias.length === 0
                      ? "No hay categorias para este modulo"
                      : "Selecciona una categoria"}
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
            <label className="form-label">Codigo</label>
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
                  placeholder="001"
                  maxLength="3"
                  autoComplete="off"
                  value={codeSequence}
                  onChange={(event) => onCodeSequenceChange(event.target.value)}
                  onBlur={onCodeSequenceBlur}
                  disabled={!codePrefix}
                />
              </div>
            )}
            <small className="muted-text d-block mt-2">
              {isEdit
                ? "Formato recomendado: MOD-CAT-001."
                : codePrefix
                  ? `Prefijo generado automaticamente: ${codePrefix}. Solo agrega el correlativo numerico.`
                  : "Selecciona primero modulo y categoria para generar el prefijo del codigo."}
            </small>
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

          <div>
            <label className="form-label">Fotografia</label>
            <input
              className={`form-control ${fieldError(errors, "foto") ? "is-invalid" : ""}`}
              type="file"
              accept="image/png,image/jpeg,image/jpg,image/webp"
              onChange={(event) => onFotoChange(event.target.files?.[0] ?? null)}
            />
            <small className="muted-text d-block mt-2">
              Formatos permitidos: JPG, PNG, WEBP. Tamano maximo: 3 MB.
            </small>
            <div className="invalid-feedback">{fieldError(errors, "foto")}</div>

            {fotoPreview ? (
              <div className="mt-3">
                <img
                  src={fotoPreview}
                  alt="Vista previa del producto"
                  style={{ maxWidth: "160px", borderRadius: "0.75rem", border: "1px solid rgba(15,20,18,0.12)" }}
                />
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
              />
              <button
                type="button"
                className="btn btn-light product-stock-input__button"
                onClick={onStockInitialIncrement}
              >
                +
              </button>
              <span className="input-group-text">unid.</span>
            </div>
            <small className="muted-text d-block mt-2">
              Cantidad disponible al momento de crear el producto.
            </small>
            <div className="invalid-feedback">{fieldError(errors, "stock_inicial")}</div>
          </div>
        ) : null}

        <div>
          <label className="form-label">Stock minimo</label>
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
          <label className="form-label">Descripcion</label>
          <textarea
            className={`form-control ${fieldError(errors, "descripcion") ? "is-invalid" : ""}`}
            rows="4"
            value={values.descripcion}
            onChange={(event) => onChange("descripcion", event.target.value)}
          />
          <div className="invalid-feedback">{fieldError(errors, "descripcion")}</div>
        </div>

        <div className="products-filter-actions">
          <button
            type="submit"
            className="btn product-form__submit"
            disabled={saving}
          >
            {saving ? "Guardando..." : isEdit ? "Actualizar producto" : "Crear producto"}
          </button>
          <button
            type="button"
            className="btn product-form__cancel"
            onClick={onCancel}
          >
            Cancelar
          </button>
        </div>
      </form>

      {validationModal ? (
        <div
          className="product-form-modal"
          role="alertdialog"
          aria-modal="true"
          aria-labelledby="product-form-modal-title"
          onClick={closeValidationModal}
        >
          <div
            className="product-form-modal__card"
            onClick={(event) => event.stopPropagation()}
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
        </div>
      ) : null}
    </>
  );
}

export default ProductoForm;
