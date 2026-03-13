import { defineConfig } from "vitest/config";

export default defineConfig({
    test: {
        globals: true,
        testTimeout: 120000, // 2 minutes for testnet interactions
        hookTimeout: 60000,
    },
});
