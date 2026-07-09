// File responsibility: Renders a reusable loading state for async page and panel content.
/**
 * Shows an accessible loading indicator.
 * label stores the message announced to screen readers and displayed beside the spinner.
 */
export function Loading({ label = "Loading" }: { label?: string }) {
  return (
    <div className="loading" role="status" aria-live="polite">
      <span className="spinner" />
      <span>{label}</span>
    </div>
  );
}
