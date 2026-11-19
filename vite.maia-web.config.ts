import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import { readFile, writeFile } from 'node:fs/promises'
export default defineConfig({
  base: './', publicDir: false, plugins: [react(), {
    name: 'maia-html-example',
    async closeBundle() {
      const example = await readFile('examples/maia.html', 'utf8')
      await writeFile('web/index.html', example.replace('../web/maia.js', './maia.js'))
      const notices = await Promise.all(['LICENSE', 'node_modules/react/LICENSE', 'node_modules/react-dom/LICENSE'].map(file => readFile(file, 'utf8')))
      await writeFile('web/LICENSES.txt', notices.join('\n\n---\n\n'))
      await writeFile('web/ARTWORK.md', await readFile('maia/ARTWORK.md', 'utf8'))
    },
  }],
  build: {
    outDir: 'web', emptyOutDir: true, assetsInlineLimit: 0,
    rollupOptions: { input: 'web-src/maia.tsx', preserveEntrySignatures: 'exports-only', output: { entryFileNames: 'maia.js' } },
  },
})
