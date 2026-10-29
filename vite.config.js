import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'

// https://vite.dev/config/
export default defineConfig({
  base: '/',
  plugins: [
    react(),
    tailwindcss()
  ],
  server: {
    host: true,
    port: 5174,
    strictPort: true,
    watch: {
      ignored: ['**/release-builds/**', '**/dist/**']
    }
  },
})
