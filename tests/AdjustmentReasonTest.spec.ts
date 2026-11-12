import { test, Page } from '@playwright/test';
import { AdjustmentReasonPage } from '../pages/AdjustmentReasonPage';
import { AdjustmentReasonData } from './billcycleTestData';
import { SuccessMessages } from './constants';

test.describe.configure({ mode: 'serial' });

let page: Page;
let adjustmentPage: AdjustmentReasonPage;

test.beforeAll(async ({ browser, baseURL }) => {
    page = await browser.newPage({ baseURL, storageState: 'playwright/.auth/admin.json' });
    adjustmentPage = new AdjustmentReasonPage(page);
    await page.goto('/Configuration/Adjustment/Adjustment-Reasons');
});

test.afterAll(async () => {
    await page.close();
});

test('ADJ_001 Verify required field validations', async () => {
    await adjustmentPage.verifyRequiredValidations();
});

test('ADJ_002 Verify invalid name validations', async () => {
    await adjustmentPage.verifyInvalidNames(AdjustmentReasonData.invalidNames);
});

test('ADJ_003 Verify Reset clears the form', async () => {
    await adjustmentPage.verifyReset('reset check', AdjustmentReasonData.tenant);
    await adjustmentPage.closeDialog();
});

test('ADJ_004 Verify Adjustment Reason is created successfully', async () => {
    await adjustmentPage.createRecord(AdjustmentReasonData.name, AdjustmentReasonData.tenant);
    await adjustmentPage.getAndVerifySuccessMessage(SuccessMessages.ADJUSTMENT_REASON_CREATED);
    await adjustmentPage.verifyRecordInTable(AdjustmentReasonData.name);
});

test('ADJ_005 Verify created Adjustment Reason can be searched', async () => {
    await adjustmentPage.searchRecord(AdjustmentReasonData.name);
    await adjustmentPage.verifyRecordInTable(AdjustmentReasonData.name);
});

test('ADJ_006 Verify Adjustment Reason can be deactivated and then activated', async () => {
    await adjustmentPage.searchRecord(AdjustmentReasonData.name);
    await adjustmentPage.toggleRecord(AdjustmentReasonData.name, false, SuccessMessages.DEACTIVATION_SUCCESS);
    await adjustmentPage.toggleRecord(AdjustmentReasonData.name, true, SuccessMessages.ACTIVATION_SUCCESS);
});

test('ADJ_007 Verify pagination (next and previous page)', async () => {
    await adjustmentPage.clearSearch();
    await adjustmentPage.verifyPagination();
}); 