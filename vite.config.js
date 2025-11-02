import { defineConfig } from "vite";
import { resolve } from "path";

export default defineConfig({
  server: {
    // Optional: helps with SPA routing if using client-side router
    historyApiFallback: true,
  },
  build: {
    rollupOptions: {
      input: {
        main: resolve(__dirname, "index.html"),
        face: resolve(__dirname, "face.html"),
        image: resolve(__dirname, "image.html"),
        location: resolve(__dirname, "location.html"),
        world: resolve(__dirname, "world.html"),
        "360": resolve(__dirname, "360.html"),
        face2: resolve(__dirname, "face2.html"),
      },
    },
  },
});
