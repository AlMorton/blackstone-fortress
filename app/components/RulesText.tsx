import { parseRulesText, type GlyphName } from "~/lib/rulesText";
import { DieIcon, DiscoveryIcon } from "./icons";

const GLYPH_ICONS: Record<GlyphName, () => React.ReactElement> = {
  d6: DieIcon,
  discovery: DiscoveryIcon,
};

/** Renders a card's rules text, swapping {d6} and {discovery} tokens for icons. */
export function RulesText({ text }: { text: string }) {
  return (
    <>
      {parseRulesText(text).map((segment, i) => {
        if (segment.kind === "text") return <span key={i}>{segment.value}</span>;
        const Icon = GLYPH_ICONS[segment.name];
        return <Icon key={i} />;
      })}
    </>
  );
}
