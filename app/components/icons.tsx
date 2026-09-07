/** Inline replacement for the open-iconic glyph the Blazor sidebar used. */
export function ListIcon() {
  return (
    <svg
      viewBox="0 0 8 8"
      className="h-4 w-4 shrink-0 fill-current"
      aria-hidden="true"
    >
      <path d="M0 0v2h2V0H0zm3 0v1h5V0H3zm0 2v1h5V2H3zM0 3v2h2V3H0zm3 2v1h5V5H3zm0 2v1h5V7H3zM0 6v2h2V6H0z" />
    </svg>
  );
}

/**
 * Removal from a group. Drawn as an outline rather than a filled glyph so it stays
 * legible at 18px on the cards' gradient.
 */
export function TrashIcon() {
  return (
    <svg
      viewBox="0 0 24 24"
      className="h-[18px] w-[18px] shrink-0"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      <path d="M4 7h16M10 4h4a1 1 0 0 1 1 1v2H9V5a1 1 0 0 1 1-1zM6 7v13a1 1 0 0 0 1 1h10a1 1 0 0 0 1-1V7M10 11v6M14 11v6" />
    </svg>
  );
}

/** Drag grip. Six dots is the conventional "grab here to reorder" affordance. */
export function GripIcon() {
  return (
    <svg
      viewBox="0 0 16 16"
      className="h-4 w-4 shrink-0 fill-current"
      aria-hidden="true"
    >
      <circle cx="6" cy="4" r="1.4" />
      <circle cx="10" cy="4" r="1.4" />
      <circle cx="6" cy="8" r="1.4" />
      <circle cx="10" cy="8" r="1.4" />
      <circle cx="6" cy="12" r="1.4" />
      <circle cx="10" cy="12" r="1.4" />
    </svg>
  );
}

/** Chevron marking a card that opens something. */
export function ChevronIcon() {
  return (
    <svg
      viewBox="0 0 24 24"
      className="h-3.5 w-3.5 shrink-0"
      fill="none"
      stroke="currentColor"
      strokeWidth="2.5"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      <path d="M9 6l6 6-6 6" />
    </svg>
  );
}

/**
 * A blank d6, matching the die glyph printed inline in some cards' rules text.
 * Deliberately pipless: the card uses it to name a die type, not a rolled value.
 */
export function DieIcon() {
  return (
    <svg
      viewBox="0 0 24 24"
      role="img"
      aria-label="d6"
      className="inline-block h-[1.05em] w-[1.05em] align-[-0.17em]"
    >
      <rect
        x="2.5"
        y="2.5"
        width="19"
        height="19"
        rx="3.5"
        className="fill-bf-die"
        stroke="currentColor"
        strokeOpacity="0.35"
        strokeWidth="1"
      />
    </svg>
  );
}

/**
 * The unexplored side of a discovery marker: a purple triangle carrying a question
 * mark, as printed inline in the Borewyrm Infestation's Consume rules.
 */
export function DiscoveryIcon() {
  return (
    <svg
      viewBox="0 0 24 24"
      role="img"
      aria-label="unexplored discovery marker"
      className="inline-block h-[1.15em] w-[1.15em] align-[-0.22em]"
    >
      <path
        d="M12 2.5 22.5 21H1.5z"
        className="fill-bf-discovery"
        stroke="currentColor"
        strokeOpacity="0.3"
        strokeWidth="1"
      />
      <text
        x="12"
        y="19.2"
        textAnchor="middle"
        fontSize="11"
        fontWeight="700"
        fontFamily="system-ui, -apple-system, sans-serif"
        fill="#fff"
      >
        ?
      </text>
    </svg>
  );
}
