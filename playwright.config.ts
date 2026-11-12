import { defineConfig } from '@playwright/test';

export default defineConfig({
    testDir: './tests',
    reporter: 'html',
    use: {
        baseURL: 'http://10.254.240.102:4880',
        trace: 'on-first-retry',
    },
    projects: [
        { name: 'setup', testMatch: /auth\.setup\.ts/ },
        {
            name: 'chromium',
            use: { browserName: 'chromium', storageState: 'playwright/.auth/admin.json' },
            dependencies: ['setup'],
        },
    ],
});

