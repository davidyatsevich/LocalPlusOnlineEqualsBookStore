import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vite.dev/config/
export default defineConfig({
  // A3 fix: the React plugin was imported but never applied, so JSX never compiled.
  plugins: [react()],
  server: {
    proxy: {
      // Forward API calls to the Fastify backend during development.
      "/api": "http://localhost:8000",
    },
  },
})
