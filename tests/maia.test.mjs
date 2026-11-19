import test from 'node:test'
import assert from 'node:assert/strict'
import { readFile, readdir } from 'node:fs/promises'
import { createElement } from 'react'
import { renderToString } from 'react-dom/server'
import { MaiaCompanion, MAIA_EXPRESSIONS, isMaiaExpression } from '../dist/maia/index.js'
import { sequences } from '../dist/maia/animation.js'
import { Mascot } from '../dist/index.js'

test('Māia renders a stable 118px placeholder without browser globals', () => {
  assert.equal(typeof document, 'undefined')
  const html = renderToString(createElement(MaiaCompanion, { expression: 'Celebrating' }))
  assert.match(html, /width:118px;height:118px/)
  assert.doesNotMatch(html, /<img|background-image|file:\/\//)
})
test('All 28 public expressions have valid frames and bounded durations', () => {
  assert.equal(MAIA_EXPRESSIONS.length, 28)
  for (const name of MAIA_EXPRESSIONS) {
    assert.ok(isMaiaExpression(name))
    const steps = sequences[name]
    for (const step of steps) {
      assert.ok(['directions','reactions','actions','expressions','behaviours'].includes(step.sheet))
      assert.ok(Number.isInteger(step.index) && step.index >= 0 && step.index < 9)
      assert.ok(step.ms > 0)
    }
    assert.ok(steps.reduce((sum, step) => sum + step.ms, 0) <= 4000)
  }
  for (const value of ['constructor','__proto__','toString','unknown']) assert.equal(isMaiaExpression(value), false)
})
test('Built package contains exactly the five compact WebP sheets', async () => {
  const files = await readdir('dist/maia/assets')
  assert.equal(files.length, 5)
  let bytes = 0
  for (const name of files) {
    const data = await readFile(`dist/maia/assets/${name}`)
    assert.equal(data.subarray(8,12).toString(), 'WEBP')
    bytes += data.length
  }
  assert.equal(bytes, 487178)
})
test('Existing two-sheet component remains SSR-compatible and eager by default', () => {
  const html = renderToString(createElement(Mascot, { directions: '/d.webp', reactions: '/r.webp' }))
  assert.match(html, /\/d.webp/)
  assert.match(html, /\/r.webp/)
  assert.match(html, /data-frame="4"/)
})
