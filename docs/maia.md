# Māia on your webpages

Māia 02, The Collaborator, is available as a React component and a self-hosted HTML element. Both use the same 28 actions/reactions, nine gaze directions and five compact WebP sheets. There are no API keys, video files, analytics or animation-library dependencies.

## React, Vite and Next.js

Install **this fork** to get the Māia entry point. The upstream npm release does not contain it:

```sh
npm install github:JoshuAI-888/page-mascot
```

For reproducible production installs, append `#<commit-sha>` to that GitHub dependency and keep your lockfile. Git installs build the library during preparation; build tools are development dependencies. React is a peer dependency and stays shared with your application.

```tsx
'use client'
import { useRef } from 'react'
import { MaiaCompanion } from 'page-mascot/maia'
import type { MaiaHandle } from 'page-mascot/maia'

export function PageCompanion() {
  const maia = useRef<MaiaHandle>(null)
  return <>
    <button onClick={() => maia.current?.play('Celebrating')}>Celebrate</button>
    <div style={{ position: 'fixed', right: 24, bottom: 24, zIndex: 10 }}>
      <MaiaCompanion ref={maia} />
    </div>
  </>
}
```

Put it where it fits your page and avoid covering important mobile controls. The component itself does not force a fixed position. It renders an empty, reserved-size box on the server, then loads artwork on the client when visible. Next.js interactive parent components should use `'use client'` as above.

For a state change driven by your application, use `<MaiaCompanion expression="Thinking" />`. Changing `expression` plays that sequence once. Use `ref.current.play('Thinking')` to replay the same state, or `reset()` to return to pointer tracking. Calls made while initial artwork is loading are queued; the latest queued call wins. Sequences end at idle; they do not loop indefinitely.

| Prop | Default | Purpose |
|---|---|---|
| `expression` | unset | One of the names below; play when changed |
| `size` | `118` | Square size in CSS pixels; compact artwork is 192 px per pose |
| `idle` | `true` | Occasional blink, glance and other gentle actions |
| `tracking` | `true` | Follow a fine mouse pointer |
| `paused` | `false` | Freeze playback and pointer tracking |
| `reducedMotion` | `false` | Still poses; the device preference always also applies |
| `label` | `Māia` | Accessible mascot name |
| `className`, `style` | unset | Wrapper presentation |
| `assetsBaseUrl` | packaged images | Optional served directory for the five WebP files |
| `onError` | unset | Called if initial or expression artwork fails to load |

If your build tool does not process `new URL(..., import.meta.url)` assets, copy `node_modules/page-mascot/dist/maia/assets/` to `public/mascots/maia/` and set `assetsBaseUrl="/mascots/maia"`. The directory must contain `directions.webp`, `reactions.webp`, `actions.webp`, `expressions.webp` and `behaviours.webp`. A failed image load presents a keyboard-accessible retry button.

## Plain HTML, WordPress and other websites

Build the standalone browser module from this repository:

```sh
npm ci
npm run build:maia:web
```

Copy the **whole `web/` directory** to your site's public `/maia/` directory, including `assets/`. Then add:

```html
<script type="module" src="/maia/maia.js"></script>
<maia-mascot id="maia" size="118"
  style="position:fixed;right:24px;bottom:24px;z-index:10">
</maia-mascot>
```

Use the element's methods after it has been registered:

```js
await customElements.whenDefined('maia-mascot')
const maia = document.querySelector('#maia')
maia.play('Welcoming')
// On a completed task:
maia.play('Celebrating')
// Back to normal:
maia.reset()
```

The `expression` attribute also plays a state: `maia.setAttribute('expression', 'Reading')`. Setting the same attribute again replays it. `idle="false"`, `tracking="false"`, `paused`, `reduced-motion`, `assets-base-url` and `label` correspond to the React props. Remove `paused` to resume. Remove the element to clean up its timers/listeners, or hide it with CSS to suspend it. The element uses an open shadow root to protect its button from host-page styles.

The module exports `MAIA_EXPRESSIONS` and `MaiaMascotElement`. Invalid `play()` names throw a `TypeError`; invalid expression attributes and image failures emit a `maia-error` event with an `Error` in `event.detail`.

An end-to-end example is in `web/index.html` after building (source: `examples/maia.html`). Serve over HTTP(S), for example `python -m http.server 4318` and open `http://localhost:4318/web/`. Browser modules do not reliably work by double-clicking a file. No npm publishing or public hosting is performed by these build commands.

## Expressions

| Group | Names, exactly as passed to `play()` |
|---|---|
| Everyday | `Smile`, `Blink`, `Scratch`, `Look around`, `Bored`, `Excited` |
| Expressions | `Curious`, `Thinking`, `Listening`, `Understanding`, `Unsure`, `Encouraging`, `Proud`, `Concerned`, `Welcoming`, `Celebrating` |
| Page behaviours | `Reading`, `Waiting patiently`, `Noticing something`, `Pointing` |
| Original reactions | `Heart`, `Sparkle`, `Surprised`, `Wink`, `Bashful`, `Sleepy`, `Dizzy`, `Delighted` |

`MAIA_EXPRESSIONS` is a frozen list of all 28 names, and `MaiaExpression` is their TypeScript union. `isMaiaExpression(value)` validates a string. Clicking the bird retains the original blink/payoff timings; four rapid clicks trigger dizzy. The nine gaze directions follow the mouse automatically, including the centre dead zone.

## Performance

- Initial artwork: **172,712 bytes** (directions and reactions).
- All five sheets after every state is used: **487,178 bytes** total. Extra sheets load and decode on first use.
- Decoded RGBA pixel storage: approximately **2.53 MiB initially / 6.33 MiB for all sheets**, before browser/GPU overhead.
- The standalone HTML module includes React and React DOM, approximately **73 KB gzip**, plus artwork. React consumers share their existing React runtime.
- Offscreen initial widgets load no artwork. Offscreen/hidden widgets pause playback and pointer work; reduced-motion mode disables automatic animation and tracking.
- Pose transitions use one timeout at a time; pointer events are coalesced with `requestAnimationFrame`. No continuous idle polling loop.

Use HTTP compression for JavaScript and cache the hashed WebP assets. These are build sizes and local functional checks, not a guarantee about mobile battery, FPS, LCP or INP on a particular host page. Benchmark the actual target site before/after integration.

## Character artwork

The original Māia 02 reference, full-size studio sheets and generation prompts remain in `maia/`. These are **review-candidate sprite poses**, not an approved 3D rig: scarf lettering, feather details and proportions vary slightly, motion is stepped, and the down-right gaze needs refinement. See [artwork provenance and rights](../maia/ARTWORK.md). No frames are mirrored.

`npm run dev:maia` opens the larger motion studio. Use the compact component/browser module on production pages, rather than embedding that entire studio.

## Development checks

```sh
npm run build
npm run typecheck
npm run lint
npm run test:maia
npm run build:maia:web
npm run test:maia:web
```

The browser checks use an isolated headless Edge session and an ephemeral local server, both closed afterward. Set `BROWSER_CHANNEL=chrome` for installed Chrome. The studio has additional interaction checks in `maia/smoke.mjs`. `npm pack` produces a package containing the library, compact artwork, standalone browser bundle and this guide; large studio sources and PNGs stay out of the install package.
