import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import { loadEnv } from 'vite'

export default defineConfig(({ mode }) => {
  const { VITE_BASE_PATH = '/' } = loadEnv(mode, process.cwd(), '')
  if (
    !VITE_BASE_PATH.startsWith('/') ||
    !VITE_BASE_PATH.endsWith('/') ||
    VITE_BASE_PATH.startsWith('//') ||
    VITE_BASE_PATH.split('/').includes('..')
  ) {
    throw new Error('VITE_BASE_PATH must be an absolute URL path ending in "/".')
  }

  return {
    base: VITE_BASE_PATH,
    plugins: [react()],
  }
})
