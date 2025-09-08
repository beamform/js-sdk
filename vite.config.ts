import { resolve } from "node:path";
import { defineConfig } from "vite";
import dts from "vite-plugin-dts";

export default defineConfig({
  build: {
    lib: {
      entry: resolve(__dirname, "src/index.ts"),
      name: "BeamformJsSDK",
      formats: ["es", "cjs"],
      fileName: (format) => `index.${format === "es" ? "mjs" : "js"}`,
    },
    rollupOptions: {
      external: ["openapi-fetch"],
      output: {
        globals: {
          "openapi-fetch": "OpenapisFetch",
        },
      },
    },
    sourcemap: true,
    minify: "terser",
  },
  plugins: [
    dts({
      rollupTypes: true,
    }),
  ],
  test: {
    coverage: {
      include: ["src/**/*.ts"],
      reporter: ["html"],
    },
  },
});
