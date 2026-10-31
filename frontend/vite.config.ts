import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react-swc'

export default defineConfig({
  plugins: [react()],
  server: {
    proxy: {
      "/api": {
        target: "http://localhost:5000",
        changeOrigin: true,
      },
      "/generate-fir": {
        target: "http://localhost:5000",
        changeOrigin: true,
      },
      "/download-fir": {
        target: "http://localhost:5000",
        changeOrigin: true,
      },
    },
  },
})
