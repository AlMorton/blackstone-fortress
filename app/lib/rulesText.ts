/**
 * Some cards print inline glyphs in their rules text — the Cultist Firebrand's
 * "Make a [d6] attack roll", the Borewyrm's "showing the [discovery] side". The JSON
 * stores those as {name} tokens so the text stays plain and diffable, and the renderer
 * swaps in an icon.
 */
export const GLYPHS = ["d6", "discovery"] as const;
export type GlyphName = (typeof GLYPHS)[number];

export type RulesSegment =
  | { kind: "text"; value: string }
  | { kind: "glyph"; name: GlyphName };

const TOKEN = new RegExp(`\\{(${GLYPHS.join("|")})\\}`, "g");

export function parseRulesText(text: string): RulesSegment[] {
  const segments: RulesSegment[] = [];
  let last = 0;

  for (const match of text.matchAll(TOKEN)) {
    if (match.index > last) {
      segments.push({ kind: "text", value: text.slice(last, match.index) });
    }
    segments.push({ kind: "glyph", name: match[1] as GlyphName });
    last = match.index + match[0].length;
  }

  if (last < text.length) segments.push({ kind: "text", value: text.slice(last) });
  return segments;
}
