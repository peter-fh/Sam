import { defineConfig, loadEnv } from 'vite'
import react from '@vitejs/plugin-react'

// https://vite.dev/config/

const envDir = '../'
export default defineConfig(({ mode }) => {

  const env = loadEnv(mode, envDir, '')
  return {
    plugins: [react()],
    envDir: "../",
    server: mode === 'development' ? {
      proxy: {
        '/api':{
          target: 'http://127.0.0.1:8070',
          changeOrigin: true,
        },
        '/db':{
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
    },
    test: {
      environment: 'jsdom',
      globals: true,
      setupFiles: './src/test/setup.ts',
      env: {
        VITE_SUPABASE_URL: env.VITE_LOCAL_SUPABASE_URL,
        VITE_SUPABASE_ANON_KEY: env.VITE_LOCAL_SUPABASE_ANON_KEY,
      }
    },
  }
})
