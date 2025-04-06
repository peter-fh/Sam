import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vite.dev/config/

export default defineConfig(({ mode }) => {

  return {
  plugins: [react()],
  server: mode === 'development' ? {
    proxy: {
      '/font':{
        target: 'http://127.0.0.1:8070',
        changeOrigin: true,
      },
      '/summary':{
        target: 'http://127.0.0.1:8070',
        changeOrigin: true,
      },
      '/introduction':{
        target: 'http://127.0.0.1:8070',
        changeOrigin: true,
      },
      '/question':{
        target: 'http://127.0.0.1:8070',
        changeOrigin: true,
      },
      '/image':{
        target: 'http://127.0.0.1:8070',
        changeOrigin: true,
      },

      },
    }: undefined,
    build: {
      rollupOptions: {
        output: {
          assetFileNames: 'assets/[name].[hash][extname]'
        }
      }
    }
  }
})
