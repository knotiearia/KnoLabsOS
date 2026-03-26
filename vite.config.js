import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import path from 'path'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  server: {
    port: 3000,
    host: true,
    fs: {
      // Allow serving files from the workspace directory
      allow: [
        path.resolve(__dirname, '.'),
        path.resolve('/workspace')
      ]
    }
  },
  build: {
    outDir: 'dist',
    sourcemap: true
  }
})
