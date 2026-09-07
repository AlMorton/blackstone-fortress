import { useEffect, useId, useRef, type ReactNode } from "react";

/**
 * Shared shell for the "add something to the arena" popups. Built on <dialog> so the
 * browser handles focus trapping, Escape-to-close and inertness of the page behind —
 * the Blazor modal hardcoded aria-hidden="true" and was invisible to screen readers.
 */
export function PickerDialog({
  open,
  title,
  hint,
  onClose,
  children,
}: {
  open: boolean;
  title: string;
  hint?: string;
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
      <div className="bf-gradient-modal rounded text-bf-card">
        <header className="border-b border-white/20 px-4 py-3">
          <h2 id={titleId} className="text-lg text-white">
            {title}
          </h2>
        </header>

        <div className="max-h-[60vh] overflow-y-auto p-4">
          {hint && <p className="mb-3 text-sm opacity-80">{hint}</p>}
          <div className="flex flex-wrap gap-1">{children}</div>
        </div>

        <footer className="flex justify-end border-t border-white/20 px-4 py-3">
          <button
            type="button"
            onClick={onClose}
            className="rounded bg-bf-btn px-5 py-2 text-white hover:brightness-125"
          >
            OK
          </button>
        </footer>
      </div>
    </dialog>
  );
}
