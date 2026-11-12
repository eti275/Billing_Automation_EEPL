import { Locator, Page } from '@playwright/test';
import { BasePage } from './BasePage';
import { ValidationMessages } from '../tests/constants';

export type TaxValueType = 'Percentage' | 'Fixed';

export class TaxTypePage extends BasePage {

    readonly createButton: Locator;
    readonly nameInput: Locator;
    readonly countrySelect: Locator;
    readonly taxValueTypeSelect: Locator;
    readonly taxRateInput: Locator;
    readonly fixedAmountInput: Locator;
    readonly tenantSelect: Locator;
    readonly submitButton: Locator;

    constructor(page: Page) {
        super(page);
        this.createButton = page.getByRole('button', { name: 'Create Tax Type' });
        this.nameInput = page.getByRole('textbox', { name: 'Enter Tax Name' });
        // The combobox name changes after a selection, so the regex also includes the selected values
        this.countrySelect = page.getByRole('combobox', { name: /Select Country|^Ghana$|^India$/ });
        this.taxValueTypeSelect = page.getByRole('combobox', { name: /^Percentage$|^Fixed$/ });
        this.taxRateInput = page.getByRole('spinbutton', { name: /Enter Tax Rate/ });
        this.fixedAmountInput = page.getByRole('textbox', { name: /Enter Fixed Amount/ });
        this.tenantSelect = page.getByRole('combobox', { name: 'Select Tenant' });
        this.submitButton = page.getByRole('button', { name: 'Submit' });
    }

    async openCreatePanel() {
        if (!(await this.nameInput.isVisible())) await this.createButton.click();
    }

    // Percentage shows the Tax Rate field, Fixed shows the Fixed Amount field
    private valueInput(type: TaxValueType): Locator {
        return type === 'Percentage' ? this.taxRateInput : this.fixedAmountInput;
    }

    async createTaxType(name: string, country: string, type: TaxValueType, value: string, tenant: string) {
        await this.openCreatePanel();
        await this.nameInput.fill(name);
        await this.selectMatOption(this.countrySelect, country);
        await this.selectMatOption(this.taxValueTypeSelect, type);
        await this.valueInput(type).fill(value);
        await this.selectMatOption(this.tenantSelect, tenant);
        await this.submitButton.click();
    }

    async verifyRequiredValidations() {
        await this.openCreatePanel();
        await this.verifyRequiredFields([
            { field: this.nameInput, label: 'Tax Name' },
            { field: this.countrySelect, label: 'Country' },
            { field: this.taxRateInput, label: 'Tax Rate' },
            { field: this.tenantSelect, label: 'Tenant' }
        ]);
    }

    async verifyNameValidations(invalidNames: string[], shortName: string) {
        await this.openCreatePanel();
        await this.verifyInvalidTextValues(this.nameInput, invalidNames, ValidationMessages.ROLE_NAME_FORMAT);
        await this.verifyInvalidTextValues(this.nameInput, [shortName], ValidationMessages.REASON_MIN_LENGTH);
    }

    async verifyReset(name: string, country: string, rate: string, tenant: string) {
        await this.openCreatePanel();
        await this.nameInput.fill(name);
        await this.selectMatOption(this.countrySelect, country);
        await this.taxRateInput.fill(rate);
          await this.clickReset();
        await this.verifyFormReset([this.nameInput, this.taxRateInput], ['Select Country', 'Select Tenant']);
    }
    
    async verifyTaxRateLimit(typed: string, maxAllowed: number) {
        await this.openCreatePanel();
        await this.selectMatOption(this.taxValueTypeSelect, 'Percentage');
        await this.verifyNumericInputLimit(this.taxRateInput, typed, maxAllowed);
    }

    async verifyFixedAmountLimit(typed: string, maxAllowed: number) {
        await this.openCreatePanel();
        await this.selectMatOption(this.taxValueTypeSelect, 'Fixed');
        await this.verifyNumericInputLimit(this.fixedAmountInput, typed, maxAllowed);
    }
}