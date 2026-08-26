import Swal from "sweetalert2";

export async function confirmDanger({
  title,
  text,
  confirmButtonText = "Aceptar",
  cancelButtonText = "Cancelar",
}) {
  const result = await Swal.fire({
    icon: "warning",
    title,
    text,
    showCancelButton: true,
    reverseButtons: true,
    focusCancel: true,
    buttonsStyling: false,
    customClass: {
      actions: "tf-alert-actions",
      confirmButton: "btn btn-danger tf-alert-confirm-danger",
      cancelButton: "btn btn-light tf-alert-cancel",
    },
    confirmButtonText,
    cancelButtonText,
  });

  return result.isConfirmed;
}
