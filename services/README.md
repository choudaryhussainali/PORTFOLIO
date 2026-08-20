# /services — handoff

Vanilla HTML + CSS + JS. No build step, no framework, no package manager.
Drops into the existing static site as-is.

```
services/index.html          the page
assets/css/services.css      all styling
assets/js/services.js        all behaviour
assets/fonts/*.woff2         4 self-hosted faces (99 KB total)
assets/img/services/         og-image.jpg (1200×630)
```

Light corporate layout, blue and white. Every illustration on the page is an
inline SVG authored here — there are no illustration image files to manage.

---

## 1. ⚠️ Before this goes live — form endpoint

**The form does not work yet.** It will POST and fail until a real key is
pasted in. This is the one outstanding blocker.

The key is **not** in the JS. It is in the markup:

```html
<!-- services/index.html, inside <form id="brief"> -->
<input type="hidden" name="access_key" value="REPLACE_WITH_WEB3FORMS_KEY">
```

Get a free key at **web3forms.com** — enter your email, they mail you the key,
no account needed. Paste it over `REPLACE_WITH_WEB3FORMS_KEY`. That is the only
change required.

Submissions arrive at whichever address you registered. The form posts natively
if JavaScript is off, so it degrades correctly either way.

To use Formspree instead: change the `<form action>` to your Formspree endpoint
and delete the `access_key` and `subject` hidden inputs. Nothing else changes.

---

## 2. Changing prices

**One place only** — the top of `assets/js/services.js`:

```js
var PRICING = {
  PKR: { launch: { n: 40000, display: "PKR 40,000" }, ... },
  USD: { launch: { n: 175,   display: "$175"       }, ... }
};
```

`n` is the number the count-up animates to. `display` is what renders on load.
Keep them in agreement.

`budgets` in the same object feeds the form's budget dropdown, so the ranges a
lead picks from always match the prices they just read.

**The PKR values are also hardcoded once in the HTML** as the no-JS baseline
(`<span data-price="launch">PKR 40,000</span>`). If you change a PKR price,
change it in both places, or the page will flash the old number before JS runs.

---

## 3. The currency toggle is an audience toggle

Switching PKR ↔ USD changes more than the digits. It also swaps:

| What | PKR | USD |
|---|---|---|
| Contact note | "…Based in Lahore · Happy to meet in person if you are local" | "…Async by default · Overlapping hours for EU and US-East" |
| WhatsApp prefill | Generic | Mentions the sender is outside Pakistan |
| Budget ranges | PKR bands | USD bands |

Reasoning: a Lahore salon owner and a founder in Berlin need different first
reassurances. Both variants live in the `AUDIENCE` object next to `PRICING`.

---

## 4. Typography

| Role | Face | File |
|---|---|---|
| Headings (`h1`–`h4`, prices, stats) | Schibsted Grotesk | `SchibstedGrotesk-var.woff2` |
| Everything else | Satoshi | `Satoshi-400/500/700.woff2` |

The display face is **one variable file covering weights 500–800**, instanced
from the full axis and subset to the characters this page actually sets — 24 KB.

**Do not swap the display face for Clash Display**, which this page used
earlier. Its space glyph is unusually narrow, and at the −0.02em tracking the
headings use, word gaps visibly collapsed: "AI systems and" rendered as
"AIsystemsand" on every heading in the page.

Four characters (`₨ → ★ ☰`) are not in the subset because Schibsted has no
glyph for them. They appear only in body-font contexts — links, star ratings,
the nav button — so the display face never renders them. If you ever put one of
those characters in a heading it will fall back to system-ui.

If you re-subset the font, derive the charset from the page's own text rather
than typing one out, and check the resulting cmap.

---

## 5. The two marquees

Both are built by JS from static markup, and both stop dead under
`prefers-reduced-motion`.

**Announcement ticker** (under the nav). The five items are narrower than a
desktop viewport, so the script clones them until they cover it, then duplicates
the whole track and animates `translateX(-50%)` — two identical halves means the
loop lands on a matching frame and has no seam. Speed is fixed at ~55 px/s,
computed from the measured width, so it does not sprint on mobile.

Three things that are load-bearing and easy to break:

- **The nowrap track is applied by CSS on `.js`, not by the script.** If the
  script applies it, the row paints as several wrapped lines and then snaps to
  one, shifting the whole page — that was 0.085 CLS on mobile.
- **Measure only after switching to nowrap.** In the wrapped default,
  `scrollWidth` is pinned to the container, so clones add height instead of
  width and the fill loop runs until its guard trips.
- The track is rebuilt on `document.fonts.ready` and on resize, because both
  change item widths.

Under reduced motion the script bails and CSS restores the wrapped centred row.

**Tech strip.** Chips are built from a JSON manifest (`#tech-data`) and
reference an inline SVG sprite via `<use>`, so each brand mark's path data
exists once in the document. Under reduced motion the chips still render, as a
static centred wrap — bailing out entirely left an empty band, because the
plain-text fallback list is `.sr`.

### Brand marks

15 of the 19 come from **Simple Icons** (CC0), self-hosted in the sprite. The
other four render as a neutral dot:

- **Groq, FAISS, Pinecone** — no official mark exists. Do not substitute a
  lookalike.
- **MySQL** — its official mark is a dolphin-plus-wordmark lockup. At 20px the
  wordmark is illegible and it repeats the chip's own label.

Marks that are near-black (GitHub, Flask, LangChain) are pulled to the page ink
tone by a luminance check in JS, so the row stays optically even.

---

## 6. Hero illustration

Generated, not hand-drawn. The generator is not in the repo — it is a throwaway
script — but the geometry is a real isometric projection
(`sx = (x−y)·cos30`, `sy = (x+y)/2 − z`), which is why every edge is truly
axis-parallel.

If you edit the SVG by hand, two things will bite you:

- The page layout is authored in page coordinates mapped `px → +y`, `py → +x`.
  Mapping `px → +x` instead puts the header on the upper-**right** edge and the
  whole page reads rotated.
- The cards' drop shadows must paint **after** the page's own layout
  rectangles, or the layout covers them and the cards look unlit. Their
  footprints must also stay inside the slab, or the shadow lands in empty space
  beside the page as a grey smudge.

The three floating cards drift on different periods; `prefers-reduced-motion`
stops them.

---

## 7. Colour and contrast

All text passes WCAG AA (verified — see §9).

| Token | Value | Note |
|---|---|---|
| `--ink` | `#16233b` | headings, 13.6:1 on white |
| `--body` | `#55617a` | body, 6.4:1 |
| `--muted` | `#6a7690` | small labels, 4.56:1 |
| `--blue` | `#096fcf` | links, fills |
| `--accent` | `#f5a524` | badges and the illustration's top card only |

**`--muted` was `#7c879e` and failed at 3.61:1.** If you lighten it again you
will re-break the currency labels, the packages note, the client credit and the
form aside.

Top bar links are full white on `--blue` (5.02:1) and hover with an underline.
They were previously white at `opacity: 0.92`, which composites to `#ebf3fb` —
4.48:1, just under the bar.

---

## 8. Links updated outside this folder

`index.html` — four CTAs changed from `./services/` to `./services`, matching
the canonical URL (`https://choudaryhussainali.online/services`).

**Local-preview caveat:** `python -m http.server` needs the trailing slash to
serve a directory index, so `/services` 404s locally while `/services/` works.
Vercel resolves both. Test locally at `http://127.0.0.1:8000/services/`.

CSS and JS are referenced with a `?v=<content hash>` query string. **Update it
when you edit either file**, or returning visitors keep the cached copy.

---

## 9. Measured results

Lighthouse 12, against `http://127.0.0.1:8000/services/`.

| | Perf | A11y | Best Practices | SEO |
|---|---|---|---|---|
| Desktop | **100** | **100** | **100** | **100** |
| Mobile | **96** | **100** | **100** | **100** |

Mobile: FCP 1.7s, LCP 2.6s, **CLS 0**, TBT 20ms.

The Lighthouse dial in the Web development section shows **96**, which is this
page's own measured mobile score — it is labelled as such. It previously read
98, which was not measured from anything.

Two caveats on these numbers:

- They are from **localhost**, so they exclude real network latency. Re-run
  against the deployed URL for a figure you can quote to a client.
- `python -m http.server` sends no compression and no cache headers, so
  Lighthouse's "enable text compression" and "efficient cache policy" warnings
  are artefacts of the local server. Vercel handles both.

CSS and JS are unminified by choice — this is a no-build-step site. Minifying
would save roughly 17 KB before gzip.

---

## 10. Accessibility and motion notes

- `prefers-reduced-motion` disables both marquees, the scroll reveals and the
  illustration drift. Verified: no element is left hidden and no band is left
  empty.
- Marquee clones carry `aria-hidden="true"`; only the original items are
  announced.
- The tech strip is `aria-hidden`; the original text list stays in the DOM as
  the screen-reader alternative.
- FAQ uses native `<details name="faq">` — exclusive accordion, **no JS**,
  keyboard-operable by default.
- Tap targets are ≥44px. Inline links inside sentences are exempt under
  WCAG 2.5.8 and are intentionally left at text size.
- Heading order runs h1 → h2 → h3 with no skips. The footer section labels are
  `h3`; they were `h4`, which skipped a level.

---

## 11. What is not fabricated

Every number on the page traces to verified work:

- PKR 1M+ first-30-day revenue — Glovino (`glovino.shop`)
- 10+ live products, Certiport certified, BS-IT Punjab
- Four clients: Glovino, SalonStudio, Haroon Rasool, YSDS

**Removed during the build:** a hero sub-line claiming clients "in 3
continents" (all four verified clients are Pakistan-based), and the invented
Lighthouse score described in §9.

The hero badge reads "Independent developer · Lahore, Pakistan". Keep claims at
that register — the page's credibility rests on every number being real.

---

## 12. Still open

- **The Web3Forms key (§1).** Blocking.
- **Re-run Lighthouse against the deployed URL** for quotable numbers.
- **`choudary-studio/`** at the repo root is an abandoned Next.js app from an
  earlier direction. Nothing in this build references it. It is not deleted
  because that is your call — verify you want none of it, then remove it.
- Rich Results Test — all five JSON-LD blocks parse as valid JSON and the FAQ
  entries match the rendered markup, but they have not been through Google's
  validator.
