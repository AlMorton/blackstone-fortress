import { describe, expect, it } from "vitest";
import { actionDescriptions } from "../app/lib/actions";
import { parseRulesText } from "../app/lib/rulesText";

describe("parseRulesText", () => {
  it("returns a single text segment when there is no token", () => {
    expect(parseRulesText("Do nothing")).toEqual([{ kind: "text", value: "Do nothing" }]);
  });

  it("splits a token out of the surrounding text", () => {
    expect(parseRulesText("Make a {d6} attack roll.")).toEqual([
      { kind: "text", value: "Make a " },
      { kind: "die" },
      { kind: "text", value: " attack roll." },
    ]);
  });

  it("handles a token at the very start and end", () => {
    expect(parseRulesText("{d6} then {d6}")).toEqual([
      { kind: "die" },
      { kind: "text", value: " then " },
      { kind: "die" },
    ]);
  });

  it("is a no-op for empty text", () => {
    expect(parseRulesText("")).toEqual([]);
  });

  it("leaves a lone brace alone", () => {
    const text = "Costs {1} and a {d7}.";
    expect(parseRulesText(text)).toEqual([{ kind: "text", value: text }]);
  });
});

describe("tokens in the shipped data", () => {
  it("never leaves a raw {d6} token unrendered anywhere it is used", () => {
    // Guards against a description using a token the renderer does not know.
    for (const [name, text] of actionDescriptions) {
      const leftovers = text.replace(/\{d6\}/g, "").match(/\{[^}]*\}/g);
      expect(leftovers, `${name} has unknown token(s)`).toBeNull();
    }
  });
});
