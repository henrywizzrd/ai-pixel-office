import { defineConfig } from 'vite';

// base './' để build ra chạy được cả trên GitHub Pages lẫn mở thẳng thư mục dist
export default defineConfig({
  base: './',
  server: { port: 5173 },
});
