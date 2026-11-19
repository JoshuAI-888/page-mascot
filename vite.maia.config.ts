import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
export default defineConfig({ root: 'maia', base: './', publicDir: false, plugins: [react()], build: { outDir: '../maia-build', emptyOutDir: true }, server: { host: '127.0.0.1' } })
