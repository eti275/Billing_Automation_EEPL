import { test, Page } from '@playwright/test';
import { BackoutReasonPage } from '../pages/BackoutReasonPage';
import { BackoutReasonData } from './billcycleTestData';
import { SuccessMessages } from './constants';

test.describe.configure({ mode: 'serial' });

let page: Page;
let backoutPage: BackoutReasonPage;

test.beforeAll(async ({ browser, baseURL }) => {
    page = await browser.newPage({ baseURL, storageState: 'playwright/.auth/admin.json' });
    backoutPage = new BackoutReasonPage(page);
    await page.goto('http://10.254.240.102:4880/Configuration/Backout/Backout-Reasons');
});

test.afterAll(async () => {
    await page.close();
});

test('BR_001 Verify required field validations', async () => {
    await backoutPage.verifyRequiredValidations();
});

test('BR_002 Verify invalid name validations', async () => {
    await backoutPage.verifyInvalidNames(BackoutReasonData.invalidNames);
});

test('BR_003 Verify Reset clears the form', async () => {
    await backoutPage.verifyReset('reset check', BackoutReasonData.tenant);
    await backoutPage.closeDialog();
});

test('BR_004 Verify Backout Reason is created successfully', async () => {
    await backoutPage.createRecord(BackoutReasonData.name, BackoutReasonData.tenant);
    await backoutPage.getAndVerifySuccessMessage(SuccessMessages.BACKOUT_REASON_CREATED);
    await backoutPage.verifyRecordInTable(BackoutReasonData.name);
});

test('BR_005 Verify created Backout Reason can be searched', async () => {
    await backoutPage.searchRecord(BackoutReasonData.name);
    await backoutPage.verifyRecordInTable(BackoutReasonData.name);
});

test('BR_006 Verify Backout Reason can be deactivated and then activated', async () => {
    await backoutPage.searchRecord(BackoutReasonData.name);
    await backoutPage.toggleRecord(BackoutReasonData.name, false, SuccessMessages.DEACTIVATION_SUCCESS);
    await backoutPage.toggleRecord(BackoutReasonData.name, true, SuccessMessages.ACTIVATION_SUCCESS);
});

test('BR_007 Verify pagination (next and previous page)', async () => {
    await backoutPage.clearSearch();
    await backoutPage.verifyPagination();
});