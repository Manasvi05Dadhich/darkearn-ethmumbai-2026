import { defineConfig } from "vitest/config";
import path from "path";

export default defineConfig({
    test: {
        globals: true,
        testTimeout: 300000,
        hookTimeout: 60000,
        env: {},
    },
    envDir: path.resolve(__dirname, ".."),
});
