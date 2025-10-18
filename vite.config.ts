import react from "@vitejs/plugin-react";
import { defineConfig } from "vite";
import tailwind from "@tailwindcss/postcss";
import autoprefixer from "autoprefixer";

export default defineConfig({
  plugins: [react()],
  base: "./",
  css: {
    postcss: {
      plugins: [tailwind(), autoprefixer()],
    },
  },
  build: {
    outDir: "dist",
  },
});
