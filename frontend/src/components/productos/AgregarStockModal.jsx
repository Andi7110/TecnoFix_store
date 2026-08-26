import { useState } from "react";
import { useForm } from "react-hook-form";
import * as yup from "yup";
import { createMovimientoInventario, updateProducto } from "../../api/productos";
import { localDateTimeInput } from "../../utils/dateTime";
import AppModal from "../common/AppModal";

const stockSchema = yup.object({
  cantidad: yup
    .number()
    .transform((value, originalValue) => (originalValue === "" ? Number.NaN : Number(originalValue)))
    .typeError("Ingresa una cantidad mayor a cero.")
    .integer("Ingresa una cantidad entera.")
    .min(1, "Ingresa una cantidad mayor a cero.")
    .required("Ingresa una cantidad mayor a cero."),
  referencia: yup.string().trim().max(100, "La referencia no debe superar 100 caracteres."),
  observacion: yup.string().trim().max(500, "La observacion no debe superar 500 caracteres."),
});

function AgregarStockModal({ producto, onClose, onUpdated }) {
  const {
    formState: { errors, isSubmitting },
    handleSubmit,
    register,
    setError,
    setValue,
  } = useForm({
    defaultValues: {
      cantidad: "",
      referencia: "",
      observacion: "",
    },
  });
  const [errorMessage, setErrorMessage] = useState("");
  const [variantFiles, setVariantFiles] = useState([]);
  const [variantPreviews, setVariantPreviews] = useState([]);

  function fieldError(name) {
    return errors?.[name]?.message;
  }

  function applyServerErrors(validationErrors) {
    Object.entries(validationErrors ?? {}).forEach(([name, messages]) => {
      setError(name, {
        type: "server",
        message: Array.isArray(messages) ? messages[0] : messages,
      });
    });
  }

  async function submit(values) {
    setErrorMessage("");

    try {
      const validatedValues = await stockSchema.validate(values, { abortEarly: false });
      if (producto.maneja_variantes && variantFiles.length !== validatedValues.cantidad) {
        setError("cantidad", {
          type: "manual",
          message: "Agrega una foto por cada diseño comprado.",
        });
        return;
      }

      if (producto.maneja_variantes) {
        const updatedProduct = await updateProducto(producto.id, {
          fotos_variantes: variantFiles,
        });

        onUpdated?.(updatedProduct);
        onClose();
        return;
      }

      const movimiento = await createMovimientoInventario({
        producto_id: producto.id,
        tipo_movimiento: "entrada",
        cantidad: validatedValues.cantidad,
        motivo: "compra",
        referencia: validatedValues.referencia || null,
        fecha_movimiento: localDateTimeInput(),
        observacion: validatedValues.observacion || null,
      });

      onUpdated?.(movimiento);
      onClose();
    } catch (error) {
      if (error instanceof yup.ValidationError) {
        error.inner.forEach((fieldError) => {
          if (fieldError.path) {
            setError(fieldError.path, {
              type: "manual",
              message: fieldError.message,
            });
          }
        });

        return;
      }

      const validationErrors = error?.response?.data?.errors;

      if (validationErrors) {
        applyServerErrors(validationErrors);
      }

      setErrorMessage(
        error?.response?.data?.message
          || "No se pudo agregar stock al producto.",
      );
    }
  }

  function handleVariantPhotos(files) {
    const nextFiles = Array.from(files ?? []).slice(0, 30);
    setVariantFiles(nextFiles);
    setValue("cantidad", nextFiles.length || "", { shouldValidate: true });

    Promise.all(nextFiles.map((file) => new Promise((resolve) => {
      const reader = new FileReader();
      reader.onload = () => resolve(String(reader.result ?? ""));
      reader.onerror = () => resolve("");
      reader.readAsDataURL(file);
    }))).then(setVariantPreviews);
  }

  return (
    <AppModal overlayClassName="product-stock-modal" ariaLabel="Agregar stock" onClose={onClose} isDismissable={!isSubmitting}>
      <form
        className="product-stock-modal__card"
        onSubmit={handleSubmit(submit)}
      >
        <div className="product-stock-modal__header">
          <div>
            <p className="section-kicker">Reabastecer</p>
            <h3>Agregar stock</h3>
            <p className="muted-text">
              {producto?.nombre} · {producto?.codigo}
            </p>
          </div>
          <div className="product-stock-modal__current">
            <span>Stock actual</span>
            <strong>{Number(producto?.stock ?? 0)}</strong>
          </div>
        </div>

        {errorMessage ? <div className="alert alert-danger">{errorMessage}</div> : null}

        <div className="product-stock-modal__grid">
          {producto.maneja_variantes ? (
            <label className="form-label product-stock-modal__variants">
              Fotos de los nuevos diseños
              <input
                type="file"
                multiple
                accept="image/png,image/jpeg,image/jpg,image/webp"
                className="form-control"
                onChange={(event) => handleVariantPhotos(event.target.files)}
                autoFocus
              />
              <small className="muted-text">Cada foto agrega una unidad disponible.</small>
              {variantPreviews.length ? (
                <div className="product-stock-modal__previews">
                  {variantPreviews.map((preview, index) => (
                    <img key={`${preview.slice(-20)}-${index}`} src={preview} alt={`Nuevo diseño ${index + 1}`} />
                  ))}
                </div>
              ) : null}
            </label>
          ) : null}

          <label className="form-label">
            Cantidad comprada
            <input
              type="number"
              min="1"
              step="1"
              className={`form-control ${fieldError("cantidad") ? "is-invalid" : ""}`}
              {...register("cantidad")}
              autoFocus={!producto.maneja_variantes}
              readOnly={producto.maneja_variantes}
            />
            <div className="invalid-feedback">{fieldError("cantidad")}</div>
          </label>

          <label className="form-label">
            Referencia
            <input
              type="text"
              className={`form-control ${fieldError("referencia") ? "is-invalid" : ""}`}
              {...register("referencia")}
              placeholder="Factura, compra o proveedor"
              maxLength={100}
            />
            <div className="invalid-feedback">{fieldError("referencia")}</div>
          </label>
        </div>

        <label className="form-label">
          Observacion
          <textarea
            className={`form-control ${fieldError("observacion") ? "is-invalid" : ""}`}
            rows={3}
            {...register("observacion")}
            placeholder="Detalle opcional de la compra"
          />
          <div className="invalid-feedback">{fieldError("observacion")}</div>
        </label>

        <div className="product-stock-modal__actions">
          <button
            type="button"
            className="btn btn-light"
            onClick={onClose}
            disabled={isSubmitting}
          >
            Cancelar
          </button>
          <button
            type="submit"
            className="btn btn-success"
            disabled={isSubmitting}
          >
            {isSubmitting ? "Guardando..." : "Agregar stock"}
          </button>
        </div>
      </form>
    </AppModal>
  );
}

export default AgregarStockModal;
