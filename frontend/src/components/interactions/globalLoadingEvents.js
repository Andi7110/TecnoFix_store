const GLOBAL_LOADING_EVENT = "tecnofix:global-loading";

let pendingCount = 0;

function emitGlobalLoadingChange(active, message = "Cargando...") {
  if (typeof window === "undefined") {
    return;
  }

  window.dispatchEvent(
    new CustomEvent(GLOBAL_LOADING_EVENT, {
      detail: {
        active,
        message,
      },
    }),
  );
}

export function startGlobalLoading(message = "Cargando...") {
  const token = Symbol("global-loading");
  pendingCount += 1;
  emitGlobalLoadingChange(true, message);

  return token;
}

export function stopGlobalLoading() {
  pendingCount = Math.max(0, pendingCount - 1);

  if (pendingCount === 0) {
    emitGlobalLoadingChange(false);
  }
}

export function subscribeToGlobalLoading(listener) {
  if (typeof window === "undefined") {
    return () => {};
  }

  function handleGlobalLoadingChange(event) {
    listener(event.detail);
  }

  window.addEventListener(GLOBAL_LOADING_EVENT, handleGlobalLoadingChange);

  return () => {
    window.removeEventListener(GLOBAL_LOADING_EVENT, handleGlobalLoadingChange);
  };
}
