import { createRef } from 'react'
import { createRoot } from 'react-dom/client'
import type { Root } from 'react-dom/client'
import { MaiaCompanion, isMaiaExpression } from '../src/maia/index.js'
import type { MaiaExpression, MaiaHandle } from '../src/maia/index.js'
export { MAIA_EXPRESSIONS } from '../src/maia/index.js'

/** Plain HTML adapter. Repeated play calls replay; removing the element cleans up. */
// oxlint-disable-next-line react/only-export-components -- Browser custom-element entry, not a React Fast Refresh boundary.
export class MaiaMascotElement extends HTMLElement {
  static observedAttributes = ['expression', 'size', 'idle', 'tracking', 'paused', 'reduced-motion', 'assets-base-url', 'label']
  private root: Root | null = null
  private handle = createRef<MaiaHandle>()
  private pending: MaiaExpression | null = null
  private scheduled = false
  connectedCallback() {
    if (!this.root) {
      const shadow = this.shadowRoot || this.attachShadow({ mode: 'open' })
      this.root = createRoot(shadow)
    }
    this.renderMascot()
  }
  disconnectedCallback() { this.root?.unmount(); this.root = null; this.handle.current = null }
  attributeChangedCallback(name: string, previous: string | null, value: string | null) {
    if (name === 'expression' && value && !isMaiaExpression(value)) {
      this.dispatchEvent(new CustomEvent('maia-error', { detail: new Error(`Unknown Māia expression: ${value}`) }))
      return
    }
    if (name === 'expression' && previous === value && value && isMaiaExpression(value)) this.play(value)
    else this.renderMascot()
  }
  play(expression: MaiaExpression) {
    if (!isMaiaExpression(expression)) throw new TypeError(`Unknown Māia expression: ${expression}`)
    if (this.handle.current) this.handle.current.play(expression)
    else this.pending = expression
  }
  reset() { this.pending = null; this.handle.current?.reset() }
  private renderMascot() {
    if (!this.root || this.scheduled) return
    this.scheduled = true
    queueMicrotask(() => {
      this.scheduled = false
      if (!this.root) return
      const expression = this.getAttribute('expression')
      const requestedSize = Number(this.getAttribute('size') || 118)
      const size = Number.isFinite(requestedSize) && requestedSize > 0 ? requestedSize : 118
      this.root.render(<MaiaCompanion ref={handle => {
        this.handle.current = handle
        if (handle && this.pending) { handle.play(this.pending); this.pending = null }
      }} size={size} expression={expression && isMaiaExpression(expression) ? expression : undefined}
        idle={this.getAttribute('idle') !== 'false'} tracking={this.getAttribute('tracking') !== 'false'}
        paused={this.hasAttribute('paused') && this.getAttribute('paused') !== 'false'}
        reducedMotion={this.hasAttribute('reduced-motion') && this.getAttribute('reduced-motion') !== 'false'}
        assetsBaseUrl={this.getAttribute('assets-base-url') ?? undefined} label={this.getAttribute('label') || 'Māia'}
        onError={error => this.dispatchEvent(new CustomEvent('maia-error', { detail: error }))} />)
    })
  }
}
if (!customElements.get('maia-mascot')) customElements.define('maia-mascot', MaiaMascotElement)
