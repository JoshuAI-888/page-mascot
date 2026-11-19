import { cp } from 'node:fs/promises'
await cp('src/maia/assets', 'dist/maia/assets', { recursive: true })
