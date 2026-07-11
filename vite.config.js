import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],
  base: './',
  publicDir: 'public',
  build: {
    sourcemap: true,
    rollupOptions: { output: { manualChunks: { maplibre: ['maplibre-gl'], react: ['react', 'react-dom'] } } }
  }
})
