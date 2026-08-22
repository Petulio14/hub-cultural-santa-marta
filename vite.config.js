import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

// El despliegue de Vercel usa «npm run build» y publica «dist/» (vercel.json).
export default defineConfig({
  plugins: [react()],
  server: { port: 5173 },
  build: { outDir: 'dist', sourcemap: true },
});
