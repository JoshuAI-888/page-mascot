import { readFile, writeFile } from 'node:fs/promises'
const source = await readFile('src/mascot.tsx')
const target = 'skills/page-mascot/mascot.tsx'
if (process.argv.includes('--check')) {
  if (!source.equals(await readFile(target))) throw new Error('Skill component is out of sync; run npm run sync:skill')
} else await writeFile(target, source)
