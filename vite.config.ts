import { sveltekit } from '@sveltejs/kit/vite';
import tailwindcss from '@tailwindcss/vite';
import Icons from 'unplugin-icons/vite';
import { defineConfig } from 'vite';
import devtoolsJson from 'vite-plugin-devtools-json';
import mkcert from 'vite-plugin-mkcert';

export default defineConfig({
  plugins: [
    tailwindcss(),
    sveltekit(),
    Icons({
      compiler: 'svelte',
      autoInstall: true,
    }),
    devtoolsJson(),
    mkcert(),
  ],
  server: {
    https: {},
  },
});
