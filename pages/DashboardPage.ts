import { expect, Locator, Page } from '@playwright/test';
import { BasePage } from './BasePage';

export class DashboardPage extends BasePage {

    readonly dashboardHeading: Locator;

    constructor(page: Page) {
        super(page);
        this.dashboardHeading = page.locator("//div/h2[text()='Dashboard']");
    }

    async verifyOnDashboardPage() {
        await expect(this.dashboardHeading).toBeVisible();
    }
}