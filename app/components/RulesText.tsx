import { parseRulesText } from "~/lib/rulesText";
import { DieIcon } from "./icons";

/** Renders a card's rules text, swapping {d6} tokens for the die glyph. */
export function RulesText({ text }: { text: string }) {
  return (
    <>
      {parseRulesText(text).map((segment, i) =>
        segment.kind === "die" ? <DieIcon key={i} /> : <span key={i}>{segment.value}</span>,
      )}
    </>
  );
}
