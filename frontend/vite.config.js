import { defineConfig } from "vite"
import react from "@vitejs/plugin-react"

// Dev server on port 3000, the same origin the backend allows in CORS_ORIGIN
export default defineConfig({
    plugins: [react()],
    server: {
        port: 3000,
        strictPort: true
    },
    build: {
        // MUI makes one bigger bundle, that is fine for this app
        chunkSizeWarningLimit: 1000
    },
    preview: {
        port: 3000,
        strictPort: true
    }
})
