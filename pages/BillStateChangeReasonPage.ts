import { expect, Locator, Page } from '@playwright/test';
import { BasePage } from './BasePage';
import { ValidationMessages } from '../tests/constants';

export class BillStateChangeReasonPage extends BasePage {

    readonly createButton: Locator;
    readonly reasonInput: Locator;
    readonly tenantSelect: Locator;
    readonly submitButton: Locator;
    readonly resetButton: Locator;

    constructor(page: Page) {
        super(page);
        this.createButton = page.getByRole('button', { name: 'Create Bill State Change' });
        this.reasonInput = page.getByRole('textbox', { name: 'Bill State Change Reason' });
        this.tenantSelect = page.getByRole('combobox', { name: 'Select Tenant' });
        this.submitButton = page.getByRole('button', { name: 'Submit' });
        this.resetButton = page.getByRole('button', { name: 'Reset' });
    }

    async openCreatePanel() {
        if (!(await this.reasonInput.isVisible())) await this.createButton.click();
    }

    async fillForm(reason: string, tenant: string) {
        await this.openCreatePanel();
        await this.reasonInput.fill(reason);
        await this.selectMatOption(this.tenantSelect, tenant);
    }

    async reset() {
        await this.resetButton.click();
    }

    async verifyFormReset(tenant: string) {
        await expect(this.reasonInput).toHaveValue('');
        await expect(this.tenantSelect).not.toContainText(tenant);
    }

    async createReason(reason: string, tenant: string) {
        await this.fillForm(reason, tenant);
        await this.submitButton.click();
    }

    async verifyReasonInTable(reason: string) {
        await expect(this.page.getByRole('cell', { name: reason, exact: true })).toBeVisible();
    }

        private errorText(message: string): Locator {
        return this.page.getByText(message, { exact: true });
    }

    async verifyRequiredValidations() {
        await this.openCreatePanel();

        await this.reasonInput.click();
        await this.reasonInput.press('Tab');
        await expect(this.errorText(ValidationMessages.REASON_REQUIRED)).toBeVisible();

        await this.tenantSelect.click();
        await this.page.keyboard.press('Escape');
        await expect(this.errorText(ValidationMessages.TENANT_REQUIRED)).toBeVisible();
    }

    async verifyMinLengthValidation(value: string) {
        await this.reasonInput.fill(value);
        await this.reasonInput.press('Tab');
        await expect(this.errorText(ValidationMessages.REASON_MIN_LENGTH)).toBeVisible();
    }

    async verifyFormatValidation(values: string[]) {
        for (const value of values) {
            await this.reasonInput.fill(value);
            await this.reasonInput.press('Tab');
            await expect(this.errorText(ValidationMessages.REASON_FORMAT)).toBeVisible();
        }
    }
}