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
      confirmButton: "btn btn-danger",
      cancelButton: "btn btn-light",
    },
    confirmButtonText,
    cancelButtonText,
  });

  return result.isConfirmed;
}
