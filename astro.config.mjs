// @ts-check
import { defineConfig } from 'astro/config';

// https://astro.build/config
export default defineConfig({
  output: 'static',
  trailingSlash: 'ignore',
  vite: {
    build: { target: 'es2020' },
    server: {
      hmr: {
        port: 4321,
        host: 'localhost'
      }
    }
  },
});
