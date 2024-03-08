import { defineConfig, PluginOption } from 'vite'
import react from '@vitejs/plugin-react'

const fullReloadAlways: PluginOption = {
  handleHotUpdate({ server }) {
    server.ws.send({ type: "full-reload" })
    return []
  },
} as unknown as PluginOption

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react(), fullReloadAlways],
  resolve: {
    alias: {
      path: 'path-browserify',
    },
  },
  assetsInclude: [
    "**/*.glb", "**/*.hdr"
  ],
  server:{
    host: '0.0.0.0',
    // https://github.com/vitejs/vite/discussions/7314
    hmr: true
  }
})