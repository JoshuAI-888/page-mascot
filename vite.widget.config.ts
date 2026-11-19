import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
export default defineConfig({ root: 'maia', base: './', publicDir: false, plugins: [react()], build: { outDir: '../maia-widget-build', emptyOutDir: true, rollupOptions: { input: 'maia/widget.html' } } })
