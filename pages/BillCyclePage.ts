import { expect, Locator, Page } from '@playwright/test';
import { BasePage } from './BasePage';

export class BillCyclePage extends BasePage {

    readonly createBillCycleButton: Locator;
    readonly dialog: Locator;
    readonly nameInput: Locator;
    readonly typeDropdown: Locator;
    readonly billDayInput: Locator;
    readonly paymentDueOffsetInput: Locator;
    readonly frequencyDropdown: Locator;
    readonly financialMonthDropdown: Locator;
    readonly tenantDropdown: Locator;
    readonly fromDateCalendarButton: Locator;
    readonly toDateCalendarButton: Locator;
    readonly nextMonthButton: Locator;
    readonly submitButton: Locator;
    readonly resetButton: Locator;
    readonly searchInput: Locator;
    readonly tableRows: Locator;
    readonly confirmYesButton: Locator;

    constructor(page: Page) {
        super(page);

        this.createBillCycleButton = page.getByRole('button', { name: 'Create Bill Cycle' });
        this.dialog = page.getByRole('dialog');

        this.nameInput = this.dialog.getByRole('textbox', { name: 'Bill Cycle Name' });
        this.typeDropdown = this.dialog.getByRole('combobox', { name: 'Select Type' });
        this.billDayInput = this.dialog.getByPlaceholder('Bill Day');
        this.paymentDueOffsetInput = this.dialog.getByPlaceholder('Payment Due Date Offset');
        this.frequencyDropdown = this.dialog.getByRole('combobox', { name: 'Select Frequency' });
        this.financialMonthDropdown = this.dialog.getByRole('combobox', { name: 'Select Month' });
        this.tenantDropdown = this.dialog.getByRole('combobox', { name: 'Select Tenant' });

        this.fromDateCalendarButton = this.dialog.getByRole('button', { name: 'Open calendar' }).first();
        this.toDateCalendarButton = this.dialog.getByRole('button', { name: 'Open calendar' }).nth(1);
        this.nextMonthButton = page.getByRole('button', { name: 'Next month' });

        this.submitButton = this.dialog.getByRole('button', { name: 'Submit' });
        this.resetButton = this.dialog.getByRole('button', { name: 'Reset' });
         this.searchInput = page.getByPlaceholder('Search');
        this.tableRows = page.getByRole('table').getByRole('row');
        this.confirmYesButton = page.getByRole('button', { name: 'Yes' });
    }

    async waitForLoadingOverlayToDisappear() {
        await this.page.locator('.ngx-overlay.loading-foreground')
            .waitFor({ state: 'hidden', timeout: 15000 }).catch(() => {});
    }

    async clickCreateBillCycle() {
        await this.waitForLoadingOverlayToDisappear();
        await this.createBillCycleButton.click();
        await expect(this.nameInput).toBeVisible();
    }

    async selectDropdownOption(dropdown: Locator, optionText: string) {
        await this.waitForLoadingOverlayToDisappear();
        await dropdown.click();
        await this.page.getByRole('option', { name: optionText, exact: true }).click();
    }
async pickDate(calendarButton: Locator, target: Date) {
    const label = target.toLocaleDateString('en-US', {
        month: 'long', day: 'numeric', year: 'numeric',
    });

    await calendarButton.click();

    // Move forward from the month the calendar opens on (the current month)
    const now = new Date();
    const monthsAhead =
        (target.getFullYear() - now.getFullYear()) * 12 + (target.getMonth() - now.getMonth());
    for (let i = 0; i < monthsAhead; i++) {
        await this.nextMonthButton.click();
    }

    await this.page.getByRole('button', { name: label }).click();
}

async createBillCycle(
    name: string, type: string, billDay: string, paymentDueOffset: string,
    frequency: string, financialMonth: string, tenant: string,
    fromDate: Date, toDate: Date
) {
    await this.clickCreateBillCycle();
    await this.nameInput.fill(name);
    await this.selectDropdownOption(this.typeDropdown, type);
    await this.billDayInput.fill(billDay);
    await this.paymentDueOffsetInput.fill(paymentDueOffset);
    await this.selectDropdownOption(this.frequencyDropdown, frequency);
    await this.selectDropdownOption(this.financialMonthDropdown, financialMonth);
    await this.selectDropdownOption(this.tenantDropdown, tenant);
    await this.pickDate(this.fromDateCalendarButton, fromDate);
    await this.pickDate(this.toDateCalendarButton, toDate);
    await expect(this.submitButton).toBeEnabled();
    await this.submitButton.click();
}

    async verifyBillCycleInGrid(name: string) {
        await expect(this.page.getByRole('cell', { name, exact: true }).first())
            .toBeVisible({ timeout: 10000 });
    }

    // for search field 

    async searchBillCycle(searchText: string) {
    await this.searchInput.fill(searchText);
    await this.searchInput.press('Enter');

    // Wait until the searched record is shown
    await expect(this.page.getByRole('cell', { name: searchText, exact: true }).first())
        .toBeVisible({ timeout: 10000 });
}

// Checks every data row in the grid contains the searched text (independent of column order)
async verifyAllRowsMatchSearch(searchText: string) {
    const rowCount = await this.tableRows.count();
    expect(rowCount).toBeGreaterThan(1); // header + at least one result

    for (let i = 1; i < rowCount; i++) {
        const rowText = await this.tableRows.nth(i).innerText();
        expect(rowText.toLowerCase()).toContain(searchText.toLowerCase());
    }
}
getToggleForBillCycle(name: string): Locator {
    return this.page
        .getByRole('row')
        .filter({ hasText: name })
        .getByRole('button', { description: 'Toggle Status', exact: true });
}



async deactivateBillCycle(name: string) {
    await this.scrollToElement(this.getToggleForBillCycle(name));
    await this.getToggleForBillCycle(name).click();
    await expect(this.page.getByText(/Are you sure you want to deactivate/i)).toBeVisible();
    await this.confirmYesButton.click();
}

async activateBillCycle(name: string) {
    await this.scrollToElement(this.getToggleForBillCycle(name));
    await this.getToggleForBillCycle(name).click();
    await expect(this.page.getByText(/Are you sure you want to activate/i)).toBeVisible();
    await this.confirmYesButton.click();
}

async verifyBillCycleStatus(name: string, expectedStatus: 'Active' | 'Inactive') {
    await expect(
        this.page.getByRole('row').filter({ hasText: name }).getByText(expectedStatus, { exact: true })
    ).toBeVisible();
}
}
