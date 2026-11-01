import { build } from 'vite';
import react from '@vitejs/plugin-react';
import tailwindcss from '@tailwindcss/vite';
import path from 'path';

async function runBuild() {
  await build({
    configFile: false,
    base: './',
    plugins: [react(), tailwindcss()],
    resolve: {
      alias: {
        '@': path.resolve('.'),
      },
    },
  });
}

runBuild().catch((err) => {
  console.error(err);
  process.exit(1);
});
