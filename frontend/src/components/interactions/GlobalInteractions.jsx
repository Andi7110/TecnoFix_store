import { useEffect, useRef, useState } from "react";
import { subscribeToGlobalLoading } from "./globalLoadingEvents";
import "./global-interactions.css";

const ghostBlocks = [
  "top0",
  "top1",
  "top2",
  "top3",
  "top4",
  "st0",
  "st1",
  "st2",
  "st3",
  "st4",
  "st5",
  "an1",
  "an2",
  "an3",
  "an4",
  "an5",
  "an6",
  "an7",
  "an8",
  "an9",
  "an10",
  "an11",
  "an12",
  "an13",
  "an14",
  "an15",
  "an16",
  "an17",
  "an18",
];

function GhostLoader() {
  return (
    <div className="tf-ghost-loader" aria-hidden="true">
      <div className="tf-ghost-loader__body">
        <div className="tf-ghost-loader__pupil tf-ghost-loader__pupil--left" />
        <div className="tf-ghost-loader__pupil tf-ghost-loader__pupil--right" />
        <div className="tf-ghost-loader__eye tf-ghost-loader__eye--left" />
        <div className="tf-ghost-loader__eye tf-ghost-loader__eye--right" />
        {ghostBlocks.map((block) => (
          <div key={block} className={`tf-ghost-loader__pixel tf-ghost-loader__pixel--${block}`} />
        ))}
      </div>
      <div className="tf-ghost-loader__shadow" />
    </div>
  );
}

function GlobalLoadingOverlay({ active, message }) {
  return (
    <div
      className={`tf-global-loading ${active ? "is-visible" : ""}`}
      role="status"
      aria-live="polite"
      aria-hidden={!active}
      aria-label={message}
    >
      <div className="tf-global-loading__card">
        <GhostLoader />
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
