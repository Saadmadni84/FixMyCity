// Dev-only hook to surface bootstrap errors in the console.
window.addEventListener("vite:initial-error", (event: Event) => {
  const customEvent = event as CustomEvent<unknown>;
  console.error("Vite initial load error:", customEvent.detail);
});
