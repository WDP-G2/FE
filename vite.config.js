import fs from 'node:fs'
import net from 'node:net'
import path from 'node:path'
import { fileURLToPath, URL } from 'node:url'
import tailwindcss from '@tailwindcss/vite'
import { defineConfig, loadEnv } from 'vite'
import react from '@vitejs/plugin-react'

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const LOCAL_API_ORIGIN = 'http://localhost:8080'
const DEPLOY_API_ORIGIN = 'https://api.horseracing.id.vn'
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

function isOriginReachable(origin) {
  return new Promise((resolve) => {
    const url = new URL(origin)
    const port = Number(url.port || (url.protocol === 'https:' ? 443 : 80))
    const socket = net.createConnection({ host: url.hostname, port, timeout: 700 })

    const finish = (reachable) => {
      socket.destroy()
      resolve(reachable)
    }

    socket.once('connect', () => finish(true))
    socket.once('timeout', () => finish(false))
    socket.once('error', () => finish(false))
  })
}

async function resolveDevApiOrigin(env) {
  const configuredOrigin = env.VITE_DEV_API_ORIGIN?.trim()
  if (configuredOrigin && configuredOrigin.toLowerCase() !== 'auto') {
    return configuredOrigin
  }

  return (await isOriginReachable(LOCAL_API_ORIGIN))
    ? LOCAL_API_ORIGIN
    : DEPLOY_API_ORIGIN
}

export default defineConfig(async ({ mode }) => {
  const env = loadEnv(mode, __dirname, '')
  const devApiOrigin = await resolveDevApiOrigin(env)

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
