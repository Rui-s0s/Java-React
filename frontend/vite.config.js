// NEW CONFIG (Vanilla)
import { defineConfig } from 'vite'

export default defineConfig({
  // No plugins needed for standard JS!
  plugins: [],
  server: {
    proxy: {
      // String shorthand: http://localhost:5173/api -> http://localhost:8080/api
      '/api': {
        target: 'http://127.0.0.1:8080',
        changeOrigin: true,
        secure: false,
      }
    }
  }
})