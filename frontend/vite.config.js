import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  server: {
    historyApiFallback: true,
  },
  build: {
    outDir: 'dist',
    // Asegura que se copien los archivos estáticos correctamente
    copyPublicDir: true
  }
})
