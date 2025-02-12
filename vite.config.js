import { defineConfig } from 'vite';

export default defineConfig({
  assetsInclude: ['**/*.glb'],
  plugins: [
    {
      name: 'glsl',
      transform(code, id) {
        if (id.endsWith('.glsl')) {
          const transformedCode = `export default \`${code}\``;
          return {
            code: transformedCode,
            map: null
          };
        }
      }
    }
  ]
}); 