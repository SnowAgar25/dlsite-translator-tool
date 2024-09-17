import { defineConfig } from 'vite';
import monkey from 'vite-plugin-monkey';

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [
    monkey({
      entry: 'src/main.ts',
      userscript: {
        icon: 'https://www.google.com/s2/favicons?sz=64&domain=dlsite.com',
        namespace: 'https://github.com/SnowAgar25',
        match: ['https://*.dlsite.com/*'],
      },
    }),
  ],
});
