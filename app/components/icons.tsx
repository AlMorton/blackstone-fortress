/** Inline replacements for the three open-iconic glyphs the Blazor sidebar used. */
const base = "h-5 w-5 shrink-0 fill-current";

export function MenuIcon() {
  return (
    <svg viewBox="0 0 8 8" className={base} aria-hidden="true">
      <path d="M0 1v1h8V1H0zm0 3v1h8V4H0zm0 3v1h8V7H0z" />
    </svg>
  );
}

export function GridIcon() {
  return (
    <svg viewBox="0 0 8 8" className={base} aria-hidden="true">
      <path d="M0 0v2h2V0H0zm3 0v2h2V0H3zm3 0v2h2V0H6zM0 3v2h2V3H0zm3 0v2h2V3H3zm3 0v2h2V3H6zM0 6v2h2V6H0zm3 0v2h2V6H3zm3 0v2h2V6H6z" />
    </svg>
  );
}

export function ListIcon() {
  return (
    <svg viewBox="0 0 8 8" className={base} aria-hidden="true">
      <path d="M0 0v2h2V0H0zm3 0v1h5V0H3zm0 2v1h5V2H3zM0 3v2h2V3H0zm3 2v1h5V5H3zm0 2v1h5V7H3zM0 6v2h2V6H0z" />
    </svg>
  );
}
