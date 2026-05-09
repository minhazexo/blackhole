import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'

export default defineConfig(({ mode }) => ({
  base: mode === 'github' ? '/blackhole/' : '/',

  plugins: [react(), tailwindcss()],

  server: {
    host: true,
    port: 3000
  }
}))