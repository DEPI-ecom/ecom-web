import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

// Local service ports. Cart/Order ports are assumptions: adjust if yours differ.
const PORTS = { user: 3001, catalog: 3002, search: 3003, cart: 3004, order: 3005 };

// Mirrors the planned gateway route table: /api/<prefix>/* -> service.
// The /api prefix is stripped because the services themselves serve /auth, /products, etc.
const proxyTo = (port) => ({
  target: `http://localhost:${port}`,
  changeOrigin: true,
  rewrite: (path) => path.replace(/^\/api/, ''),
});

export default defineConfig({
  plugins: [react()],
  server: {
    port: 5173,
    proxy: {
      '/api/auth': proxyTo(PORTS.user),
      '/api/users': proxyTo(PORTS.user),
      '/api/products': proxyTo(PORTS.catalog),
      '/api/categories': proxyTo(PORTS.catalog),
      '/api/search': proxyTo(PORTS.search),
      '/api/cart': proxyTo(PORTS.cart),
      '/api/orders': proxyTo(PORTS.order),
    },
  },
});