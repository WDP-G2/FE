import fs from 'node:fs'
import path from 'node:path'
import { fileURLToPath } from 'node:url'
import tailwindcss from '@tailwindcss/vite'
import { defineConfig, loadEnv } from 'vite'
import react from '@vitejs/plugin-react'

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const LOCAL_API_ORIGIN = 'http://localhost:8080'
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

export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, __dirname, '')
  const devApiOrigin = env.VITE_DEV_API_ORIGIN || LOCAL_API_ORIGIN

  return {
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
      // Cho phép truy cập FE qua domain ngrok (*.ngrok-free.app, *.ngrok.io, ...)
      allowedHosts: true,
      proxy: {
        '/api': {
          target: devApiOrigin,
          changeOrigin: true,
          secure: false,
        },
      },
    },
  }
})
