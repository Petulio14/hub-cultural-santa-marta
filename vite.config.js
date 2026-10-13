import { execSync } from 'node:child_process';
import { readFileSync } from 'node:fs';
import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

const { version } = JSON.parse(readFileSync(new URL('./package.json', import.meta.url), 'utf8'));

/**
 * El commit que se está compilando, en corto — HU-37, tercer criterio.
 *
 * El criterio pide poder **contrastar lo desplegado con el repositorio**, y para
 * eso lo publicado tiene que decir de dónde salió. La versión sola no basta:
 * entre una etiqueta y la siguiente hay decenas de commits, y todos dirían
 * «1.0.0».
 *
 * Se mira primero la variable de Vercel porque allí **no se puede preguntar a
 * git**: la compilación no recibe un clon completo, así que «git rev-parse»
 * fallaría justo en el único sitio donde el dato importa de verdad. En local sí
 * hay repositorio y se pregunta. Y si no hay ninguna de las dos cosas —alguien
 * compilando desde un zip descargado— se dice «sin-git» en lugar de inventar un
 * identificador, que es lo único que haría inútil a la etiqueta.
 */
function commitCompilado() {
  if (process.env.VERCEL_GIT_COMMIT_SHA) {
    return process.env.VERCEL_GIT_COMMIT_SHA.slice(0, 7);
  }
  try {
    return execSync('git rev-parse --short HEAD', { encoding: 'utf8' }).trim();
  } catch {
    return 'sin-git';
  }
}

// El despliegue de Vercel usa «npm run build» y publica «dist/» (vercel.json).
export default defineConfig({
  plugins: [react()],
  server: { port: 5173 },
  build: { outDir: 'dist', sourcemap: true },
  // Se resuelven al compilar y quedan escritos en el paquete: no son una
  // consulta en marcha, son dos literales. Por eso el pie puede enseñarlos sin
  // pedir nada a nadie y sin que puedan desfasarse de lo que se publicó.
  define: {
    __VERSION__: JSON.stringify(version),
    __COMMIT__: JSON.stringify(commitCompilado()),
  },
});
