<img src=".github/fox.png" width="160" alt="">

# page-mascot

An interactive character that watches the cursor and blinks when you poke it.

**[See the fifty-two &rarr;](https://koboyo.com/page-mascot)**

## Māia — optimized webpage companion

This fork includes **Māia 02, The Collaborator**, with all **28 actions/reactions**, nine
gaze directions, compact WebP artwork and lazy loading. It pauses offscreen/in hidden
tabs and respects reduced motion. Initial artwork is 173 KB; all five sheets total 487 KB.

Install this fork (the upstream npm package does not include Māia):

```sh
npm install github:JoshuAI-888/page-mascot
```

```tsx
import { MaiaCompanion } from 'page-mascot/maia'

<MaiaCompanion expression="Welcoming" />
```

For **plain HTML / WordPress**, run `npm ci` and `npm run build:maia:web`, copy `web/`
to your site's `/maia/` directory, then add:

```html
<script type="module" src="/maia/maia.js"></script>
<maia-mascot size="118"></maia-mascot>
```

**[Full integration guide, expression list and examples →](docs/maia.md)**

The larger character studio is available with `npm run dev:maia`. Artwork is a review
candidate: minor feather/scarf variation and stepped motion remain. See
[artwork provenance and rights](maia/ARTWORK.md).

## Install

```bash
npm i page-mascot
```

## Use existing mascots

Pick a character on the [demo page](https://koboyo.com/page-mascot) and download its two
sheets into `public/mascots`, then point the component at them:

```tsx
import { Mascot } from 'page-mascot'

<Mascot
  directions="/mascots/fox-directions.webp"
  reactions="/mascots/fox-reactions.webp"
/>
```

The paths are whatever your app serves, so imported images work too.

Or let an agent do it, once the skill below is installed:

```
/page-mascot put the fox on my page
```

## Draw your own

Install the skill:

```bash
npx skills add nilbuild/page-mascot --skill page-mascot --global --yes
```

Then ask your agent:

```
/page-mascot a chibi otter with chocolate-brown fur
/page-mascot make one that looks like me        [attach a photo]
/page-mascot a chibi fox, in the riso style
```

It draws the nine directions and nine expressions, builds them into two aligned sheets,
checks the character does not jump between them, and puts the component on your page, with
the same two props as above.

Drawing needs an image tool. Codex has its own; Claude Code goes through the OpenAI images
API:

```bash
export OPENAI_API_KEY=sk-...
```

Or take the [prompts](skills/page-mascot/reference/prompts.md) and use them in any chat
UI.

## Props

| prop | default | |
| --- | --- | --- |
| `directions` | none | path to the directions sheet |
| `reactions` | none | path to the reactions sheet |
| `size` | `140` | px, square |
| `label` | `'mascot'` | what a screen reader calls it |
| `className` | | |
| `actions`, `atlases` | unset | optional named 3×3 sheets for additional states |
| `frame` | unset | controlled `{ sheet, index }` pose |
| `lazy` | `false` | render only the active sheet; preload before changing controlled frames |
| `tracking`, `motion` | `true` | enable pointer tracking / click squash |
| `onBoop` | unset | optional custom click controller |

Tracking switches off without a fine pointer, and the click squash honours
`prefers-reduced-motion`.

## How it works

Each character is two 3×3 sprite sheets: nine head directions, and nine expressions.

![the two sheets that make up one character](.github/sheets.png)

The pointer's angle picks a cell on the directions sheet, with a dead zone so the head
settles when the cursor is close. A click shows a cell from the reactions sheet for half a
second.

The same character can be drawn in six styles: colour, ink, sketch, riso, paper and pixel.
Only the rendering changes, so the alignment holds.

![the same fox drawn in six styles](.github/styles.png)

## License

MIT © [Kamran Ahmed](https://kamran.fyi)
