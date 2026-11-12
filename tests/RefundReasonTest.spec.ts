import { test, Page } from '@playwright/test';
import { RefundReasonPage } from '../pages/RefundReasonPage';
import { RefundReasonData } from './billcycleTestData';
import { SuccessMessages } from './constants';

test.describe.configure({ mode: 'serial' });

let page: Page;
let refundPage: RefundReasonPage;

test.beforeAll(async ({ browser, baseURL }) => {
    page = await browser.newPage({ baseURL, storageState: 'playwright/.auth/admin.json' });
    refundPage = new RefundReasonPage(page);
    await page.goto('http://10.254.240.102:4880/Configuration/Refund/Refund-Reasons');
});

test.afterAll(async () => {
    await page.close();
});

test('RR_001 Verify required field validations', async () => {
    await refundPage.verifyRequiredValidations();
});

test('RR_002 Verify invalid name validations', async () => {
    await refundPage.verifyInvalidNames(RefundReasonData.invalidNames);
});

test('RR_003 Verify Reset clears the form', async () => {
    await refundPage.verifyReset('reset check', RefundReasonData.tenant);
    await refundPage.closeDialog();
});

test('RR_004 Verify Refund Reason is created successfully', async () => {
    await refundPage.createRecord(RefundReasonData.name, RefundReasonData.tenant);
    await refundPage.getAndVerifySuccessMessage(SuccessMessages.REFUND_REASON_CREATED);
    await refundPage.verifyRecordInTable(RefundReasonData.name);
});

test('RR_005 Verify created Refund Reason can be searched', async () => {
    await refundPage.searchRecord(RefundReasonData.name);
    await refundPage.verifyRecordInTable(RefundReasonData.name);
});

test('RR_006 Verify Refund Reason can be deactivated and then activated', async () => {
    await refundPage.searchRecord(RefundReasonData.name);
    await refundPage.toggleRecord(RefundReasonData.name, false, SuccessMessages.DEACTIVATION_SUCCESS);
    await refundPage.toggleRecord(RefundReasonData.name, true, SuccessMessages.ACTIVATION_SUCCESS);
});

test('RR_007 Verify pagination (next and previous page)', async () => {
    await refundPage.clearSearch();
    await refundPage.verifyPagination();
});