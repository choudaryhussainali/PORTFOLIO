# -*- coding: utf-8 -*-
"""
Builds the service-card icon sprite.

Fifteen icons on a shared 160x120 grid, drawn in the homepage's neon palette.
Every one carries continuous SMIL animation: SMIL rather than CSS because the
animation has to live inside the <symbol>, which is cloned into each <use>
shadow tree — and because the sprite's own <svg> root then owns the whole
timeline, so a single pauseAnimations() call can freeze all forty-five
instances for reduced-motion or when the section scrolls out of view.

No filters anywhere. A blurred glow would be re-rasterised per instance per
frame; a wider, fainter stroke underneath costs nothing and reads the same at
this size.
Run it from anywhere:  python tools/service-icons.py
It rewrites the sprite and the <template> bank in index.html in place.
"""
import re

CY, CYD = "#00f0ff", "#0d8fb0"      # cyan, and its dim counterpart
PU, PUD = "#9d7bff", "#5a3fae"      # purple
PK       = "#ff2d87"                # accent pink, used sparingly
LINE     = "#46538c"                # structural strokes
SURF     = "#141c42"                # panel fill
SURF2    = "#1d2757"                # raised panel fill
INK      = "#e9efff"                # highlights

# easing used for anything that should feel weighted rather than mechanical
EASE = 'calcMode="spline" keySplines="0.4 0 0.2 1;0.4 0 0.2 1"'
EASE1 = 'calcMode="spline" keySplines="0.4 0 0.2 1"'


def glow(d, color, width=2, op=0.22, w2=7):
    """A wide faint stroke behind a thin bright one — a glow without a filter."""
    return (f'<path d="{d}" fill="none" stroke="{color}" stroke-width="{w2}" '
            f'stroke-opacity="{op}" stroke-linecap="round" stroke-linejoin="round"/>'
            f'<path d="{d}" fill="none" stroke="{color}" stroke-width="{width}" '
            f'stroke-linecap="round" stroke-linejoin="round"/>')


ICONS = {}

# ── 1 · Landing page ───────────────────────────────────────────────────────
# One page, one button. A pointer travels to the call to action and presses it;
# the ring is the click landing.
ICONS["sv-landing"] = f'''
<rect x="46" y="14" width="68" height="92" rx="9" fill="{SURF}" stroke="{LINE}" stroke-width="1.6"/>
<path d="M46 23a9 9 0 0 1 9-9h50a9 9 0 0 1 9 9v9H46z" fill="{PUD}" fill-opacity=".55"/>
<circle cx="55" cy="23" r="2" fill="{CY}" fill-opacity=".8"/>
<circle cx="62" cy="23" r="2" fill="{PU}" fill-opacity=".8"/>
<rect x="57" y="43" width="46" height="5" rx="2.5" fill="{INK}" fill-opacity=".85"/>
<rect x="57" y="54" width="34" height="4" rx="2" fill="{LINE}"/>
<rect x="57" y="63" width="40" height="4" rx="2" fill="{LINE}"/>
<!-- the button, and the ring that leaves it when the pointer lands -->
<g>
  <rect x="57" y="78" width="46" height="14" rx="7" fill="{CY}" fill-opacity=".16" stroke="{CY}" stroke-width="1.6"/>
  <rect x="64" y="84" width="32" height="3" rx="1.5" fill="{CY}"/>
</g>
<g transform="translate(80 85)">
  <g>
    <animateTransform attributeName="transform" type="scale" values=".41;1" dur="2.6s" begin="1.15s"
                      repeatCount="indefinite" {EASE1}/>
    <circle r="17" fill="none" stroke="{CY}" stroke-width="2" vector-effect="non-scaling-stroke" opacity="0">
      <animate attributeName="opacity" values="0;.55;0" dur="2.6s" begin="1.15s" repeatCount="indefinite"/>
    </circle>
  </g>
</g>
<!-- pointer -->
<g>
  <animateTransform attributeName="transform" type="translate" dur="2.6s" repeatCount="indefinite"
     values="26 -14; 0 0; 0 0; 26 -14" keyTimes="0;0.44;0.62;1"
     calcMode="spline" keySplines="0.34 0 0.16 1;0 0 1 1;0.34 0 0.16 1"/>
  <path d="M88 78l16 6.6-6.4 2.1-2.1 6.4z" fill="{INK}" stroke="{SURF}" stroke-width="1.4" stroke-linejoin="round"/>
</g>
'''

# ── 2 · Business website ───────────────────────────────────────────────────
# A full site rather than a page: nav across the top, and sections that come
# alive one after another down the page.
ICONS["sv-business"] = f'''
<rect x="20" y="20" width="120" height="80" rx="10" fill="{SURF}" stroke="{LINE}" stroke-width="1.6"/>
<path d="M20 30a10 10 0 0 1 10-10h100a10 10 0 0 1 10 10v8H20z" fill="{SURF2}"/>
<rect x="29" y="26" width="16" height="4" rx="2" fill="{CY}" fill-opacity=".9"/>
<g fill="{LINE}">
  <rect x="86" y="26" width="14" height="4" rx="2"/>
  <rect x="104" y="26" width="14" height="4" rx="2"/>
  <rect x="122" y="26" width="14" height="4" rx="2"/>
</g>
<!-- the underline walking between nav items -->
<g>
  <animateTransform attributeName="transform" type="translate" values="0 0;18 0;36 0;0 0" dur="4.8s"
                    repeatCount="indefinite" calcMode="spline" keySplines="0.5 0 0.1 1;0.5 0 0.1 1;0.5 0 0.1 1"/>
  <rect x="86" y="33" width="14" height="2" rx="1" fill="{CY}"/>
</g>
<!-- three bands, each lighting in turn -->
<g>
  <rect x="30" y="48" width="46" height="22" rx="5" fill="{PU}" fill-opacity=".18" stroke="{PU}" stroke-width="1.3">
    <animate attributeName="fill-opacity" values=".1;.34;.1;.1" dur="4.5s" repeatCount="indefinite"/>
  </rect>
  <rect x="84" y="48" width="46" height="22" rx="5" fill="{CY}" fill-opacity=".14" stroke="{CY}" stroke-width="1.3">
    <animate attributeName="fill-opacity" values=".08;.08;.3;.08" dur="4.5s" repeatCount="indefinite"/>
  </rect>
</g>
<rect x="30" y="78" width="62" height="4" rx="2" fill="{LINE}"/>
<rect x="30" y="87" width="44" height="4" rx="2" fill="{LINE}"/>
<rect x="104" y="78" width="26" height="13" rx="6.5" fill="{CY}" fill-opacity=".18" stroke="{CY}" stroke-width="1.4">
  <animate attributeName="fill-opacity" values=".12;.35;.12" dur="2.4s" repeatCount="indefinite"/>
</rect>
'''

# ── 3 · Full stack ─────────────────────────────────────────────────────────
# Interface, server, database — and a request travelling the whole way down
# and back, which is the part clients never see.
ICONS["sv-fullstack"] = f'''
<rect x="34" y="12" width="92" height="30" rx="7" fill="{SURF}" stroke="{LINE}" stroke-width="1.6"/>
<rect x="42" y="20" width="30" height="4" rx="2" fill="{INK}" fill-opacity=".7"/>
<rect x="42" y="29" width="48" height="4" rx="2" fill="{LINE}"/>
<circle cx="116" cy="26" r="5" fill="{CY}" fill-opacity=".2" stroke="{CY}" stroke-width="1.4"/>
<!-- server -->
<rect x="34" y="50" width="92" height="22" rx="6" fill="{SURF2}" stroke="{LINE}" stroke-width="1.6"/>
<g fill="{PU}">
  <rect x="44" y="58" width="26" height="3" rx="1.5" fill-opacity=".8"/>
  <rect x="44" y="64" width="16" height="3" rx="1.5" fill-opacity=".45"/>
</g>
<circle cx="112" cy="61" r="3" fill="{CY}">
  <animate attributeName="fill-opacity" values="1;.25;1" dur="1.6s" repeatCount="indefinite"/>
</circle>
<!-- database -->
<g stroke="{CY}" stroke-width="1.7" fill="{SURF}">
  <ellipse cx="80" cy="84" rx="26" ry="7"/>
  <path d="M54 84v14c0 3.9 11.6 7 26 7s26-3.1 26-7V84"/>
</g>
<ellipse cx="80" cy="91" rx="26" ry="7" fill="none" stroke="{CY}" stroke-width="1.2" stroke-opacity=".45"/>
<!-- the round trip -->
<path id="fs-run" d="M116 34v14M116 48H80v28M80 76v-28h36v-14" fill="none" stroke="{PU}" stroke-width="1.3" stroke-opacity=".3"/>
<circle r="3.2" fill="{CY}" opacity="0">
  <animateMotion dur="3.4s" repeatCount="indefinite" {EASE}
    path="M116 34 L116 61 L80 61 L80 84 L80 61 L116 61 L116 34"/>
  <animate attributeName="opacity" values="0;1;1;0" keyTimes="0;.1;.9;1" dur="3.4s" repeatCount="indefinite"/>
</circle>
'''

# ── 4 · SaaS ───────────────────────────────────────────────────────────────
# Revenue that arrives again every month: a ring that never stops going round,
# over a chart that keeps climbing.
ICONS["sv-saas"] = f'''
<rect x="20" y="18" width="120" height="84" rx="10" fill="{SURF}" stroke="{LINE}" stroke-width="1.6"/>
<rect x="30" y="28" width="26" height="4" rx="2" fill="{LINE}"/>
<!-- recurring ring -->
<g transform="translate(50 66)">
  <circle r="22" fill="none" stroke="{LINE}" stroke-width="5" stroke-opacity=".55"/>
  <circle r="22" fill="none" stroke="{PU}" stroke-width="5" stroke-linecap="round"
          stroke-dasharray="46 92" transform="rotate(-90)">
    <animateTransform attributeName="transform" type="rotate" from="-90" to="270"
                      dur="3.6s" repeatCount="indefinite"/>
  </circle>
  <circle r="9" fill="{PU}" fill-opacity=".16"/>
  <path d="M-4 0h8M0-4v8" stroke="{CY}" stroke-width="2" stroke-linecap="round"/>
</g>
<!-- bars, each breathing on its own beat -->
<g transform="translate(0 86)">
  <g>
    <animateTransform attributeName="transform" type="scale" values="1 .53;1 1;1 .53" dur="3.2s"
                      repeatCount="indefinite" {EASE}/>
    <rect x="86" y="-34" width="10" height="34" rx="4" fill="{CY}" fill-opacity=".28"/>
  </g>
  <g>
    <animateTransform attributeName="transform" type="scale" values="1 .65;1 1;1 .65" dur="3.2s"
                      begin="-1.1s" repeatCount="indefinite" {EASE}/>
    <rect x="102" y="-46" width="10" height="46" rx="4" fill="{CY}" fill-opacity=".55"/>
  </g>
  <g>
    <animateTransform attributeName="transform" type="scale" values="1 .71;1 1;1 .71" dur="3.2s"
                      begin="-2.2s" repeatCount="indefinite" {EASE}/>
    <rect x="118" y="-56" width="10" height="56" rx="4" fill="{CY}"/>
  </g>
</g>
<rect x="82" y="88" width="50" height="2" rx="1" fill="{LINE}"/>
'''

# ── 5 · Starter store ──────────────────────────────────────────────────────
# The first shop: a bag, and an order arriving in it.
ICONS["sv-starter"] = f'''
<path d="M44 42h72l-6 56a10 10 0 0 1-10 9H60a10 10 0 0 1-10-9z"
      fill="{SURF}" stroke="{CY}" stroke-width="2" stroke-linejoin="round"/>
<path d="M44 42h72l-6 56a10 10 0 0 1-10 9H60a10 10 0 0 1-10-9z" fill="{CY}" fill-opacity=".07"/>
{glow("M64 46V32a16 16 0 0 1 32 0v14", CY, 2, .18, 6)}
<g>
  <animateTransform attributeName="transform" type="translate" values="0 0;0 -4;0 0"
                    dur="3s" repeatCount="indefinite" {EASE}/>
  <rect x="66" y="62" width="28" height="20" rx="4" fill="{PU}" fill-opacity=".3" stroke="{PU}" stroke-width="1.5"/>
  <rect x="72" y="69" width="16" height="3" rx="1.5" fill="{PU}"/>
</g>
<!-- the order landing -->
<g>
  <circle cx="112" cy="40" r="13" fill="{SURF}" stroke="{PK}" stroke-width="2"/>
  <path d="M106 40.5l4.4 4.4L119 36" fill="none" stroke="{PK}" stroke-width="2.4"
        stroke-linecap="round" stroke-linejoin="round"/>
  <animateTransform attributeName="transform" type="scale" values="0;1.12;1;1;0"
                    keyTimes="0;.16;.24;.86;1" dur="3.6s" repeatCount="indefinite"
                    additive="sum" {EASE1}/>
  <animate attributeName="opacity" values="0;1;1;0" keyTimes="0;.16;.86;1" dur="3.6s" repeatCount="indefinite"/>
</g>
<g fill="{CY}">
  <circle cx="40" cy="30" r="2.4"><animate attributeName="opacity" values=".2;1;.2" dur="2.2s" repeatCount="indefinite"/></circle>
  <circle cx="126" cy="76" r="1.8"><animate attributeName="opacity" values="1;.2;1" dur="2.6s" repeatCount="indefinite"/></circle>
</g>
'''

# ── 6 · Custom Shopify store ───────────────────────────────────────────────
# Presentation is the product: a lit plinth in a shop window, with the code
# that built it either side.
ICONS["sv-shopcustom"] = f'''
<path d="M28 34l8-16h88l8 16z" fill="{PU}" fill-opacity=".22" stroke="{PU}" stroke-width="1.6" stroke-linejoin="round"/>
<rect x="28" y="34" width="104" height="66" rx="8" fill="{SURF}" stroke="{LINE}" stroke-width="1.6"/>
<!-- beam -->
<path d="M80 34l22 52H58z" fill="{CY}" fill-opacity=".1">
  <animate attributeName="fill-opacity" values=".05;.2;.05" dur="3.4s" repeatCount="indefinite" {EASE}/>
</path>
<g>
  <animateTransform attributeName="transform" type="rotate" values="-7 80 34;7 80 34;-7 80 34"
                    dur="4.6s" repeatCount="indefinite" {EASE}/>
  <path d="M80 34l14 50H66z" fill="{CY}" fill-opacity=".16"/>
</g>
<!-- plinth and product -->
<ellipse cx="80" cy="86" rx="20" ry="5" fill="{CY}" fill-opacity=".16"/>
<g>
  <animateTransform attributeName="transform" type="translate" values="0 0;0 -3;0 0"
                    dur="3.4s" repeatCount="indefinite" {EASE}/>
  <path d="M70 78V60l10-6 10 6v18l-10 6z" fill="{SURF2}" stroke="{CY}" stroke-width="1.8" stroke-linejoin="round"/>
  <path d="M70 60l10 6 10-6M80 66v18" fill="none" stroke="{CY}" stroke-width="1.3" stroke-opacity=".6"/>
</g>
<g stroke="{PU}" stroke-width="2" fill="none" stroke-linecap="round" stroke-linejoin="round">
  <path d="M46 54l-8 8 8 8"><animate attributeName="stroke-opacity" values=".45;1;.45" dur="2.8s" repeatCount="indefinite"/></path>
  <path d="M114 54l8 8-8 8"><animate attributeName="stroke-opacity" values="1;.45;1" dur="2.8s" repeatCount="indefinite"/></path>
</g>
'''

# ── 7 · Move to Shopify ────────────────────────────────────────────────────
# Everything crosses: the old platform empties as the new one fills.
ICONS["sv-migrate"] = f'''
<rect x="16" y="52" width="46" height="42" rx="8" fill="{SURF}" stroke="{LINE}" stroke-width="1.6"/>
<rect x="98" y="52" width="46" height="42" rx="8" fill="{SURF}" stroke="{CY}" stroke-width="1.8"/>
<rect x="98" y="52" width="46" height="42" rx="8" fill="{CY}" fill-opacity=".08"/>
<g fill="{LINE}">
  <rect x="24" y="62" width="30" height="4" rx="2"/>
  <rect x="24" y="71" width="20" height="4" rx="2"/>
  <rect x="24" y="80" width="26" height="4" rx="2"/>
</g>
<g fill="{CY}">
  <rect x="106" y="62" width="30" height="4" rx="2" fill-opacity=".35">
    <animate attributeName="fill-opacity" values=".12;.12;.9" dur="4.2s" repeatCount="indefinite"/>
  </rect>
  <rect x="106" y="71" width="20" height="4" rx="2" fill-opacity=".35">
    <animate attributeName="fill-opacity" values=".12;.12;.9" dur="4.2s" begin="-1.4s" repeatCount="indefinite"/>
  </rect>
  <rect x="106" y="80" width="26" height="4" rx="2" fill-opacity=".35">
    <animate attributeName="fill-opacity" values=".12;.12;.9" dur="4.2s" begin="-2.8s" repeatCount="indefinite"/>
  </rect>
</g>
<path d="M58 46C68 20 92 20 102 46" fill="none" stroke="{PU}" stroke-width="1.4"
      stroke-dasharray="4 5" stroke-opacity=".6"/>
<path d="M96 40l7 7-8 6" fill="none" stroke="{PU}" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
<g fill="{CY}">
  <rect x="-4" y="-4" width="8" height="8" rx="2.5" opacity="0">
    <animateMotion dur="4.2s" repeatCount="indefinite" path="M58 46C68 20 92 20 102 46" {EASE1}/>
    <animate attributeName="opacity" values="0;1;1;0" keyTimes="0;.12;.86;1" dur="4.2s" repeatCount="indefinite"/>
  </rect>
  <rect x="-4" y="-4" width="8" height="8" rx="2.5" opacity="0">
    <animateMotion dur="4.2s" begin="-1.4s" repeatCount="indefinite" path="M58 46C68 20 92 20 102 46" {EASE1}/>
    <animate attributeName="opacity" values="0;1;1;0" keyTimes="0;.12;.86;1" dur="4.2s" begin="-1.4s" repeatCount="indefinite"/>
  </rect>
  <rect x="-4" y="-4" width="8" height="8" rx="2.5" opacity="0">
    <animateMotion dur="4.2s" begin="-2.8s" repeatCount="indefinite" path="M58 46C68 20 92 20 102 46" {EASE1}/>
    <animate attributeName="opacity" values="0;1;1;0" keyTimes="0;.12;.86;1" dur="4.2s" begin="-2.8s" repeatCount="indefinite"/>
  </rect>
</g>
'''

# ── 8 · Connect your tools ─────────────────────────────────────────────────
# The store at the centre, and traffic running out to each thing it talks to.
ICONS["sv-integrate"] = f'''
<g stroke="{LINE}" stroke-width="1.4" fill="none" stroke-opacity=".8">
  <path id="in-a" d="M80 46C80 30 58 30 44 30"/>
  <path id="in-b" d="M80 46C80 28 104 28 120 34"/>
  <path id="in-c" d="M80 74C80 92 54 92 40 88"/>
  <path id="in-d" d="M80 74C80 94 106 94 122 86"/>
</g>
<g>
  <circle cx="44" cy="30" r="12" fill="{SURF2}" stroke="{PU}" stroke-width="1.6"/>
  <path d="M39 30l3.6 3.6L50 26" fill="none" stroke="{PU}" stroke-width="1.9" stroke-linecap="round" stroke-linejoin="round"/>
  <circle cx="120" cy="34" r="12" fill="{SURF2}" stroke="{CY}" stroke-width="1.6"/>
  <path d="M114 34h12M120 28v12" stroke="{CY}" stroke-width="1.9" stroke-linecap="round"/>
  <circle cx="40" cy="88" r="12" fill="{SURF2}" stroke="{CY}" stroke-width="1.6"/>
  <rect x="34" y="83" width="12" height="10" rx="2.5" fill="none" stroke="{CY}" stroke-width="1.6"/>
  <circle cx="122" cy="86" r="12" fill="{SURF2}" stroke="{PU}" stroke-width="1.6"/>
  <path d="M116 86a6 6 0 1 1 3 5l-3.4 1 1-3.4" fill="none" stroke="{PU}" stroke-width="1.6" stroke-linejoin="round"/>
</g>
<!-- hub -->
<g transform="translate(80 60)">
  <g>
    <animateTransform attributeName="transform" type="scale" values=".67;1" dur="3s"
                      repeatCount="indefinite" {EASE1}/>
    <circle r="30" fill="none" stroke="{CY}" stroke-width="1.2" vector-effect="non-scaling-stroke">
      <animate attributeName="stroke-opacity" values=".4;0" dur="3s" repeatCount="indefinite"/>
    </circle>
  </g>
</g>
<rect x="60" y="44" width="40" height="32" rx="9" fill="{SURF}" stroke="{CY}" stroke-width="2"/>
<path d="M70 60h20M80 50v20" stroke="{CY}" stroke-width="2" stroke-linecap="round" stroke-opacity=".9"/>
<g fill="{CY}">
  <circle r="2.6" opacity="0"><animateMotion dur="2.4s" repeatCount="indefinite"><mpath href="#in-a"/></animateMotion>
    <animate attributeName="opacity" values="0;1;0" dur="2.4s" repeatCount="indefinite"/></circle>
  <circle r="2.6" opacity="0"><animateMotion dur="2.4s" begin="-0.6s" repeatCount="indefinite"><mpath href="#in-b"/></animateMotion>
    <animate attributeName="opacity" values="0;1;0" dur="2.4s" begin="-0.6s" repeatCount="indefinite"/></circle>
  <circle r="2.6" fill="{PU}" opacity="0"><animateMotion dur="2.4s" begin="-1.2s" repeatCount="indefinite"><mpath href="#in-c"/></animateMotion>
    <animate attributeName="opacity" values="0;1;0" dur="2.4s" begin="-1.2s" repeatCount="indefinite"/></circle>
  <circle r="2.6" fill="{PU}" opacity="0"><animateMotion dur="2.4s" begin="-1.8s" repeatCount="indefinite"><mpath href="#in-d"/></animateMotion>
    <animate attributeName="opacity" values="0;1;0" dur="2.4s" begin="-1.8s" repeatCount="indefinite"/></circle>
</g>
'''

# ── 9 · WordPress landing page ─────────────────────────────────────────────
# The point is that you edit it: a line being typed, with the caret still in it.
ICONS["sv-wplanding"] = f'''
<rect x="34" y="14" width="92" height="92" rx="9" fill="{SURF}" stroke="{LINE}" stroke-width="1.6"/>
<path d="M34 23a9 9 0 0 1 9-9h74a9 9 0 0 1 9 9v8H34z" fill="{SURF2}"/>
<circle cx="43" cy="22.5" r="2" fill="{PK}" fill-opacity=".7"/>
<circle cx="50" cy="22.5" r="2" fill="{PU}" fill-opacity=".7"/>
<rect x="46" y="42" width="52" height="6" rx="3" fill="{INK}" fill-opacity=".8"/>
<!-- the line being typed, with its caret -->
<g transform="translate(46 0)">
  <g>
    <animateTransform attributeName="transform" type="scale" values="0 1;1 1;1 1;0 1" keyTimes="0;.55;.85;1"
                      dur="4.4s" repeatCount="indefinite" calcMode="spline"
                      keySplines="0.6 0 0.3 1;0 0 1 1;0.6 0 0.3 1"/>
    <rect x="0" y="58" width="60" height="5" rx="2.5" fill="{CY}"/>
  </g>
</g>
<g transform="translate(46 0)">
  <animateTransform attributeName="transform" type="translate" values="46 0;106 0;106 0;46 0"
                    keyTimes="0;.55;.85;1" dur="4.4s" repeatCount="indefinite" calcMode="spline"
                    keySplines="0.6 0 0.3 1;0 0 1 1;0.6 0 0.3 1"/>
  <rect x="0" y="55.5" width="2" height="10" rx="1" fill="{INK}">
    <animate attributeName="opacity" values="1;1;0;1;0;1" dur="1.1s" repeatCount="indefinite"/>
  </rect>
</g>
<rect x="46" y="72" width="40" height="5" rx="2.5" fill="{LINE}"/>
<rect x="46" y="86" width="30" height="11" rx="5.5" fill="{PU}" fill-opacity=".22" stroke="{PU}" stroke-width="1.4"/>
<!-- pencil -->
<g>
  <animateTransform attributeName="transform" type="translate" values="0 0;2.5 -2.5;0 0"
                    dur="2.6s" repeatCount="indefinite" {EASE}/>
  <path d="M110 76l14-14 8 8-14 14-10 2z" fill="{SURF2}" stroke="{CY}" stroke-width="1.7" stroke-linejoin="round"/>
  <path d="M118 68l8 8" stroke="{CY}" stroke-width="1.4"/>
</g>
'''

# ── 10 · Portfolio website ─────────────────────────────────────────────────
# A gallery whose front piece keeps changing, because you keep adding to it.
ICONS["sv-wpportfolio"] = f'''
<g>
  <rect x="34" y="26" width="64" height="52" rx="8" fill="{SURF}" stroke="{LINE}" stroke-width="1.5" opacity=".45"/>
  <rect x="44" y="34" width="72" height="58" rx="8" fill="{SURF}" stroke="{LINE}" stroke-width="1.5" opacity=".7"/>
</g>
<!-- front frame; the picture inside it cycles -->
<rect x="54" y="42" width="72" height="58" rx="8" fill="{SURF2}" stroke="{CY}" stroke-width="1.8"/>
<clipPath id="pf-clip"><rect x="55" y="43" width="70" height="56" rx="7"/></clipPath>
<g clip-path="url(#pf-clip)">
  <g>
    <animate attributeName="opacity" values="1;1;0;0;0;1" dur="6s" repeatCount="indefinite"/>
    <circle cx="72" cy="60" r="7" fill="{CY}" fill-opacity=".8"/>
    <path d="M55 92l20-22 16 16 12-11 22 21z" fill="{PU}" fill-opacity=".5"/>
  </g>
  <g opacity="0">
    <animate attributeName="opacity" values="0;0;1;1;0;0" dur="6s" repeatCount="indefinite"/>
    <rect x="64" y="52" width="24" height="24" rx="4" fill="{PU}" fill-opacity=".65"/>
    <rect x="94" y="62" width="22" height="30" rx="4" fill="{CY}" fill-opacity=".55"/>
    <rect x="64" y="82" width="24" height="10" rx="4" fill="{CY}" fill-opacity=".35"/>
  </g>
  <g opacity="0">
    <animate attributeName="opacity" values="0;0;0;0;1;0" dur="6s" repeatCount="indefinite"/>
    <path d="M55 99V72l18 10 16-18 14 12 22-16v39z" fill="{CY}" fill-opacity=".45"/>
    <circle cx="102" cy="58" r="8" fill="{PK}" fill-opacity=".6"/>
  </g>
</g>
<g fill="{CY}">
  <circle cx="72" cy="110" r="3"><animate attributeName="fill-opacity" values="1;.25;.25;1" dur="6s" repeatCount="indefinite"/></circle>
  <circle cx="84" cy="110" r="3"><animate attributeName="fill-opacity" values=".25;1;.25;.25" dur="6s" repeatCount="indefinite"/></circle>
  <circle cx="96" cy="110" r="3"><animate attributeName="fill-opacity" values=".25;.25;1;.25" dur="6s" repeatCount="indefinite"/></circle>
</g>
'''

# ── 11 · WordPress business site ───────────────────────────────────────────
# Staff editing it without a developer: two cursors working different blocks.
ICONS["sv-wpbusiness"] = f'''
<rect x="20" y="20" width="120" height="80" rx="10" fill="{SURF}" stroke="{LINE}" stroke-width="1.6"/>
<path d="M20 30a10 10 0 0 1 10-10h100a10 10 0 0 1 10 10v7H20z" fill="{SURF2}"/>
<rect x="30" y="49" width="48" height="18" rx="5" fill="none" stroke="{CY}" stroke-width="1.6" stroke-dasharray="5 4">
  <animate attributeName="stroke-opacity" values=".35;1;.35" dur="3s" repeatCount="indefinite"/>
</rect>
<rect x="36" y="55" width="30" height="5" rx="2.5" fill="{CY}" fill-opacity=".7"/>
<rect x="86" y="49" width="44" height="18" rx="5" fill="none" stroke="{PU}" stroke-width="1.6" stroke-dasharray="5 4">
  <animate attributeName="stroke-opacity" values="1;.35;1" dur="3s" repeatCount="indefinite"/>
</rect>
<rect x="92" y="55" width="26" height="5" rx="2.5" fill="{PU}" fill-opacity=".7"/>
<rect x="30" y="76" width="60" height="4" rx="2" fill="{LINE}"/>
<rect x="30" y="86" width="42" height="4" rx="2" fill="{LINE}"/>
<!-- two people, each on their own block -->
<g>
  <animateTransform attributeName="transform" type="translate" values="0 0;6 5;0 0"
                    dur="4s" repeatCount="indefinite" {EASE}/>
  <path d="M62 60l11 4.6-4.4 1.5-1.5 4.4z" fill="{CY}" stroke="{SURF}" stroke-width="1.2" stroke-linejoin="round"/>
</g>
<g>
  <animateTransform attributeName="transform" type="translate" values="0 0;-7 4;0 0"
                    dur="4s" begin="-2s" repeatCount="indefinite" {EASE}/>
  <path d="M118 58l11 4.6-4.4 1.5-1.5 4.4z" fill="{PU}" stroke="{SURF}" stroke-width="1.2" stroke-linejoin="round"/>
</g>
'''

# ── 12 · Services website ──────────────────────────────────────────────────
# A page per service, and the local search that has to find them.
ICONS["sv-wpservices"] = f'''
<g>
  <rect x="24" y="40" width="46" height="58" rx="7" fill="{SURF}" stroke="{LINE}" stroke-width="1.5" opacity=".5"
        transform="rotate(-8 47 69)"/>
  <rect x="30" y="36" width="46" height="58" rx="7" fill="{SURF}" stroke="{LINE}" stroke-width="1.5" opacity=".75"
        transform="rotate(-4 53 65)"/>
</g>
<rect x="38" y="32" width="46" height="58" rx="7" fill="{SURF2}" stroke="{CY}" stroke-width="1.7"/>
<g fill="{CY}">
  <rect x="46" y="42" width="24" height="4" rx="2" fill-opacity=".9"/>
  <rect x="46" y="52" width="30" height="3" rx="1.5" fill-opacity=".3"/>
  <rect x="46" y="60" width="22" height="3" rx="1.5" fill-opacity=".3"/>
  <rect x="46" y="74" width="20" height="8" rx="4" fill-opacity=".22"/>
</g>
<!-- the pin dropping onto the map -->
<ellipse cx="112" cy="88" rx="18" ry="6" fill="{PU}" fill-opacity=".14"/>
<g transform="translate(112 88)">
  <g>
    <animateTransform attributeName="transform" type="scale" values=".18;1" dur="2.8s" begin="0.5s"
                      repeatCount="indefinite" {EASE1}/>
    <circle r="22" fill="none" stroke="{PU}" stroke-width="1.8" vector-effect="non-scaling-stroke">
      <animate attributeName="stroke-opacity" values=".8;0" dur="2.8s" begin="0.5s" repeatCount="indefinite"/>
    </circle>
  </g>
</g>
<g>
  <animateTransform attributeName="transform" type="translate" values="0 -22;0 0;0 0;0 -22"
                    keyTimes="0;.18;.82;1" dur="2.8s" repeatCount="indefinite"
                    calcMode="spline" keySplines="0.5 0 0.2 1;0 0 1 1;0.5 0 0.2 1"/>
  <path d="M112 84c-7-9-11-13-11-19a11 11 0 0 1 22 0c0 6-4 10-11 19z"
        fill="{PU}" fill-opacity=".28" stroke="{PU}" stroke-width="1.9" stroke-linejoin="round"/>
  <circle cx="112" cy="65" r="4.4" fill="{CY}"/>
</g>
'''

# ── 13 · Website control panel ─────────────────────────────────────────────
# Everything on the site, on switches you can reach.
ICONS["sv-cms"] = f'''
<rect x="22" y="22" width="116" height="76" rx="10" fill="{SURF}" stroke="{LINE}" stroke-width="1.6"/>
<path d="M22 32a10 10 0 0 1 10-10h20v76H32a10 10 0 0 1-10-10z" fill="{SURF2}"/>
<g fill="{CY}">
  <rect x="31" y="36" width="12" height="4" rx="2" fill-opacity=".9"/>
  <rect x="31" y="48" width="12" height="4" rx="2" fill-opacity=".3"/>
  <rect x="31" y="60" width="12" height="4" rx="2" fill-opacity=".3"/>
  <rect x="31" y="72" width="12" height="4" rx="2" fill-opacity=".3"/>
</g>
<!-- two switches -->
<g>
  <rect x="64" y="36" width="30" height="15" rx="7.5" fill="{CY}" fill-opacity=".2" stroke="{CY}" stroke-width="1.5"/>
  <g transform="translate(71.5 43.5)">
    <animateTransform attributeName="transform" type="translate"
                      values="71.5 43.5;86.5 43.5;86.5 43.5;71.5 43.5;71.5 43.5" keyTimes="0;.18;.5;.68;1"
                      dur="4.4s" repeatCount="indefinite" {EASE}/>
    <circle r="5" fill="{CY}"/>
  </g>
</g>
<g>
  <rect x="64" y="58" width="30" height="15" rx="7.5" fill="{PU}" fill-opacity=".2" stroke="{PU}" stroke-width="1.5"/>
  <g transform="translate(86.5 65.5)">
    <animateTransform attributeName="transform" type="translate"
                      values="86.5 65.5;71.5 65.5;71.5 65.5;86.5 65.5;86.5 65.5" keyTimes="0;.2;.55;.72;1"
                      dur="4.4s" repeatCount="indefinite" {EASE}/>
    <circle r="5" fill="{PU}"/>
  </g>
</g>
<!-- a slider -->
<rect x="64" y="83" width="60" height="4" rx="2" fill="{LINE}"/>
<g transform="translate(64 0)">
  <g>
    <animateTransform attributeName="transform" type="scale" values=".267 1;.767 1;.267 1" dur="5s"
                      repeatCount="indefinite" {EASE}/>
    <rect x="0" y="83" width="60" height="4" rx="2" fill="{CY}"/>
  </g>
</g>
<g transform="translate(80 85)">
  <animateTransform attributeName="transform" type="translate" values="80 85;110 85;80 85" dur="5s"
                    repeatCount="indefinite" {EASE}/>
  <circle r="6" fill="{SURF2}" stroke="{CY}" stroke-width="2"/>
</g>
<g fill="{LINE}">
  <rect x="104" y="38" width="20" height="4" rx="2"/>
  <rect x="104" y="60" width="14" height="4" rx="2"/>
</g>
'''

# ── 14 · Business automation ───────────────────────────────────────────────
# The daily job, running without anyone starting it.
ICONS["sv-bizauto"] = f'''
<g>
  <animateTransform attributeName="transform" type="rotate" from="0 54 46" to="360 54 46"
                    dur="9s" repeatCount="indefinite"/>
  <path d="M54 22l3.6.6 2.6-2.6 3 2.2-.9 3.6 2.6 2.6 3.6-.9 2.2 3-2.6 2.6.6 3.6 3.6 1.3v3.7l-3.6 1.3-.6 3.6 2.6 2.6-2.2 3-3.6-.9-2.6 2.6.9 3.6-3 2.2-2.6-2.6-3.6.6-1.3 3.6h-3.7L48 62l-3.6-.6-2.6 2.6-3-2.2.9-3.6-2.6-2.6-3.6.9-2.2-3 2.6-2.6-.6-3.6L30 46v-3.7l3.6-1.3.6-3.6-2.6-2.6 2.2-3 3.6.9 2.6-2.6-.9-3.6 3-2.2 2.6 2.6 3.6-.6L50 22z"
        fill="{PU}" fill-opacity=".16" stroke="{PU}" stroke-width="1.8" stroke-linejoin="round"/>
  <circle cx="54" cy="44" r="9" fill="{SURF}" stroke="{PU}" stroke-width="1.8"/>
</g>
<g>
  <animateTransform attributeName="transform" type="rotate" from="360 96 74" to="0 96 74"
                    dur="6s" repeatCount="indefinite"/>
  <path d="M96 56l2.8.5 2-2 2.3 1.7-.7 2.8 2 2 2.8-.7 1.7 2.3-2 2 .5 2.8 2.8 1v2.9l-2.8 1-.5 2.8 2 2-1.7 2.3-2.8-.7-2 2 .7 2.8-2.3 1.7-2-2-2.8.5-1 2.8h-2.9l-1-2.8-2.8-.5-2 2-2.3-1.7.7-2.8-2-2-2.8.7-1.7-2.3 2-2-.5-2.8-2.8-1v-2.9l2.8-1 .5-2.8-2-2 1.7-2.3 2.8.7 2-2-.7-2.8 2.3-1.7 2 2 2.8-.5 1-2.8z"
        fill="{CY}" fill-opacity=".16" stroke="{CY}" stroke-width="1.7" stroke-linejoin="round"/>
  <circle cx="96" cy="72" r="7" fill="{SURF}" stroke="{CY}" stroke-width="1.7"/>
</g>
<!-- the queue clearing itself -->
<g>
  <rect x="112" y="18" width="34" height="10" rx="5" fill="{SURF2}" stroke="{LINE}" stroke-width="1.3"/>
  <path d="M117 23l2.6 2.6L125 20" fill="none" stroke="{CY}" stroke-width="1.9" stroke-linecap="round" stroke-linejoin="round">
    <animate attributeName="stroke-opacity" values="0;1;1;0" keyTimes="0;.14;.9;1" dur="3.6s" repeatCount="indefinite"/>
  </path>
  <rect x="112" y="33" width="34" height="10" rx="5" fill="{SURF2}" stroke="{LINE}" stroke-width="1.3"/>
  <path d="M117 38l2.6 2.6L125 35" fill="none" stroke="{CY}" stroke-width="1.9" stroke-linecap="round" stroke-linejoin="round">
    <animate attributeName="stroke-opacity" values="0;0;1;1;0" keyTimes="0;.3;.44;.9;1" dur="3.6s" repeatCount="indefinite"/>
  </path>
  <rect x="112" y="48" width="34" height="10" rx="5" fill="{SURF2}" stroke="{LINE}" stroke-width="1.3"/>
  <path d="M117 53l2.6 2.6L125 50" fill="none" stroke="{CY}" stroke-width="1.9" stroke-linecap="round" stroke-linejoin="round">
    <animate attributeName="stroke-opacity" values="0;0;1;1;0" keyTimes="0;.6;.74;.9;1" dur="3.6s" repeatCount="indefinite"/>
  </path>
</g>
'''

# ── 15 · AI apps ───────────────────────────────────────────────────────────
# Your own material going in, an answer coming back out.
ICONS["sv-genai"] = f'''
<!-- the document being read -->
<g>
  <animateTransform attributeName="transform" type="translate" values="0 0;16 8;16 8"
                    keyTimes="0;.34;1" dur="4s" repeatCount="indefinite" {EASE}/>
  <animate attributeName="opacity" values="1;1;.15;0" keyTimes="0;.34;.6;1" dur="4s" repeatCount="indefinite"/>
  <rect x="18" y="26" width="32" height="42" rx="5" fill="{SURF2}" stroke="{PU}" stroke-width="1.6"/>
  <g fill="{PU}" fill-opacity=".7">
    <rect x="24" y="34" width="20" height="3" rx="1.5"/>
    <rect x="24" y="42" width="14" height="3" rx="1.5"/>
    <rect x="24" y="50" width="18" height="3" rx="1.5"/>
  </g>
</g>
<!-- the model -->
<g>
  <g transform="translate(80 48)">
    <g>
      <animateTransform attributeName="transform" type="scale" values=".625;1" dur="3.2s"
                        repeatCount="indefinite" {EASE1}/>
      <circle r="32" fill="none" stroke="{CY}" stroke-width="1.2" vector-effect="non-scaling-stroke">
        <animate attributeName="stroke-opacity" values=".45;0" dur="3.2s" repeatCount="indefinite"/>
      </circle>
    </g>
  </g>
  <circle cx="80" cy="48" r="19" fill="{CY}" fill-opacity=".08" stroke="{CY}" stroke-width="1.8"/>
  <g stroke="{CY}" stroke-width="1.4" stroke-opacity=".75" fill="none">
    <path d="M71 41h8M71 48h13M71 55h8"/>
  </g>
  <g>
    <animateTransform attributeName="transform" type="rotate" from="0 80 48" to="360 80 48"
                      dur="7s" repeatCount="indefinite"/>
    <circle cx="80" cy="29" r="3.4" fill="{PK}"/>
    <circle cx="80" cy="67" r="2.4" fill="{PU}"/>
  </g>
</g>
<!-- the answer -->
<g>
  <animateTransform attributeName="transform" type="translate" values="-10 0;0 0;0 0;-10 0"
                    keyTimes="0;.5;.9;1" dur="4s" repeatCount="indefinite" {EASE}/>
  <animate attributeName="opacity" values="0;0;1;1;0" keyTimes="0;.42;.56;.9;1" dur="4s" repeatCount="indefinite"/>
  <path d="M108 62h32a6 6 0 0 1 6 6v16a6 6 0 0 1-6 6h-20l-8 8v-8h-4a6 6 0 0 1-6-6V68a6 6 0 0 1 6-6z"
        fill="{SURF2}" stroke="{CY}" stroke-width="1.7" stroke-linejoin="round"/>
  <g fill="{CY}">
    <g><animateTransform attributeName="transform" type="translate" values="0 0;0 -4;0 0" dur="1.1s" repeatCount="indefinite"/>
      <circle cx="119" cy="76" r="2.6"/></g>
    <g><animateTransform attributeName="transform" type="translate" values="0 0;0 -4;0 0" dur="1.1s" begin="-0.85s" repeatCount="indefinite"/>
      <circle cx="128" cy="76" r="2.6"/></g>
    <g><animateTransform attributeName="transform" type="translate" values="0 0;0 -4;0 0" dur="1.1s" begin="-0.55s" repeatCount="indefinite"/>
      <circle cx="137" cy="76" r="2.6"/></g>
  </g>
</g>
'''


def build():
    """Returns (sprite, bank).

    sprite - the still drawings, under the plain ids the cards reference.
    bank   - a <template> of the same drawings with their timing elements,
             under "--live" ids. Nothing inside a template is rendered, so
             the animations there cost nothing until one is lifted out.
    """
    still, live = [], []
    for name, body in ICONS.items():
        inner = " ".join(line.strip() for line in body.strip().splitlines()
                         if line.strip() and not line.strip().startswith("<!--"))
        live.append(f'<symbol id="{name}--live" viewBox="0 0 160 120">{inner}</symbol>')
        # self-closing timing elements, whichever of the three it is
        flat = re.sub(r"<animate[^>]*/>", "", inner)
        # and the paired form, which only animateMotion uses (it wraps an mpath)
        flat = re.sub(r"<animateMotion[^>]*>.*?</animateMotion>", "", flat, flags=re.S)
        still.append(f'<symbol id="{name}" viewBox="0 0 160 120">{flat}</symbol>')

    sprite = ('<svg class="sv-sprite" aria-hidden="true" focusable="false" '
              'style="position:absolute;width:0;height:0;overflow:hidden">'
              + "".join(still) + "</svg>")
    bank = ('<template id="sv-live">'
            '<svg xmlns="http://www.w3.org/2000/svg">' + "".join(live) + "</svg></template>")
    return sprite, bank


if __name__ == "__main__":
    import pathlib, sys
    sprite, bank = build()
    p = pathlib.Path(__file__).resolve().parent.parent / "index.html"
    t = p.read_text(encoding="utf-8")

    m = re.search(r'<svg class="sv-sprite".*?</svg>', t, re.S)
    if not m:
        sys.exit("sprite not found")
    t = t[:m.start()] + sprite + t[m.end():]

    m = re.search(r'<template id="sv-live">.*?</template>', t, re.S)
    if m:
        t = t[:m.start()] + bank + t[m.end():]
    else:
        t = t.replace("</body>", bank + "</body>", 1)

    p.write_text(t, encoding="utf-8")
    print(f"sprite {len(sprite):,} chars (still) + bank {len(bank):,} chars (animated)")
