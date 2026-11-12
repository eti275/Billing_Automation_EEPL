import { expect, Locator, Page } from '@playwright/test';
import { BasePage } from './BasePage';
import { ValidationMessages } from '../tests/constants';

export interface LateFeeRule {
    lowerLimit?: string;      // only the first rule is editable, later rules are auto-calculated
    upperLimit: string;
    feeType: string;          // FLAT | PERCENTAGE | INTEREST
    feeValue: string;
    calculationBase: string;  // OUTSTANDING_AMOUNT | INVOICE_AMOUNT | CURRENT_BALANCE
    maxFee: string;
}

export interface LateFeePolicy {
    name: string;
    description: string;
    graceDays: string;
    percentage: string;
    tenant: string;
    rules: LateFeeRule[];
}

export class LateFeePolicyPage extends BasePage {

    readonly createButton: Locator;
    readonly nameInput: Locator;
    readonly descriptionInput: Locator;
    readonly graceDaysInput: Locator;
    readonly percentageInput: Locator;
    readonly tenantSelect: Locator;
    readonly nextButton: Locator;
    readonly addRuleButton: Locator;
    readonly submitButton: Locator;

    constructor(page: Page) {
        super(page);
        this.createButton = page.getByRole('button', { name: 'Create Late Fee Policy' });
        this.nameInput = page.getByRole('textbox', { name: 'Enter Late Fee Policy Name' });
        this.descriptionInput = page.getByRole('textbox', { name: 'Enter Description' });
        this.graceDaysInput = page.getByRole('textbox', { name: 'Enter Grace Days' });
        this.percentageInput = page.getByRole('textbox', { name: 'Enter Percentage' });
        this.tenantSelect = page.getByRole('combobox', { name: 'Select Tenant' });
        this.nextButton = page.getByRole('button', { name: 'Next' });
        this.addRuleButton = page.getByRole('button', { name: 'Add Rule' });
        this.submitButton = page.getByRole('button', { name: 'Submit' });
    }

    // Fields of one rule row (row 0 is the first rule)
    private rule(index: number) {
        const row = this.page.locator('[id^="rule-row-"]').nth(index);
        return {
            lowerLimit: row.getByRole('textbox', { name: 'Enter Lower Limit' }),
            upperLimit: row.getByRole('textbox', { name: 'Enter Upper Limit' }),
            // The combobox name changes after a selection, so the regex also includes the selected values
            feeType: row.getByRole('combobox', { name: /Select Fee Type|^FLAT$|^PERCENTAGE$|^INTEREST$/ }),
            feeValue: row.getByRole('textbox', { name: 'Enter Fee Value' }),
            calculationBase: row.getByRole('combobox', { name: /Select Calculation Base|^OUTSTANDING_AMOUNT$|^INVOICE_AMOUNT$|^CURRENT_BALANCE$/ }),
            maxFee: row.getByRole('textbox', { name: 'Enter Max Fee Amount' })
        };
    }

    async openCreatePanel() {
        if (!(await this.nameInput.isVisible())) await this.createButton.click();
    }

    // Step 1: policy details
    async fillPolicyDetails(policy: LateFeePolicy) {
        await this.nameInput.fill(policy.name);
        await this.descriptionInput.fill(policy.description);
        await this.graceDaysInput.fill(policy.graceDays);
        await this.percentageInput.fill(policy.percentage);
        await this.selectMatOption(this.tenantSelect, policy.tenant);
        await this.selectAllZoneRegionState();
    }

    // Step 2: one rule row
    async fillRule(index: number, rule: LateFeeRule) {
        const fields = this.rule(index);
        if (rule.lowerLimit) await fields.lowerLimit.fill(rule.lowerLimit);
        await fields.upperLimit.fill(rule.upperLimit);
        await this.selectMatOption(fields.feeType, rule.feeType);
        await fields.feeValue.fill(rule.feeValue);
        await this.selectMatOption(fields.calculationBase, rule.calculationBase);
        await fields.maxFee.fill(rule.maxFee);
    }

        // Fills step 1 and clicks Next, which creates the policy and opens the rules step
    // Skips everything when the rules step is already open, so the policy is created only once
    async goToRulesStep(policy: LateFeePolicy) {
        if (await this.rule(0).upperLimit.isVisible()) return;   // already on the rules step
        await this.openCreatePanel();
        await this.fillPolicyDetails(policy);
        await this.nextButton.click();
    }
    
    async createPolicy(policy: LateFeePolicy) {
        await this.goToRulesStep(policy);

        for (let i = 0; i < policy.rules.length; i++) {
            if (i > 0) await this.addRuleButton.click();
            await this.fillRule(i, policy.rules[i]);
        }
        await this.submitButton.click();
    }

    async verifyRequiredValidations() {
        await this.openCreatePanel();
        await this.verifyRequiredFields([
            { field: this.nameInput, label: 'Late Fee Policy Name' },
            { field: this.graceDaysInput, label: 'Grace Days' },
            //{ field: this.percentageInput, label: 'Percentage' },
            { field: this.tenantSelect, label: 'Tenant' }
        ]);
    }

    async verifyInvalidNames(values: string[]) {
        await this.openCreatePanel();
        await this.verifyInvalidTextValues(this.nameInput, values, ValidationMessages.ROLE_NAME_FORMAT);
    }

    async verifyReset(policy: LateFeePolicy) {
        await this.openCreatePanel();
        await this.fillPolicyDetails(policy);
        await this.clickReset();
        await this.verifyFormReset(
            [this.nameInput, this.descriptionInput, this.graceDaysInput, this.percentageInput],
            ['Select Tenant', 'Select Zone']
        );
    }

    // The app blocks typing beyond the limit, so the field value must never exceed the max
    async verifyGraceDaysLimit(typed: string, maxAllowed: number) {
        await this.openCreatePanel();
        await this.verifyNumericInputLimit(this.graceDaysInput, typed, maxAllowed);
    }

    async verifyPercentageLimit(typed: string, maxAllowed: number) {
        await this.openCreatePanel();
        await this.verifyNumericInputLimit(this.percentageInput, typed, maxAllowed);
    }

    // Checks the required messages of the first rule
    async verifyRuleRequiredValidations(policy: LateFeePolicy) {
        await this.goToRulesStep(policy);

        const fields = this.rule(0);
        await this.verifyRequiredFields([
            { field: fields.upperLimit, label: 'Upper Limit' },
            { field: fields.feeType, label: 'Fee Type' },
            { field: fields.feeValue, label: 'Fee Value' },
            { field: fields.calculationBase, label: 'Calculation Base' },
            { field: fields.maxFee, label: 'Max Fee Amount' }
        ]);
    }

    // FLAT fee type: Max Fee Amount must be greater than or equal to Fee Value
    async verifyFlatMaxFeeValidation(policy: LateFeePolicy, invalidRule: LateFeeRule, validMaxFee: string) {
        await this.goToRulesStep(policy);
        await this.fillRule(0, invalidRule);            // maxFee is below feeValue

        const fields = this.rule(0);
        await fields.maxFee.press('Tab');
        const message = this.page.getByText(ValidationMessages.FLAT_MAX_FEE, { exact: true });
        await expect(message).toBeVisible();
        await expect(this.submitButton).toBeDisabled();

        // Fixing the value clears the message and enables Submit
        await fields.maxFee.fill(validMaxFee);
        await expect(message).toBeHidden();
        await expect(this.submitButton).toBeEnabled();
    }
}