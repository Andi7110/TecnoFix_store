import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "./useAuth";

const initialValues = {
  username: "",
  password: "",
  remember: true,
};

export function useLoginForm(redirectTo = "/") {
  const navigate = useNavigate();
  const { login } = useAuth();
  const [values, setValues] = useState(initialValues);
  const [errors, setErrors] = useState({});
  const [message, setMessage] = useState("");
  const [successMessage, setSuccessMessage] = useState("");
  const [submitting, setSubmitting] = useState(false);

  function updateValue(name, value) {
    setValues((current) => ({
      ...current,
      [name]: value,
    }));
  }

  async function submit(event) {
    event.preventDefault();
    setSubmitting(true);
    setErrors({});
    setMessage("");
    setSuccessMessage("");

    try {
      await login(values);
      setSuccessMessage("Registro exitoso");
    } catch (error) {
      if (error?.response?.status === 422) {
        setErrors(error.response.data.errors ?? {});
        setMessage(error.response.data.message ?? "No se pudo iniciar sesion.");
      } else {
        setMessage("No se pudo iniciar sesion en este momento.");
      }
    } finally {
      setSubmitting(false);
    }
  }

  function acceptSuccess() {
    navigate(redirectTo, { replace: true });
  }

  return {
    values,
    errors,
    message,
    successMessage,
    submitting,
    updateValue,
    submit,
    acceptSuccess,
  };
}
