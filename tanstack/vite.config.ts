import { defineConfig } from 'vitest/config'
import { devtools } from '@tanstack/devtools-vite'
import { paraglideVitePlugin } from '@inlang/paraglide-js'

import { tanstackStart } from '@tanstack/react-start/plugin/vite'

import viteReact from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'
import { nitro } from 'nitro/vite'

const isTest = typeof process !== 'undefined' && !!process.env.VITEST

const config = defineConfig({
  resolve: { tsconfigPaths: true },
  plugins: isTest
    ? []
    : [
        devtools(),
        paraglideVitePlugin({
          project: './project.inlang',
          outdir: './src/paraglide',
          strategy: ['url', 'baseLocale'],
        }),
        nitro({ rollupConfig: { external: [/^@sentry\//] } }),
        tailwindcss(),
        tanstackStart(),
        viteReact(),
      ],
  test: {
    coverage: {
      provider: 'v8',
      reporter: ['text', 'json', 'json-summary', 'html'],
    },
  },
})

export default config
