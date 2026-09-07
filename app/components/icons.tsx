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
