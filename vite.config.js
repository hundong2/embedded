import { defineConfig } from 'vite';

export default defineConfig({
  base: process.env.VITE_BASE_PATH || '/embedded/',
  build: { target: 'es2022' },
});
