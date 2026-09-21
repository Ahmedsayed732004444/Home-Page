import { defineConfig } from 'vite';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

function htmlIncludePlugin() {
  return {
    name: 'vite-plugin-html-include',
    transformIndexHtml(html) {
      return html.replace(/<include\s+src=["']([^"']+)["'](?:\s*><\/include>|\s*\/>)/gi, (_, src) => {
        const filePath = path.resolve(__dirname, src);
        if (fs.existsSync(filePath)) {
          return fs.readFileSync(filePath, 'utf-8');
        }
        console.warn(`[html-include] File not found: ${filePath}`);
        return '';
      });
    },
    handleHotUpdate({ file, server }) {
      if (file.includes('components')) {
        server.ws.send({
          type: 'full-reload',
          path: '*'
        });
      }
    }
  };
}

export default defineConfig({
  plugins: [htmlIncludePlugin()],
  server: {
    port: 3000,
    open: true,
  },
});
