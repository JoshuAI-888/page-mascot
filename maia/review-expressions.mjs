import { chromium } from '@playwright/test'
import { mkdir } from 'node:fs/promises'
import assert from 'node:assert/strict'
const out = process.env.EVIDENCE_DIR || 'maia-evidence'
await mkdir(out, { recursive: true })
const browser = await chromium.launch({ channel: 'msedge', headless: true })
try {
  const page = await browser.newPage({ viewport: { width: 1440, height: 1200 } })
  await page.goto(process.env.DEMO_URL)
  await page.waitForFunction(() => !document.querySelector('.action-grid button').disabled)
  await page.getByLabel('Reduced motion', { exact: false }).check()
  await page.getByRole('button', { name: 'Pause', exact: true }).click()
  const expressions = ['Curious','Thinking','Listening','Understanding','Unsure','Encouraging','Proud','Concerned','Welcoming','Celebrating']
  const behaviours = ['Reading','Waiting patiently','Noticing something','Pointing']
  for (const name of [...expressions, ...behaviours]) {
    if (name === 'Reading') await page.getByRole('button', { name: 'On the page', exact: true }).click()
    await page.getByRole('button', { name, exact: true }).click()
    await page.waitForFunction(value => document.querySelector('[data-testid=state]').textContent === `${value} · Paused`, name)
    const bird = page.locator('.stage-bird button')
    assert.equal(await bird.getAttribute('data-sheet'), expressions.includes(name) && name !== 'Celebrating' ? 'expressions' : 'behaviours')
    await page.locator('.stage').screenshot({ path: `${out}/pose-${name.toLowerCase().replaceAll(' ', '-')}.png` })
    if (name === 'Celebrating' || name === 'Pointing') {
      await page.getByRole('button', { name: 'Change stage background' }).click()
      await page.locator('.stage').screenshot({ path: `${out}/dark-${name.toLowerCase()}.png` })
      await page.getByRole('button', { name: 'Change stage background' }).click()
    }
  }
  await page.setViewportSize({ width: 390, height: 844 })
  assert.ok(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth))
  await page.getByRole('button', { name: 'Expressions', exact: true }).click()
  await page.getByRole('button', { name: 'Welcoming', exact: true }).click()
  await page.waitForFunction(() => document.querySelector('[data-testid=state]').textContent === 'Welcoming · Paused')
  await page.screenshot({ path: `${out}/mobile-expressions.png`, fullPage: true })
  console.log('PASS: all 14 new poses use expected artwork, light/dark captures, mobile expression controls')
} finally { await browser.close() }
