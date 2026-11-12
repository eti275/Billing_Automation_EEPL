import { expect, Locator, Page } from '@playwright/test';
import { BasePage } from './BasePage';
import { ValidationMessages } from '../tests/constants';

export interface NewUser {
    name: string;
    email: string;
    password: string;
    tenant: string;
}

export class UserManagementPage extends BasePage {

    readonly createButton: Locator;
    readonly fullNameInput: Locator;
    readonly emailInput: Locator;
    readonly passwordInput: Locator;
    readonly tenantSelect: Locator;
    readonly roleSelect: Locator;
    readonly submitButton: Locator;
    readonly updateButton: Locator;

    constructor(page: Page) {
        super(page);
        this.createButton = page.getByRole('button', { name: 'Create User' });
        this.fullNameInput = page.getByRole('textbox', { name: 'Enter full name' });
        this.emailInput = page.getByRole('textbox', { name: 'Enter email address' });
        this.passwordInput = page.getByRole('textbox', { name: 'Enter password' });
        this.tenantSelect = page.getByRole('combobox', { name: 'Select tenant' });
        this.roleSelect = page.getByRole('combobox', { name: 'Select role' });
        this.submitButton = page.getByRole('button', { name: 'Submit' });
        this.updateButton = page.getByRole('button', { name: 'Update' });
    }

    private rowOf(name: string): Locator {
        return this.page.getByRole('row').filter({ hasText: name }).first();
    }

    async openCreatePanel() {
        if (!(await this.fullNameInput.isVisible())) await this.createButton.click();
    }

    // Roles depend on the tenant, so the first available role is picked after the tenant is selected
    async selectFirstRole() {
        await this.waitForLoader();
        await this.roleSelect.click();
        await this.page.getByRole('option').first().click();
    }

    async createUser(user: NewUser) {
        await this.openCreatePanel();
        await this.fullNameInput.fill(user.name);
        await this.emailInput.fill(user.email);
        await this.passwordInput.fill(user.password);
        await this.selectMatOption(this.tenantSelect, user.tenant);
        await this.selectFirstRole();
        await this.selectAllZoneRegionState();
        await this.submitButton.click();
    }

    async verifyRequiredValidations() {
        await this.openCreatePanel();
        await this.verifyRequiredFields([
            { field: this.fullNameInput, label: 'Full Name' },
            { field: this.emailInput, label: 'Email' },
            { field: this.passwordInput, label: 'Password' },
            { field: this.tenantSelect, label: 'Tenant' }
        ]);
    }

 async verifyInvalidNames(values: string[]) {
        await this.openCreatePanel();
        await this.verifyInvalidTextValues(this.fullNameInput, values, ValidationMessages.REASON_MIN_LENGTH);
        await this.verifyInvalidTextValues(this.fullNameInput, values, ValidationMessages.USER_NAME_FORMAT);
       
}

    async verifyReset(user: NewUser) {
        await this.openCreatePanel();
        await this.fullNameInput.fill(user.name);
        await this.emailInput.fill(user.email);
        await this.passwordInput.fill(user.password);
        await this.selectMatOption(this.tenantSelect, user.tenant);
        await this.clickReset();
        await this.verifyFormReset([this.fullNameInput, this.emailInput, this.passwordInput], ['Select tenant']);
    }

    async editUserName(currentName: string, newName: string) {
        const editButton = this.rowOf(currentName).getByRole('button', { description: 'Edit', exact: true });
        await this.scrollToElement(editButton);
        await editButton.click();
        await this.fullNameInput.fill(newName);
        await this.updateButton.click();
    }

    // Users use a slider toggle; the Status column text confirms the result
    async setUserStatus(name: string, active: boolean, successMessage: string) {
        await this.waitForLoader();
        const row = this.rowOf(name);
        await expect(row).toBeVisible({ timeout: 15000 });

        const status = row.getByRole('cell', { name: /^(Active|Inactive)$/ });
        const expected = active ? 'Active' : 'Inactive';
        if ((await status.innerText()).trim() === expected) return;   // already in the requested state

        const slider = row.locator('.slider');
        await this.scrollToElement(slider);
        await slider.click();
        await this.page.getByRole('dialog').getByRole('button', { name: 'Yes' }).click();
        await this.getAndVerifySuccessMessage(successMessage);

        await this.waitForLoader();
        await expect(status).toHaveText(expected);
    }

        private async openViewDetails(name: string): Promise<Locator> {
        const viewButton = this.rowOf(name).getByRole('button', { description: 'View Details', exact: true });
        await this.scrollToElement(viewButton);
        await viewButton.click();
        return this.page.getByRole('dialog');
    }

    // Opens View Details and checks the Location Details dialog
    async verifyLocationDetails(name: string) {
        const dialog = await this.openViewDetails(name);
        await expect(dialog).toContainText(name);
        await expect(dialog).toContainText('Location Details');
        for (const header of ['Zone', 'Region', 'State']) {
            await expect(dialog.getByRole('columnheader', { name: header })).toBeVisible();
        }
        await this.closeDialog();
    }

    // Edits the zone, region and state of a user (first option of each) and returns the selected names
    async editUserLocation(name: string): Promise<{ zone: string; region: string; state: string }> {
        const editButton = this.rowOf(name).getByRole('button', { description: 'Edit', exact: true });
        await this.scrollToElement(editButton);
        await editButton.click();

        const dialog = this.page.getByRole('dialog');
        const zone = await this.selectOnlyFirstOption(dialog.getByRole('combobox', { name: /zone/i }));
        await this.waitForLoader();                      // region options depend on the zone
        const region = await this.selectOnlyFirstOption(dialog.getByRole('combobox', { name: /region/i }));
        await this.waitForLoader();                      // state options depend on the region
        const state = await this.selectOnlyFirstOption(dialog.getByRole('combobox', { name: /state/i }));

        await this.updateButton.click();
        return { zone, region, state };
    }

    // The updated zone, region and state must show together in one row of the Location Details dialog
    async verifyLocationValues(name: string, expected: { zone: string; region: string; state: string }) {
        const dialog = await this.openViewDetails(name);
        const row = dialog.getByRole('row')
            .filter({ hasText: expected.zone })
            .filter({ hasText: expected.region })
            .filter({ hasText: expected.state });
        await expect(row.first()).toBeVisible();
        await this.closeDialog();
    }
}