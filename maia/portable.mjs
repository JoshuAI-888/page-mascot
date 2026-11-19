import { readFile, readdir, writeFile, mkdir } from 'node:fs/promises'
import path from 'node:path'
const build = path.resolve('maia-build')
const dest = path.resolve(process.argv[2] || 'maia-build/Maia-Demo.html')
const assets = path.join(build, 'assets')
const files = await readdir(assets)
const mime = { '.webp':'image/webp', '.png':'image/png', '.svg':'image/svg+xml', '.ttf':'font/ttf', '.woff2':'font/woff2' }
const embedded = new Map()
for (const name of files) {
  if (mime[path.extname(name)]) embedded.set(name, `data:${mime[path.extname(name)]};base64,${(await readFile(path.join(assets,name))).toString('base64')}`)
}
let js = await readFile(path.join(assets, files.find(x => x.endsWith('.js'))), 'utf8')
js = js.replace(/new URL\(([`"'])([^`"']+)\1,\s*import\.meta\.url\)\.href/g, (all, _quote, name) => embedded.has(name) ? JSON.stringify(embedded.get(name)) : all)
// Vite wraps URL-based library assets in an additional absolute URL expression.
js = js.replace(/new URL\(("data:[^"]+"),\s*(?:``|"")\s*\+\s*import\.meta\.url\)\.href/g, '$1')
if (js.includes('import.meta.url')) throw new Error('Unresolved portable asset')
let css = await readFile(path.join(assets, files.find(x => x.endsWith('.css'))), 'utf8')
css = css.replace(/url\(([^)]+)\)/g, (all, value) => { const name=path.basename(value.replace(/['"]/g,'')); return embedded.has(name) ? `url("${embedded.get(name)}")` : all })
const html = `<!doctype html><html lang="en-NZ"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>Māia · The Collaborator</title><style>${css}</style></head><body><div id="root"></div><script type="module">${js.replace(/<\/script/gi,'<\\/script')}</script></body></html>`
await mkdir(path.dirname(dest),{recursive:true})
await writeFile(dest,html)
console.log(`Portable demo: ${dest} (${(Buffer.byteLength(html)/1048576).toFixed(2)} MB)`)
