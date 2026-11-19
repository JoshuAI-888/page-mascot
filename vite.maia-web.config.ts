import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import { readFile, writeFile } from 'node:fs/promises'
export default defineConfig({
  base: './', publicDir: false, plugins: [react(), {
    name: 'maia-html-example',
    async closeBundle() {
      const example = await readFile('examples/maia.html', 'utf8')
      await writeFile('web/index.html', example.replace('../web/maia.js', './maia.js'))
    },
  }],
  build: {
    outDir: 'web', emptyOutDir: true, assetsInlineLimit: 0,
    rollupOptions: { input: 'web-src/maia.tsx', preserveEntrySignatures: 'exports-only', output: { entryFileNames: 'maia.js' } },
  },
})
