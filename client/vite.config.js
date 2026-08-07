import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'
import path from 'path'
import fs from 'fs'
import { fileURLToPath } from 'url'

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)

const fallbackLibResolver = () => ({
  name: 'fallback-lib-resolver',
  resolveId(source, importer) {
    if (importer && importer.includes('/src/lib/')) {
      const resolvedPath = path.resolve(path.dirname(importer), source);
      const extensions = ['', '.js', '.jsx', '.ts', '.tsx', '/index.js', '/index.jsx'];
      const exists = extensions.some(ext => fs.existsSync(resolvedPath + ext));
      
      if (!exists) {
        const folders = ['api', 'hooks', 'services', 'context', 'components', 'utils', 'layouts', 'providers', 'theme', 'pages'];
        const parts = source.split('/');
        const folderIndex = parts.findIndex(p => folders.includes(p));
        
        if (folderIndex !== -1) {
          const relFromFolder = parts.slice(folderIndex).join('/');
          const realPath = path.resolve(__dirname, 'src', relFromFolder);
          
          for (const ext of extensions) {
            const candidate = realPath + ext;
            if (fs.existsSync(candidate) && fs.statSync(candidate).isFile()) {
              return candidate;
            }
          }
          return realPath;
        }
      }
    }
    return null;
  }
});

// https://vite.dev/config/
export default defineConfig({
  plugins: [fallbackLibResolver(), react(), tailwindcss()],
  optimizeDeps: {
    include: ['prop-types'],
  },
  server: {
    port: 5173,
    proxy: {
      '/api': {
        target: 'http://localhost:3000',
        changeOrigin: true,
      },
      '/uploads': {
        target: 'http://localhost:3000',
        changeOrigin: true,
      },
    },
  },
})
