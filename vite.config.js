import fs from 'node:fs'
import path from 'node:path'
import { fileURLToPath } from 'node:url'
import tailwindcss from '@tailwindcss/vite'
import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

const __dirname = path.dirname(fileURLToPath(import.meta.url))

/** BE Node.js + MongoDB Atlas — cổng mặc định (khớp BE/.env PORT) */
const BE_API_HOST = 'localhost'
const BE_API_PORT = 8080
const BE_API_ORIGIN = `http://${BE_API_HOST}:${BE_API_PORT}`
const DEV_PORT = 5173

/** Copy logo từ src/assets → public để index.html dùng favicon & splash */
function syncLogoToPublic() {
  const pairs = [
    ['src/assets/logo-icon.svg', 'public/logo-icon.svg'],
    ['src/assets/logo.svg', 'public/logo.svg'],
  ]
  for (const [from, to] of pairs) {
    const src = path.resolve(__dirname, from)
    const dest = path.resolve(__dirname, to)
    if (fs.existsSync(src)) {
      fs.mkdirSync(path.dirname(dest), { recursive: true })
      fs.copyFileSync(src, dest)
    }
  }
}

syncLogoToPublic()

function logoAssetsPlugin() {
  return {
    name: 'logo-assets-sync',
    configureServer() {
      syncLogoToPublic()
    },
    buildStart() {
      syncLogoToPublic()
    },
  }
}

export default defineConfig({
  plugins: [logoAssetsPlugin(), react(), tailwindcss()],
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
    },
  },
  server: {
    host: true,
    port: DEV_PORT,
    strictPort: true,
    allowedHosts: true,
    proxy: {
      '/api': {
        target: BE_API_ORIGIN,
        changeOrigin: true,
        secure: false,
      },
    },
  },
})
