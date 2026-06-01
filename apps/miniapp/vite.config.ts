import { defineConfig } from 'vitest'
import uni from '@dcloudio/vite-plugin-uni'
import path from 'path'

export default defineConfig({
  plugins: [uni()],
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
      '@training/shared': path.resolve(__dirname, '../../packages/shared/src'),
    },
  },
  server: {
    port: 5174,
  },
})
