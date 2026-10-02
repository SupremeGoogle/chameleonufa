import react from '@vitejs/plugin-react'
import { defineConfig } from 'vite'

// На GitHub Pages сайт живёт в подпапке /<repo>/
export default defineConfig({
  base: process.env.BASE_PATH ?? '/',
  plugins: [react()],
})
