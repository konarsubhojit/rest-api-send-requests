import { defineConfig, loadEnv } from 'vite'
import react from '@vitejs/plugin-react'

// https://vitejs.dev/config/
export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), '')
  return {
  plugins: [react()],
  define: {
    'import.meta.env.REACT_APP_PROXY_URL': JSON.stringify(env.REACT_APP_PROXY_URL || ''),
  },
  server: {
    port: 3000,
    open: true,
  },
  build: {
    outDir: 'build',
    target: 'es2021',
  },
  test: {
    globals: true,
    environment: 'jsdom',
    setupFiles: './src/setupTests.ts',
  },
}})
