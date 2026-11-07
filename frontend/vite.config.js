import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
  plugins: [react()],
  server: {
    // Chuyển tiếp /api sang backend Express khi chạy npm run dev.
    proxy: { '/api': process.env.VITE_API_PROXY || 'http://localhost:3000' },
  },
});
