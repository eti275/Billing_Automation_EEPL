import { test, Page } from '@playwright/test';
import { PaymentModePage } from '../pages/PaymentModePage';
import { PaymentModeData } from './billcycleTestData';
import { SuccessMessages } from './constants';

test.describe.configure({ mode: 'serial' });

let page: Page;
let paymentModePage: PaymentModePage;

test.beforeAll(async ({ browser, baseURL }) => {
    page = await browser.newPage({ baseURL, storageState: 'playwright/.auth/admin.json' });
    paymentModePage = new PaymentModePage(page);
    await page.goto('http://10.254.240.102:4880/Configuration/Payment/Payment-Modes     ');
});

test.afterAll(async () => {
    await page.close();
});

test('PM_001 Verify required field validations', async () => {
    await paymentModePage.verifyRequiredValidations();
});

test('PM_002 Verify invalid name validations', async () => {
    await paymentModePage.verifyInvalidNames(PaymentModeData.invalidNames);
});

test('PM_003 Verify Reset clears the form', async () => {
    await paymentModePage.verifyReset('reset check', PaymentModeData.tenant);
    await paymentModePage.closeDialog();
});

test('PM_004 Verify Payment Mode is created successfully', async () => {
    await paymentModePage.createPaymentMode(PaymentModeData.name, PaymentModeData.tenant);
    await paymentModePage.getAndVerifySuccessMessage(SuccessMessages.PAYMENT_MODE_CREATED);
    await paymentModePage.verifyRecordInTable(PaymentModeData.name);
});

test('PM_005 Verify created Payment Mode can be searched', async () => {
    await paymentModePage.searchRecord(PaymentModeData.name);
    await paymentModePage.verifyRecordInTable(PaymentModeData.name);
});

test('PM_006 Verify Payment Mode can be deactivated and then activated', async () => {
    await paymentModePage.searchRecord(PaymentModeData.name);
    await paymentModePage.toggleRecord(PaymentModeData.name, false, SuccessMessages.DEACTIVATION_SUCCESS);
    await paymentModePage.toggleRecord(PaymentModeData.name, true, SuccessMessages.ACTIVATION_SUCCESS);
});

test('PM_007 Verify pagination (next and previous page)', async () => {
    await paymentModePage.clearSearch();
    await paymentModePage.verifyPagination();
});