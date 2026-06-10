import { defineConfig } from 'vite'
import path from 'path'
import { createRequire } from 'node:module'
import { fileURLToPath } from 'url'
import tailwindcss from '@tailwindcss/vite'
import react from '@vitejs/plugin-react'

const require = createRequire(import.meta.url)

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)

/** ACE Design System (ACEDesignSystem / ds-github) — local sandbox clone */
const aceDesignSystemSrc = path.resolve(
  __dirname,
  '../../Design System/Design System Sandbox/src',
)

function figmaAssetResolver() {
  return {
    name: 'figma-asset-resolver',
    resolveId(id) {
      if (id.startsWith('figma:asset/')) {
        const filename = id.replace('figma:asset/', '')
        return path.resolve(__dirname, 'src/assets', filename)
      }
    },
  }
}

/** @ace-ds lives outside this repo; resolve its npm imports from our node_modules (CI has no DS install). */
function aceDsDependencyResolver() {
  const dsMarker = `${path.sep}Design System${path.sep}`
  return {
    name: 'ace-ds-dependency-resolver',
    enforce: 'pre' as const,
    resolveId(source: string, importer?: string) {
      if (!importer?.includes(dsMarker)) return null
      if (source.startsWith('.') || source.startsWith('\0') || path.isAbsolute(source)) {
        return null
      }
      try {
        return require.resolve(source, { paths: [__dirname] })
      } catch {
        return null
      }
    },
  }
}

// Local dev: `/`. GitHub Actions sets `VITE_BASE_PATH` to `/<repo>/` so asset URLs work with or
// without a trailing slash on `…github.io/<repo>` (relative `./` bases break without `/`).
function viteBase(): string {
  const raw = process.env.VITE_BASE_PATH?.trim()
  if (!raw || raw === '/') {
    return '/'
  }
  const withLeading = raw.startsWith('/') ? raw : `/${raw}`
  return withLeading.endsWith('/') ? withLeading : `${withLeading}/`
}

export default defineConfig({
  base: viteBase(),
  plugins: [
    aceDsDependencyResolver(),
    figmaAssetResolver(),
    // The React and Tailwind plugins are both required for Make, even if
    // Tailwind is not being actively used – do not remove them
    react(),
    tailwindcss(),
  ],
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
      '@ace-ds': aceDesignSystemSrc,
    },
  },
  server: {
    fs: {
      allow: [path.resolve(__dirname, '..'), path.resolve(__dirname, '../..')],
    },
  },

  // File types to support raw imports. Never add .css, .tsx, or .ts files to this.
  assetsInclude: ['**/*.svg', '**/*.csv'],
})
