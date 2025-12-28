/// <reference types="vitest" />
import { defineConfig } from 'vite';

export default defineConfig({
  base: '/PlaneBuddy/',
  server: {
    port: 9000,
  },
  build: {
    outDir: 'dist',
  },
  test: {
    environment: 'jsdom',
  },
});
