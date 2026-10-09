import { defineConfig } from 'vite'
import path from 'path'
import { fileURLToPath } from 'url'
import tailwindcss from '@tailwindcss/vite'
import react from '@vitejs/plugin-react'

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

/**
 * @ace-ds lives outside this repo (no local node_modules). Re-resolve bare
 * package imports as if they came from this app so Vite prebundles them
 * (`/node_modules/.vite/deps/...`) instead of serving CJS over `/@fs/`.
 */
function aceDsDependencyResolver() {
  const appImporter = path.resolve(__dirname, 'src/main.tsx')
  return {
    name: 'ace-ds-dependency-resolver',
    enforce: 'pre' as const,
    async resolveId(this: { resolve: (...args: unknown[]) => Promise<unknown> }, source: string, importer?: string) {
      // Vite normalizes importers to `/` even on Windows; don't rely on path.sep alone.
      const fromDesignSystem = importer?.replace(/\\/g, '/').includes('/Design System/')
      if (!fromDesignSystem) return null
      if (source.startsWith('.') || source.startsWith('\0') || path.isAbsolute(source)) {
        return null
      }
      return this.resolve(source, appImporter, { skipSelf: true })
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
