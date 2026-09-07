import { describe, expect, it } from "vitest";
import { actionDescriptions } from "../app/lib/actions";
import { GLYPHS, parseRulesText } from "../app/lib/rulesText";

describe("parseRulesText", () => {
  it("returns a single text segment when there is no token", () => {
    expect(parseRulesText("Do nothing")).toEqual([{ kind: "text", value: "Do nothing" }]);
  });

  it("splits a token out of the surrounding text", () => {
    expect(parseRulesText("Make a {d6} attack roll.")).toEqual([
      { kind: "text", value: "Make a " },
      { kind: "glyph", name: "d6" },
      { kind: "text", value: " attack roll." },
    ]);
  });

  it("handles a token at the very start and end", () => {
    expect(parseRulesText("{d6} then {discovery}")).toEqual([
      { kind: "glyph", name: "d6" },
      { kind: "text", value: " then " },
      { kind: "glyph", name: "discovery" },
    ]);
  });

  it("keeps distinct glyphs apart", () => {
    const segments = parseRulesText("a {discovery} b {d6} c");
    expect(segments.filter((s) => s.kind === "glyph")).toEqual([
      { kind: "glyph", name: "discovery" },
      { kind: "glyph", name: "d6" },
    ]);
  });

  it("is a no-op for empty text", () => {
    expect(parseRulesText("")).toEqual([]);
  });

  it("leaves braces that are not known glyphs alone", () => {
    const text = "Costs {1} and a {d7} and {} too.";
    expect(parseRulesText(text)).toEqual([{ kind: "text", value: text }]);
  });
});

describe("tokens in the shipped data", () => {
  /** Guards against a description using a token the renderer cannot draw. */
  it("only uses glyph tokens the renderer knows", () => {
    const known = new Set<string>(GLYPHS);
    for (const [name, text] of actionDescriptions) {
      for (const match of text.matchAll(/\{([^}]*)\}/g)) {
        const token = match[1] ?? "";
        expect(known.has(token), `${name} uses unknown token {${token}}`).toBe(true);
      }
    }
  });

  it("leaves no bracketed placeholders behind from transcription", () => {
    for (const [name, text] of actionDescriptions) {
      expect(text, `${name} still has a [placeholder]`).not.toMatch(/\[[^\]]*\]/);
    }
  });
});
