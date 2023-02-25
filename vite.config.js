import { defineConfig } from "vite";

export default defineConfig({
  build: {
    lib: {
      entry: './lib/main.js',
      name: 'mapCustom',
      fileName: 'mapCustom'
    }
  }
})
