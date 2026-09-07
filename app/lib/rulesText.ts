/**
 * Some cards print an inline glyph in their rules text — e.g. the Cultist Firebrand's
 * "Make a [d6] attack roll". The JSON stores those as {d6} tokens so the text stays
 * plain and diffable, and the renderer swaps in an icon.
 */
export type RulesSegment = { kind: "text"; value: string } | { kind: "die" };

const TOKEN = /\{d6\}/g;

export function parseRulesText(text: string): RulesSegment[] {
  const segments: RulesSegment[] = [];
  let last = 0;

  for (const match of text.matchAll(TOKEN)) {
    if (match.index > last) {
      segments.push({ kind: "text", value: text.slice(last, match.index) });
    }
    segments.push({ kind: "die" });
    last = match.index + match[0].length;
  }

  if (last < text.length) segments.push({ kind: "text", value: text.slice(last) });
  return segments;
}
