import { test, Page } from '@playwright/test';
import { LateFeePolicyPage } from '../pages/LateFeePolicyPage';
import { LateFeePolicyData } from './billcycleTestData';
import { SuccessMessages } from './constants';

test.describe.configure({ mode: 'serial' });

let page: Page;
let lateFeePage: LateFeePolicyPage;

test.beforeAll(async ({ browser, baseURL }) => {
    page = await browser.newPage({ baseURL, storageState: 'playwright/.auth/admin.json' });
    lateFeePage = new LateFeePolicyPage(page);
    await page.goto('/Configuration/Late-Fee/Late-Fee-Policy');
});

test.afterAll(async () => {
    await page.close();
});

// Step 1 tests: Next is never clicked, so no policy is created
test('LF_001 Verify required field validations (policy details)', async () => {
    await lateFeePage.verifyRequiredValidations();
});

test('LF_002 Verify invalid name validations', async () => {
    await lateFeePage.verifyInvalidNames(LateFeePolicyData.invalidNames);
});

test('LF_003 Verify Reset clears the form', async () => {
    await lateFeePage.verifyReset(LateFeePolicyData);
    await lateFeePage.closeDialog();
});

test('LF_004 Verify Grace Days and Percentage limits', async () => {
    await lateFeePage.verifyGraceDaysLimit(LateFeePolicyData.graceDaysLimit.typed, LateFeePolicyData.graceDaysLimit.max);
    await lateFeePage.verifyPercentageLimit(LateFeePolicyData.percentageLimit.typed, LateFeePolicyData.percentageLimit.max);
    await lateFeePage.closeDialog();
});

// Step 2 tests: Next creates the policy once, LF_005 to LF_007 continue in the same dialog
test('LF_005 Verify required field validations (rules)', async () => {
    await lateFeePage.verifyRuleRequiredValidations(LateFeePolicyData);
});

test('LF_006 Verify Max Fee Amount must be greater than or equal to Fee Value for FLAT fee type', async () => {
    await lateFeePage.verifyFlatMaxFeeValidation(LateFeePolicyData, LateFeePolicyData.invalidFlatRule, LateFeePolicyData.validMaxFee);
});

test('LF_007 Verify Late Fee Policy is created with multiple rules', async () => {
    await lateFeePage.createPolicy(LateFeePolicyData);
    await lateFeePage.getAndVerifySuccessMessage(SuccessMessages.LATE_FEE_POLICY_CREATED);
    await lateFeePage.verifyRecordInTable(LateFeePolicyData.name);
});

test('LF_008 Verify created Late Fee Policy can be searched', async () => {
    await lateFeePage.searchRecord(LateFeePolicyData.name);
    await lateFeePage.verifyRecordInTable(LateFeePolicyData.name);
});

test('LF_009 Verify Late Fee Policy can be deactivated and then activated', async () => {
    await lateFeePage.searchRecord(LateFeePolicyData.name);
    await lateFeePage.toggleRecord(LateFeePolicyData.name, false, SuccessMessages.DEACTIVATION_SUCCESS);
    await lateFeePage.toggleRecord(LateFeePolicyData.name, true, SuccessMessages.ACTIVATION_SUCCESS);
});

test('LF_010 Verify pagination (next and previous page)', async () => {
    await lateFeePage.clearSearch();
    await lateFeePage.verifyPagination();
});