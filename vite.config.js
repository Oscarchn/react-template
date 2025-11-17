import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

// https://vitejs.dev/config/
export default defineConfig({
    base: "./",
    plugins: [
        react(),
        {
            name: 'request-logger',
            configureServer(server) {
                server.middlewares.use((req, res, next) => {
                    const start = Date.now();
                    res.on('finish', () => {
                        const dur = Date.now() - start;
                        console.log(`${req.method} ${req.url} ${res.statusCode} ${dur}ms`);
                    });
                    next();
                });
            }
        }
    ],
    server: {
        host: "0.0.0.0",
    },
    build: {
        rollupOptions: {
            external: ["#minpath", "#minproc", "#minurl"],
        },
    },
});
