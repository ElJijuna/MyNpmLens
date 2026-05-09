import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import { tanstackRouter } from '@tanstack/router-plugin/vite'
import { VitePWA } from 'vite-plugin-pwa'
import type { ManifestOptions } from 'vite-plugin-pwa'
import path from 'path'

export default defineConfig(({ command }) => {
  const base = command === 'build' ? (process.env.VITE_BASE_PATH ?? '/') : '/'
  return {
    base,
    plugins: [
      tanstackRouter({
        routesDirectory: './src/routes',
        generatedRouteTree: './src/routeTree.gen.ts',
      }),
      react(),
      VitePWA({
        registerType: 'prompt',
        includeAssets: ['favicon.ico', 'apple-touch-icon.png', 'mask-icon.svg'],
        manifest: {
          id: base,
          name: 'Npm Lens',
          short_name: 'Npm Lens',
          description: 'Track and monitor your favorite NPM packages',
          theme_color: '#303030',
          background_color: '#ebebeb',
          display: 'standalone',
          display_override: ['window-controls-overlay', 'standalone'],
          scope: base,
          start_url: base,
          launch_handler: {
            client_mode: 'navigate-existing',
          },
          categories: ['developer-tools', 'utilities', 'npm'],
          shortcuts: [
            {
              name: 'Dashboard',
              short_name: 'Dashboard',
              description: 'Go to the main dashboard',
              url: base,
              icons: [{ src: 'pwa-192x192.png', sizes: '192x192' }],
            },
          ],
          screenshots: [
            {
              src: 'screenhoots/dashboard.png',
              sizes: '2026x1324',
              type: 'image/png',
              form_factor: 'wide',
              orientation: 'landscape',
              label: 'Dashboard',
            },
            {
              src: 'screenhoots/package-details.png',
              sizes: '2016x1288',
              type: 'image/png',
              form_factor: 'wide',
              orientation: 'landscape',
              label: 'Package Details',
            },
            {
              src: 'screenhoots/package-details-versions.png',
              sizes: '2018x1294',
              type: 'image/png',
              form_factor: 'wide',
              orientation: 'landscape',
              label: 'Package Details - Versions',
            },
          ] as Array<ManifestOptions['screenshots'][number] & { orientation: string }>,
          icons: [
            {
              src: 'pwa-192x192.png',
              sizes: '192x192',
              type: 'image/png',
            },
            {
              src: 'pwa-512x512.png',
              sizes: '512x512',
              type: 'image/png',
            },
            {
              src: 'pwa-512x512.png',
              sizes: '512x512',
              type: 'image/png',
              purpose: 'any maskable',
            },
          ],
        },
        workbox: {
          maximumFileSizeToCacheInBytes: 8 * 1024 * 1024,
          globPatterns: ['**/*.{js,css,html,ico,png,svg,woff2}'],
          runtimeCaching: [
            {
              urlPattern: /^https:\/\/registry\.npmjs\.org\/.*/i,
              handler: 'StaleWhileRevalidate',
              options: {
                cacheName: 'npm-registry-cache',
                expiration: { maxEntries: 50, maxAgeSeconds: 60 * 60 },
              },
            },
            {
              urlPattern: /^https:\/\/api\.npmjs\.org\/.*/i,
              handler: 'StaleWhileRevalidate',
              options: {
                cacheName: 'npm-downloads-cache',
                expiration: { maxEntries: 50, maxAgeSeconds: 60 * 60 },
              },
            },
            {
              urlPattern: /^https:\/\/bundlephobia\.com\/.*/i,
              handler: 'StaleWhileRevalidate',
              options: {
                cacheName: 'bundlephobia-cache',
                expiration: { maxEntries: 50, maxAgeSeconds: 60 * 60 * 24 },
              },
            },
            {
              urlPattern: /^https:\/\/api\.github\.com\/.*/i,
              handler: 'StaleWhileRevalidate',
              options: {
                cacheName: 'github-api-cache',
                expiration: { maxEntries: 50, maxAgeSeconds: 60 * 60 },
              },
            },
          ],
        },
      }),
    ],
    resolve: {
      alias: {
        '@': path.resolve(__dirname, './src'),
      },
    },
  }
})
