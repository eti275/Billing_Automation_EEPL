import { Locator, Page } from '@playwright/test';
import { BasePage } from './BasePage';
import { ValidationMessages } from '../tests/constants';

export type DueDateType = 'OFFSET' | 'FIXED';

export class PaymentTermPage extends BasePage {

    readonly createButton: Locator;
    readonly nameInput: Locator;
    readonly dueDateTypeSelect: Locator;
    readonly baseDateSelect: Locator;
    readonly offsetDaysInput: Locator;
    readonly dayOfMonthInput: Locator;
    readonly tenantSelect: Locator;
    readonly lateFeesSelect: Locator;
    readonly submitButton: Locator;

    constructor(page: Page) {
        super(page);
        this.createButton = page.getByRole('button', { name: 'Create Payment Term' });
        this.nameInput = page.getByRole('textbox', { name: 'Payment Term Name' });
        // The combobox name changes after a selection, so the regex also includes the selected values
        this.dueDateTypeSelect = page.getByRole('combobox', { name: /Select Due Date Type|^OFFSET$|^FIXED$/ });
        this.baseDateSelect = page.getByRole('combobox', { name: /Select Base Date|^BILL_DATE$|^INVOICE_DATE$/ });
        this.offsetDaysInput = page.getByRole('spinbutton', { name: /Offset Days/ });
        this.dayOfMonthInput = page.getByRole('spinbutton', { name: /Day of Month/ });
        this.tenantSelect = page.getByRole('combobox', { name: 'Select Tenant' });
        this.lateFeesSelect = page.getByRole('combobox', { name: 'Select Late Fees Policy' });
        this.submitButton = page.getByRole('button', { name: 'Submit' });
    }

    async openCreatePanel() {
        if (!(await this.nameInput.isVisible())) await this.createButton.click();
    }

    // OFFSET shows the Offset Days field, FIXED shows the Day of Month field
    private daysInput(type: DueDateType): Locator {
        return type === 'OFFSET' ? this.offsetDaysInput : this.dayOfMonthInput;
    }

    // Picks the given Late Fees Policy, or the first available one when no name is passed
    async selectLateFeesPolicy(policyName?: string) {
        if (policyName) {
            await this.selectMatOption(this.lateFeesSelect, policyName);
        } else {
            await this.lateFeesSelect.click();
            await this.page.getByRole('option').first().click();
        }
    }

    async createPaymentTerm(name: string, type: DueDateType, baseDate: string, days: string, tenant: string) {
        await this.openCreatePanel();
        await this.nameInput.fill(name);
        await this.selectMatOption(this.dueDateTypeSelect, type);
        await this.selectMatOption(this.baseDateSelect, baseDate);
        await this.daysInput(type).fill(days);
        await this.selectMatOption(this.tenantSelect, tenant);
        await this.selectAllZoneRegionState();
        await this.selectLateFeesPolicy();
        await this.submitButton.click();
    }

    async verifyRequiredValidations() {
        await this.openCreatePanel();
        await this.verifyRequiredFields([
            { field: this.nameInput, label: 'Payment Term Name' },
            { field: this.dueDateTypeSelect, label: 'Due Date Type' },
            { field: this.baseDateSelect, label: 'Base Date' },
            { field: this.tenantSelect, label: 'Tenant' }
        ]);
    }

    async verifyInvalidNames(values: string[]) {
        await this.openCreatePanel();
        await this.verifyInvalidTextValues(this.nameInput, values, ValidationMessages.ROLE_NAME_FORMAT);
    }

    async verifyReset(name: string, baseDate: string, tenant: string) {
        await this.openCreatePanel();
        await this.nameInput.fill(name);
        await this.selectMatOption(this.dueDateTypeSelect, 'OFFSET');
        await this.selectMatOption(this.baseDateSelect, baseDate);
        await this.selectMatOption(this.tenantSelect, tenant);
        await this.clickReset();
        await this.verifyFormReset([this.nameInput], ['Select Due Date Type', 'Select Base Date', 'Select Tenant']);
    }

    // The app blocks typing beyond the limit (OFFSET max 999, FIXED max 31)
    async verifyDaysInputLimit(type: DueDateType, typed: string, maxAllowed: number) {
        await this.openCreatePanel();
        await this.selectMatOption(this.dueDateTypeSelect, type);
        await this.verifyNumericInputLimit(this.daysInput(type), typed, maxAllowed);
    }
}