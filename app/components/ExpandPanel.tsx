import { useId, useState, type ReactNode } from "react";

/**
 * The "Select Players" / "Select Enemy Groups" headers. Replaces the transient
 * ExpandPanelController from the Blazor DI container with local state.
 */
export function ExpandPanel({
  label,
  defaultOpen = false,
  children,
}: {
  label: string;
  defaultOpen?: boolean;
  children: ReactNode;
}) {
  const [open, setOpen] = useState(defaultOpen);
  const panelId = useId();

  return (
    <section className="mb-2">
      <button
        type="button"
        onClick={() => setOpen((value) => !value)}
        aria-expanded={open}
        aria-controls={panelId}
        className="bf-gradient-panel flex h-10 w-full cursor-pointer items-center justify-center rounded-[10px] text-white"
      >
        {label}
      </button>

      <div id={panelId} className="bf-collapsible" data-collapsed={!open}>
        <div>
          <div className="flex flex-wrap gap-1 py-2">{children}</div>
        </div>
      </div>
    </section>
  );
}
