import { chromium } from '@playwright/test'
import assert from 'node:assert/strict'
const b = await chromium.launch({channel:'msedge',headless:true})
try {
 const page = await b.newPage({viewport:{width:320,height:760}})
 const outbound=[];page.on('request',r=>{if(/^https?:/.test(r.url()))outbound.push(r.url())})
 await page.goto(process.env.DEMO_URL)
 await page.waitForFunction(()=>!document.querySelector('.action-grid button').disabled)
 console.log('320px layout', await page.evaluate(()=>({viewport:innerWidth,content:document.documentElement.scrollWidth})))
 console.log(await page.evaluate(()=>Array.from(document.querySelectorAll('body *')).filter(e=>e.getBoundingClientRect().right>innerWidth+1).map(e=>({tag:e.tagName,cls:e.className,width:e.getBoundingClientRect().width,right:e.getBoundingClientRect().right})).slice(0,15)))
 assert.equal(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth),true)
 await page.getByText('View the original character sheet',{exact:true}).click()
 await page.waitForFunction(() => document.querySelector('.reference-details img')?.naturalWidth === 1536)
 assert.equal(await page.locator('.reference-details img').evaluate(e=>e.naturalWidth),1536)
 assert.deepEqual(outbound,[])
 console.log('PASS: 320px layout, embedded original reference, zero external requests')
} finally { await b.close() }
