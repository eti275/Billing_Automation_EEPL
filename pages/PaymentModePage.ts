import { expect, Locator, Page } from '@playwright/test';
import { BasePage } from './BasePage';
import { ValidationMessages } from '../tests/constants';

export class PaymentModePage extends BasePage {

    readonly createButton: Locator;
    readonly paymentModeInput: Locator;
    readonly tenantSelect: Locator;
    readonly submitButton: Locator;

    constructor(page: Page) {
        super(page);
        this.createButton = page.getByRole('button', { name: 'Create Payment Mode' });
        this.paymentModeInput = page.getByRole('textbox', { name: 'Payment Mode' });
        this.tenantSelect = page.getByRole('combobox', { name: 'Select Tenant' });
        this.submitButton = page.getByRole('button', { name: 'Submit' });
    }

    async openCreatePanel() {
        if (!(await this.paymentModeInput.isVisible())) await this.createButton.click();
    }

    async createPaymentMode(name: string, tenant: string) {
        await this.openCreatePanel();
        await this.paymentModeInput.fill(name);
        await this.selectMatOption(this.tenantSelect, tenant);
        await this.selectAllZoneRegionState();
        await this.submitButton.click();
    }

    async verifyRequiredValidations() {
        await this.openCreatePanel();

        await this.paymentModeInput.click();
        await this.paymentModeInput.press('Tab');
        await expect(this.page.getByText(ValidationMessages.PAYMENT_MODE_REQUIRED, { exact: true })).toBeVisible();

        await this.tenantSelect.click();
        await this.page.keyboard.press('Escape');
        await expect(this.page.getByText(ValidationMessages.TENANT_REQUIRED, { exact: true })).toBeVisible();
    }

         async verifyInvalidNames(values: string[]) {
        await this.verifyInvalidTextValues(this.paymentModeInput, values, ValidationMessages.REASON_FORMAT);
    }

    async verifyReset(name: string, tenant: string) {
        await this.openCreatePanel();
        await this.paymentModeInput.fill(name);
        await this.selectMatOption(this.tenantSelect, tenant);
        await this.selectAllZoneRegionState();
        await this.clickReset();
        await this.verifyFormReset([this.paymentModeInput], ['Select Tenant', 'Select Zone']);
    }
}
