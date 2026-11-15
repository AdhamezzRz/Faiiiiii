# Faii the label — design contract

## Brand overview
Faii is a Cairo womenswear label selling limited seasonal drops: outerwear, co-ords and abayas. The customer is a woman in Egypt who buys considered, modest-leaning pieces and follows the label on Instagram. The site should feel like being let into the studio the night before a drop: quiet, dark, close to the clothes.

## Design thesis
The lights go down for winter: a night-coloured stage, a magazine-masthead serif, and one flash of sky blue taken from the lining of the hooded coat.

## Colors
| Name | Value | Token | Role |
| --- | --- | --- | --- |
| Night | `#24150f` | `--w26-night`, scheme-4 | Dark surface: hero, lookbook, header, footer, bag drawer |
| Espresso | `#33201a` | `--w26-espresso`, scheme-5 | Second dark surface: films |
| Bone | `#f3ede4` | `--w26-bone`, scheme-2 | Light surface and text on dark |
| Paper | `#fbf8f3` | `--w26-paper`, scheme-1 | Product and collection pages |
| Ink | `#17100d` | `--w26-ink` | Text on light, primary buttons on light |
| Sky | `#a9c6e2` | `--w26-sky`, scheme-3 | The only accent: countdown, links on dark, hover fills, progress lines |

Sky is punctuation. It never fills a section and never carries body text on a light surface.

## Typography
| Role | Family | Weight | Size | Line height | Tracking | Fallback |
| --- | --- | --- | --- | --- | --- | --- |
| Display (`.w26-display`, h1–h3) | Bodoni Moda | 400 | 30–240px fluid | 0.86–1.06 | −0.02 to −0.035em | Bodoni MT, Didot, Times New Roman, serif |
| Body and UI | Instrument Sans | 400 / 500 | 14–16px | 1.5 | 0 | Helvetica Neue, Arial, sans-serif |
| Buttons, nav | Instrument Sans | 500 | 12px, uppercase | 1 | 0.14–0.18em | as above |
| Meta (`.w26-meta`) | Geist Mono | 400 | 10–11px, uppercase | 1.4 | 0.12–0.14em | ui-monospace, Menlo, monospace |

Display type is sentence case and never italic. Bodoni is not used below about 22px. Uppercase is reserved for buttons, nav and mono meta.

## Spacing and composition
- Page gutter `--w26-pad`: `clamp(20px, 4.2vw, 72px)`. Content max width 1720px.
- Section padding: `clamp(72px, 10vw, 160px)` top and bottom.
- Corner radius is 0 everywhere. No shadows except the studio prints.
- Photography is portrait 2:3. Product photos are white-background studio shots; campaign photos carry the mood. Never crop a product photo to landscape.
- Section headers: display title left, short text right (36ch) on desktop; stacked on phones.

## Components
- **Primary button** (`.w26-btn--solid`): filled with the foreground colour, 54px tall, uppercase 12px; hover fills sky from the bottom; press scales to 0.97.
- **Secondary button** (`.w26-btn`): 1px outline; hover fills with the foreground colour.
- **Text link** (`.w26-link`): uppercase 12px with a 1px underline and an arrow that moves 5px on hover.
- **Product card** (`.w26-card`): 2:3 image, second image on hover, title in Instrument Sans 500, price in muted text.
- **Countdown** (`w26-countdown` snippet): Bodoni numerals in fixed-width cells with mono labels; compact mono version for the drop bar.
- **Drop bar**: 38px night strip above the header, mono 11px, countdown in sky.
- **Header**: theme header, night, logo centred, menu left in uppercase 12px.
- **Footer**: night; newsletter field with a single underline; mono column titles.
- **Bag drawer**: night; Bodoni title; free-delivery meter in sky; portrait thumbnails.
- **Inputs**: square, 1px border, no fill change on focus other than the sky underline or outline.

## Dos and Don'ts
- Do let one idea own each section: film window, colour bands, sideways lookbook, index list, prints.
- Do keep copy short and specific to the garments.
- Do use sky for one thing per view.
- Don't add badges, eyebrow labels, emoji or decorative shapes.
- Don't use rounded corners, gradients as fills, or drop shadows on cards.
- Don't centre long text. Don't set Bodoni in uppercase.
- Don't show a price, discount or stock claim the store data does not back.

## Motion philosophy
Motion is slow and physical, like fabric settling. Entrances rise 20–28px and fade over 0.7–0.9s on `cubic-bezier(0.16, 1, 0.3, 1)`; large surfaces use `cubic-bezier(0.32, 0.72, 0, 1)`. Only `transform`, `opacity`, `clip-path` and `filter` are animated, driven by one scroll loop and IntersectionObservers. Everything interactive has press feedback. Under `prefers-reduced-motion` there are no entrances, no parallax, no pinned scrolling and no opening sequence.

## Drop mechanics
The drop time lives in Theme settings > Winter 27 drop. Before it, the site shows the countdown and locked states; after it, `html.w26-live` switches every `[data-w26-pre]` / `[data-w26-post]` pair. Product links and prices appear on their own as soon as the products are published.
