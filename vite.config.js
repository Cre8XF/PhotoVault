import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],
  server: {
    port: 5173,
    host: true, // ← viktig når du bruker custom hosts
    allowedHosts: [
      'pixtr.local', // ← legg til denne
      'localhost',
      '127.0.0.1',
    ],
  },
})
