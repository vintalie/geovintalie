import { defineConfig } from 'vitest/config';
import react from '@vitejs/plugin-react';
import tailwindcss from '@tailwindcss/vite';
import tsconfigPaths from 'vite-tsconfig-paths';
import path from 'path';

// https://vitest.dev/config/
export default defineConfig({
  plugins: [react(), tailwindcss(), tsconfigPaths()],
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
    },
  },
  test: {
    environment: 'jsdom',
    setupFiles: './src/test/setup.ts',
    include: ['src/**/*.{test,spec}.?(c|m)[jt]s?(x)'],
    globals: true,
    coverage: {
      provider: 'v8',
      reporter: ['text', 'json', 'html'],
      include: [
        'src/pages/Auth/Login.tsx',
        'src/pages/Institutional.tsx',
        'src/pages/Dashboard.tsx',
        'src/pages/MapPage.tsx',
        'src/pages/Property/PropertyList.tsx',
        'src/pages/Property/PropertyFormPage.tsx',
        'src/pages/ImportExport.tsx',
        'src/contexts/AuthContext.tsx',
        'src/hooks/useAuth.ts',
        'src/lib/api-base.ts',
        'src/utils/helpers.ts',
        'src/api/auth.ts',
        'src/api/location.ts',
        'src/api/axios.ts',
      ],
      thresholds: {
        lines: 80,
        functions: 80,
        branches: 80,
        statements: 80,
      },
    },
  },
});
