import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// Configure Vite, the tool that runs and builds the React frontend.
export default defineConfig({
  plugins: [react()],
  server: {
    port: 5173,
    // Send browser calls beginning with `/auth` to the local Python backend during development.
    proxy: {
      '/auth': 'http://localhost:8000'
    }
  }
})
