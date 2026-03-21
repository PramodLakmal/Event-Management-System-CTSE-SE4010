import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  server: {
    host: '0.0.0.0', // Listen on all network interfaces
    port: 5173,
    watch: {
      usePolling: true, // Necessary because Docker on Windows sometimes fails to propagate file system events
    },
    hmr: {
      clientPort: 5173, // Ensures the browser's WebSocket tries to connect to the host port, not the container's internal network IP
    }
  }
})
