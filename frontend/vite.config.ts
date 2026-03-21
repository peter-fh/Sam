import { defineConfig, loadEnv } from 'vite'
import react from '@vitejs/plugin-react'
import { defaultExclude } from 'vitest/config'

// https://vite.dev/config/

const envDir = '../'
export default defineConfig(({ mode }) => {

  const env = loadEnv(mode, envDir, '')
  const isE2E = process.env.TEST_MODE === 'e2e'

  const unitTestConfig = {
    environment: 'jsdom',
    globals: true,
    setupFiles: './src/test/setup.ts',
    exclude: [...defaultExclude, "**/*e2e*"],
  }

  const e2eTestConfig = {
    environment: 'jsdom',
    globals: true,
    setupFiles: './src/test/setup.e2e.ts',
    include: ["**/*.e2e.{test,spec}.{ts,tsx}"],
    env: {
      VITE_API_URL: 'http://127.0.0.1:8070',
      VITE_SUPABASE_URL: env.VITE_LOCAL_SUPABASE_URL,
      VITE_SUPABASE_ANON_KEY: env.VITE_LOCAL_SUPABASE_ANON_KEY,
    }
  }

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
    test: isE2E ? e2eTestConfig : unitTestConfig
  }
})
