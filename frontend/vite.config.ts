import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import tailwindcss from '@tailwindcss/vite';

export default defineConfig({
  plugins: [react(), tailwindcss()],
  server: {
    strictPort: false,
    // On enlève le proxy puisqu'on utilise à nouveau l'URL absolue dans api.ts
  },
});
