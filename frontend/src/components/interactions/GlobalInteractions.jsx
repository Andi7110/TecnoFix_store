import { useEffect, useRef, useState } from "react";
import { subscribeToGlobalLoading } from "./globalLoadingEvents";
import "./global-interactions.css";

function GlobalLoadingOverlay({ active, message }) {
  return (
    <div
      className={`tf-global-loading ${active ? "is-visible" : ""}`}
      role="status"
      aria-live="polite"
      aria-hidden={!active}
    >
      <div className="tf-global-loading__card">
        <span className="tf-global-loading__spinner" aria-hidden="true" />
        <span className="tf-global-loading__message">{message}</span>
      </div>
    </div>
  );
}

function GlobalInteractions({ children }) {
  const [loadingState, setLoadingState] = useState({
    active: false,
    message: "Cargando...",
  });
  const hideTimerRef = useRef(null);

  useEffect(() => {
    return subscribeToGlobalLoading(({ active, message }) => {
      window.clearTimeout(hideTimerRef.current);

      if (active) {
        setLoadingState({
          active: true,
          message: message || "Cargando...",
        });
        return;
      }

      hideTimerRef.current = window.setTimeout(() => {
        setLoadingState((current) => ({
          ...current,
          active: false,
        }));
      }, 160);
    });
  }, []);

  useEffect(() => {
    function handleSubmit(event) {
      event.target?.classList?.add("tf-form-submitting");

      window.setTimeout(() => {
        event.target?.classList?.remove("tf-form-submitting");
      }, 700);
    }

    document.addEventListener("submit", handleSubmit, true);

    return () => {
      document.removeEventListener("submit", handleSubmit, true);
      window.clearTimeout(hideTimerRef.current);
    };
  }, []);

  return (
    <>
      {children}
      <GlobalLoadingOverlay active={loadingState.active} message={loadingState.message} />
    </>
  );
}

export { GlobalLoadingOverlay };
export default GlobalInteractions;
