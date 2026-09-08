#!/usr/bin/env python3
"""
Lays the Abominable Intellect twists out as print-and-cut cards.

Poker size (63.5 x 88.9 mm), 3 x 3 to an A4 sheet, sorted by twist name so a
cut deck can be searched by hand. Reads app/data/encounter-twists.json, so the
sheets and the app never drift.

    python3 print/build-print-sheets.py
"""
import html
import json
import pathlib
import re

ROOT = pathlib.Path(__file__).resolve().parent.parent
DATA = ROOT / "app" / "data" / "encounter-twists.json"
OUT = ROOT / "print" / "encounter-twists-print.html"

PER_SHEET = 9

GLYPH = {
    "d6": '<svg class="g" viewBox="0 0 11 11"><rect x="0.6" y="0.6" width="9.8" height="9.8" rx="1.4"/></svg>',
    "d8": '<svg class="g" viewBox="0 0 12 11"><polygon points="6,0.6 11.4,10.4 0.6,10.4"/></svg>',
    "d12": '<svg class="g" viewBox="0 0 12 12"><polygon points="6,0.6 11.4,4.5 9.3,11.4 2.7,11.4 0.6,4.5"/></svg>',
}


def rules_html(text: str) -> str:
    return re.sub(r"\{(d6|d8|d12)\}", lambda m: GLYPH[m.group(1)], html.escape(text))


def card(t: dict) -> str:
    return f"""      <article class="card">
        <div class="head">
          <span class="kicker">Encounter</span>
          <h2 class="twist">{html.escape(t["twist"])}</h2>
        </div>
        <p class="rules">{rules_html(t["text"])}</p>
      </article>"""


def main() -> None:
    twists = json.loads(DATA.read_text())["twists"]
    twists.sort(key=lambda t: (t["twist"].lower(), t["card"]))

    sheets = []
    for i in range(0, len(twists), PER_SHEET):
        chunk = twists[i : i + PER_SHEET]
        cells = [card(t) for t in chunk]
        # Keep the cut grid square on a part-full sheet.
        cells += ['      <article class="card blank"></article>'] * (PER_SHEET - len(chunk))
        sheets.append('    <section class="sheet">\n' + "\n".join(cells) + "\n    </section>")

    OUT.write_text(TEMPLATE.replace("__SHEETS__", "\n".join(sheets)))
    print(f"{len(twists)} cards on {len(sheets)} sheets -> {OUT.relative_to(ROOT)}")


TEMPLATE = """<!doctype html>
<html lang="en">
<head>
<meta charset="utf-8">
<title>Abominable Intellect Twists &mdash; print sheets</title>
<style>
  /* Poker card, 3 x 3 on A4. Margins leave 1.5mm slack across the row. */
  @page { size: A4 portrait; margin: 9mm; }

  :root {
    --card-w: 63.5mm;
    --card-h: 88.9mm;
    --ground: #f1f2ee;   /* the printed cards' pale grey-green stock */
    --ink: #14161a;
    --rule: #9aa0a6;
    --cut: #b9bec4;
    --accent: #6d28d9;   /* the purple of the tier triangles */
    --die: #4b5158;

    /* System faces only — no webfont fetch at print time. */
    --cond: "Arial Narrow", "Helvetica Neue Condensed Bold", "Liberation Sans Narrow", Helvetica, Arial, sans-serif;
    --body: "Helvetica Neue", Helvetica, Arial, sans-serif;
  }

  * { box-sizing: border-box; }

  html, body { margin: 0; padding: 0; background: #fff; }

  body {
    font-family: var(--body);
    color: var(--ink);
    -webkit-print-color-adjust: exact;
    print-color-adjust: exact;
  }

  .sheet {
    display: grid;
    grid-template-columns: repeat(3, var(--card-w));
    grid-auto-rows: var(--card-h);
    gap: 0;
    justify-content: center;
    break-after: page;
  }
  .sheet:last-child { break-after: auto; }

  .card {
    position: relative;
    display: flex;
    flex-direction: column;
    /* Hairline cut guide; adjacent cards share the line. */
    border: 0.2mm dashed var(--cut);
    background: var(--ground);
    padding: 5mm 4.6mm 4mm;
    overflow: hidden;
  }
  .card.blank { background: #fff; }

  .head {
    border-bottom: 0.3mm solid var(--rule);
    padding-bottom: 1.6mm;
    margin-bottom: 2.6mm;
  }

  .kicker {
    display: block;
    font-family: var(--cond);
    font-weight: 700;
    font-size: 6pt;
    letter-spacing: 0.3em;
    text-transform: uppercase;
    color: var(--accent);
    margin-bottom: 1.2mm;
  }

  .twist {
    font-family: var(--cond);
    font-weight: 700;
    font-size: 13.5pt;
    line-height: 1.08;
    text-transform: uppercase;
    margin: 0;
    text-wrap: balance;
  }

  .rules {
    /* Card height is fixed, so centre in the space the title leaves. */
    margin: auto 0;
    font-size: 9.5pt;
    line-height: 1.45;
  }

  .g { height: 9pt; width: auto; vertical-align: -0.6pt; margin: 0 0.3pt; }
  .g rect, .g polygon { fill: var(--die); }

  /* Screen-only helper so the file is readable before it is printed. */
  @media screen {
    body { background: #55585d; padding: 12mm 0; }
    .sheet {
      width: 210mm;
      min-height: 297mm;
      margin: 0 auto 8mm;
      padding: 9mm;
      background: #fff;
      box-shadow: 0 2mm 6mm #0006;
      align-content: start;
    }
  }
</style>
</head>
<body>
__SHEETS__
</body>
</html>
"""

if __name__ == "__main__":
    main()
