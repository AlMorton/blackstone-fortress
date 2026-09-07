import { useEffect, useId, useRef, type ReactNode } from "react";

/**
 * "bright" is the original Blazor modal gradient, which reads well behind the opaque
 * buttons of the pickers. Behaviour cards are semi-transparent, so that gradient bleeds
 * through and washes them out — those get "dark".
 */
const SURFACES = {
  bright: "bf-gradient-modal",
  dark: "bg-[#070d18]/95 border border-white/15",
} as const;

/**
 * Shared shell for the arena's picker popups. Built on <dialog> so the browser handles
 * focus trapping, Escape-to-close and inertness of the page behind — the Blazor modal
 * hardcoded aria-hidden="true" and was invisible to screen readers.
 *
 * Children supply their own layout; the shell only owns the chrome.
 */
export function PickerDialog({
  open,
  title,
  hint,
  surface = "bright",
  closeLabel = "OK",
  onClose,
  children,
}: {
  open: boolean;
  title: string;
  hint?: string;
  surface?: keyof typeof SURFACES;
  closeLabel?: string;
  onClose: () => void;
  children: ReactNode;
}) {
  const dialogRef = useRef<HTMLDialogElement>(null);
  const titleId = useId();

  useEffect(() => {
    const dialog = dialogRef.current;
    if (!dialog) return;
    if (open && !dialog.open) dialog.showModal();
    if (!open && dialog.open) dialog.close();
  }, [open]);

  if (!open) return null;

  return (
    <dialog
      ref={dialogRef}
      onClose={onClose}
      onClick={(event) => {
        if (event.target === dialogRef.current) onClose();
      }}
      aria-labelledby={titleId}
      className="m-auto w-[min(42rem,92vw)] rounded bg-transparent p-0 backdrop:bg-black/60"
    >
      <div className={`${SURFACES[surface]} rounded text-bf-card`}>
        <header className="border-b border-white/20 px-4 py-3">
          <h2 id={titleId} className="text-lg text-white">
            {title}
          </h2>
        </header>

        <div className="max-h-[70vh] overflow-y-auto p-4">
          {hint && <p className="mb-3 text-sm opacity-80">{hint}</p>}
          {children}
        </div>

        <footer className="flex justify-end border-t border-white/20 px-4 py-3">
          <button
            type="button"
            onClick={onClose}
            className="rounded bg-bf-btn px-5 py-2 text-white hover:brightness-125"
          >
            {closeLabel}
          </button>
        </footer>
      </div>
    </dialog>
  );
}
