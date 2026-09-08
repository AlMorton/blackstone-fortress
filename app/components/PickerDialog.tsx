import { useEffect, useId, useRef, type ReactNode } from "react";


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
      <div className="overflow-hidden rounded border border-bf-edge bg-bf-slate text-bf-text">
        <header className="bf-gradient-head border-b border-bf-edge px-4 pt-2.5 pb-3">
          <p className="bf-eyebrow text-bf-kicker">Arena</p>
          <h2 id={titleId} className="pt-1 text-xl text-bf-cyan">
            {title}
          </h2>
        </header>

        <div className="max-h-[70vh] overflow-y-auto p-4">
          {hint && <p className="mb-3 text-sm text-bf-muted">{hint}</p>}
          {children}
        </div>

        <footer className="flex justify-end border-t border-bf-edge px-4 py-3">
          <button
            type="button"
            onClick={onClose}
            className="rounded border px-4 py-2 font-cond text-sm tracking-wide uppercase transition focus-visible:ring-2 focus-visible:ring-bf-cyan focus-visible:outline-none border-bf-edge bg-bf-slate-2 text-bf-bright hover:border-bf-cyan hover:text-bf-cyan"
          >
            OK
          </button>
        </footer>
      </div>
    </dialog>
  );
}
