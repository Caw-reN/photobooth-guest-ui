import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import basicSsl from '@vitejs/plugin-basic-ssl'

export default defineConfig({
  plugins: [
    react(),
    basicSsl() // Tambahkan ini
  ],
  server: {
    host: true, // Biar bisa diakses dari IP
  }
})