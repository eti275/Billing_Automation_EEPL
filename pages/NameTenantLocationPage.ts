import { Locator, Page } from '@playwright/test';
import { BasePage } from './BasePage';

export interface NameFormConfig {
    createButtonName: string;   // e.g. 'Create Refund Reason'
    nameInputName: string;      // e.g. 'Enter Refund Reason'
    nameLabel: string;          // e.g. 'Refund Reason' (used for the "<label> is required" message)
    formatMessage: string;      // validation text shown for invalid names
}

// Shared page for forms that have: name, tenant, zone, region and state
export class NameTenantLocationPage extends BasePage {

    readonly createButton: Locator;
    readonly nameInput: Locator;
    readonly tenantSelect: Locator;
    readonly submitButton: Locator;

    constructor(page: Page, protected readonly config: NameFormConfig) {
        super(page);
        this.createButton = page.getByRole('button', { name: config.createButtonName });
        this.nameInput = page.getByRole('textbox', { name: config.nameInputName });
        this.tenantSelect = page.getByRole('combobox', { name: 'Select Tenant' });
        this.submitButton = page.getByRole('button', { name: 'Submit' });
    }

    async openCreatePanel() {
        if (!(await this.nameInput.isVisible())) await this.createButton.click();
    }

    async createRecord(name: string, tenant: string) {
        await this.openCreatePanel();
        await this.nameInput.fill(name);
        await this.selectMatOption(this.tenantSelect, tenant);
        await this.selectAllZoneRegionState();
        await this.submitButton.click();
    }

    async verifyRequiredValidations() {
        await this.openCreatePanel();
        await this.verifyRequiredFields([
            { field: this.nameInput, label: this.config.nameLabel },
            { field: this.tenantSelect, label: 'Tenant' }
        ]);
    }

    async verifyInvalidNames(values: string[]) {
        await this.openCreatePanel();
        await this.verifyInvalidTextValues(this.nameInput, values, this.config.formatMessage);
    }

    async verifyReset(name: string, tenant: string) {
        await this.openCreatePanel();
        await this.nameInput.fill(name);
        await this.selectMatOption(this.tenantSelect, tenant);
        await this.selectAllZoneRegionState();
        await this.clickReset();
        await this.verifyFormReset([this.nameInput], ['Select Tenant', 'Select Zone']);
    }
}