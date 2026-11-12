import { expect, Locator, Page } from '@playwright/test';

export class BasePage {

    constructor(protected page: Page) {}

    async navigate(url: string) {
        await this.page.goto(url);
    }

    async getPageTitle() {
        return await this.page.title();
    }

    // Verifies the success toast text for all pages
    async getAndVerifySuccessMessage(expectedText: string): Promise<string> {
        const toast = this.page.getByRole('alert').first();
        await expect(toast, 'a success toast should appear').toBeVisible();
        const actualToastText = (await toast.innerText()).replace(/\s+/g, ' ').trim();

        const escaped = expectedText.replace(/\.$/, '').replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
        const messageLocator = this.page.getByText(new RegExp(`^${escaped}\\.?$`));
        await expect(messageLocator, `expected "${expectedText}" but the toast showed "${actualToastText}"`).toBeVisible();
        return (await messageLocator.innerText()).trim();
    }

    async logout() {
        // Avatar button name = user's initials (1-2 capital letters)
        await this.page.getByRole('button', { name: /^[A-Z]{1,2}$/ }).click();
        await this.page.getByText('Logout').click();
        await this.page.waitForURL('**/login**', { timeout: 15000 });
    }

    // Scrolls horizontally so the given element (edit icon, toggle, any far-right control) is in view
    async scrollToElement(target: Locator) {
        await expect(target).toBeAttached({ timeout: 10000 });

        // Playwright's own scroll handles most cases
        await target.scrollIntoViewIfNeeded();

        // Fallback: scroll the nearest horizontally scrollable ancestor fully right
        await target.evaluate((el) => {
            let parent: HTMLElement | null = el.parentElement;
            while (parent) {
                if (parent.scrollWidth > parent.clientWidth) {
                    parent.scrollLeft = parent.scrollWidth;
                    break;
                }
                parent = parent.parentElement;
            }
        });

        await expect(target).toBeVisible();
    }

    async waitForLoader() {
        await this.page.locator('.ngx-overlay.loading-foreground')
            .waitFor({ state: 'hidden', timeout: 15000 }).catch(() => {});
    }

    // Enable or disable the toggle in a grid row (works wherever .custom-toggle is used)
    async setToggle(row: Locator, enable: boolean, successMessage?: string) {
        // Wait for the table to finish re-rendering
        await this.waitForLoader();
        await expect(row).toBeVisible({ timeout: 15000 });

        const toggle = row.locator('.custom-toggle');
        await this.scrollToElement(toggle);

        const isActive = /\bactive\b/.test((await toggle.getAttribute('class')) ?? '');
        if (isActive === enable) return;          // already in the requested state

        await toggle.click();
        await this.page.getByRole('dialog').getByRole('button', { name: 'Yes' }).click();

        if (successMessage) await this.getAndVerifySuccessMessage(successMessage);

        await this.waitForLoader();
        if (enable) await expect(toggle).toHaveClass(/\bactive\b/);
        else await expect(toggle).not.toHaveClass(/\bactive\b/);
    }

    // Enable or disable a record in the grid by its text (name, title, etc.)
   async toggleRecord(recordText: string, enable: boolean, successMessage?: string) {
        const row = this.page.getByRole('row').filter({ hasText: recordText }).first();
        await this.setToggle(row, enable, successMessage);
    }


    // Searches for a record in the grid using the search box
    async searchRecord(text: string) {
        const box = this.page.getByPlaceholder('Search');
        await box.fill(text);
        await box.press('Enter');
        await this.waitForLoader();
    }

    // Clears the grid search box (the Clear search button appears only when the box has text)
    async clearSearch() {
        await this.page.getByRole('button', { name: 'Clear search' }).click();
        await this.waitForLoader();
    }

    // Verifies the record is present in the table after search or creation
    async verifyRecordInTable(text: string) {
        await expect(this.page.getByRole('cell', { name: text, exact: true }).first()).toBeVisible();
    }

    // Goes to the next page and back, verifying the Previous button changes state
    // Needs more than one page of records and no active search
    async verifyPagination() {
        const next = this.page.getByRole('button', { name: 'Next page' });
        const previous = this.page.getByRole('button', { name: 'Previous page' });

        await expect(previous).toBeDisabled();      // first page
        await next.click();
        await this.waitForLoader();
        await expect(previous).toBeEnabled();

        await previous.click();
        await this.waitForLoader();
        await expect(previous).toBeDisabled();      // back on the first page
    }

    // Opens a single-select mat-select and picks the option by its exact name
    async selectMatOption(dropdown: Locator, optionName: string) {
        await dropdown.click();
        await this.page.getByRole('option', { name: optionName, exact: true }).click();
    }

    // Clicks "Select All" in a multi-select dropdown (Zone/Region/State) and closes it
    async selectAllMatOptions(dropdown: Locator) {
        await this.waitForLoader();
        await dropdown.click();
        await this.page.getByRole('listbox').getByText(/Select All/).first().click();
        await this.page.keyboard.press('Escape');
    }

    // Selects "Select All" for Zone, Region and State in order (Region and State depend on Zone)
    async selectAllZoneRegionState() {
        for (const name of ['Select Zone', 'Select Region', 'Select State']) {
            await this.selectAllMatOptions(this.page.getByRole('combobox', { name }));
        }
    }

    // Closes the open create/edit dialog
    async closeDialog() {
        await this.page.getByRole('button', { name: 'Close' }).click();
        await expect(this.page.getByRole('dialog')).toBeHidden();
    }

    // Focuses each field and leaves it, then verifies its "<label> is required" message
    async verifyRequiredFields(fields: { field: Locator; label: string }[]) {
        for (const { field, label } of fields) {
            await field.focus();
            await field.press('Tab');
            await expect(this.page.getByText(`${label} is required`, { exact: true })).toBeVisible();
        }
    }

    // Enters each invalid value in a text field and verifies the validation message
    async verifyInvalidTextValues(input: Locator, values: string[], message: string) {
        for (const value of values) {
            await input.fill(value);
            await input.press('Tab');
            await expect(this.page.getByText(message, { exact: true })).toBeVisible();
        }
    }

    // Types a value beyond the allowed limit and verifies the field never holds more than the max
    async verifyNumericInputLimit(input: Locator, typed: string, maxAllowed: number) {
        await input.clear();
        await input.pressSequentially(typed);   // real key presses, fill() would bypass the app's input limit
        await input.press('Tab');
        await expect.poll(async () => Number(await input.inputValue())).toBeLessThanOrEqual(maxAllowed);
    }

    async clickReset() {
        await this.page.getByRole('button', { name: 'Reset' }).click();
    }

    // After Reset: text fields are empty and dropdowns show their placeholder again
    async verifyFormReset(inputs: Locator[], dropdownPlaceholders: string[]) {
        for (const input of inputs) await expect(input).toHaveValue('');
        for (const name of dropdownPlaceholders) {
            await expect(this.page.getByRole('combobox', { name })).toBeVisible();
        }
    }


        // Multi-select dropdown: leaves only the first option selected (whatever was selected before) and returns its name
    async selectOnlyFirstOption(dropdown: Locator): Promise<string> {
        await dropdown.click();
        const options = this.page.getByRole('listbox').getByRole('option');
        await expect(options.first()).toBeVisible();

        const count = await options.count();
        let firstName = '';
        for (let i = 0; i < count; i++) {
            const option = options.nth(i);
            const isSelected = (await option.getAttribute('aria-selected')) === 'true';
            if (i === 0) firstName = (await option.innerText()).trim();
            if (isSelected !== (i === 0)) await option.click();
        }
        await this.page.keyboard.press('Escape');
        return firstName;
    }
}