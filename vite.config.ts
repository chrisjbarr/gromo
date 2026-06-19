import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import { VitePWA } from 'vite-plugin-pwa';

// Served from https://<user>.github.io/gromo/ on GitHub Pages.
export default defineConfig({
  base: '/gromo/',
  server: {
    host: true,
    // Allow access through the localtunnel preview host.
    allowedHosts: ['.loca.lt'],
  },
  plugins: [
    react(),
    VitePWA({
      registerType: 'autoUpdate',
      includeAssets: ['favicon.png'],
      manifest: {
        name: 'Gromo',
        short_name: 'Gromo',
        description: 'Personal workout tracker',
        theme_color: '#eef1f6',
        background_color: '#eef1f6',
        display: 'standalone',
        start_url: '/gromo/',
        scope: '/gromo/',
        icons: [
          { src: 'icon-192.png', sizes: '192x192', type: 'image/png' },
          { src: 'icon-512.png', sizes: '512x512', type: 'image/png' },
          { src: 'icon-512.png', sizes: '512x512', type: 'image/png', purpose: 'maskable' },
        ],
      },
    }),
  ],
});
