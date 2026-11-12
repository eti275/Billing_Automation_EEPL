import { test as setup } from '@playwright/test';
import { LoginPage } from '../pages/LoginPage';
import { Credentials } from './constants';

setup('login once', async ({ page }) => {
    await new LoginPage(page).loginAndWait(Credentials.ADMIN_EMAIL, Credentials.ADMIN_PASSWORD);
    await page.context().storageState({ path: 'playwright/.auth/admin.json' });
});