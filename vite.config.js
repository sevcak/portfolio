import { defineConfig } from "vite"

export default defineConfig(({ command, mode, isSsrBuild, isPreview }) => {
    if (command === 'serve') {
        return {
            base: "/"
        }
    } else {
        // command === 'build
        return {
            base: "/portfolio"
        }
    }
});