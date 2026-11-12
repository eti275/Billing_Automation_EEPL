import { test, Page } from '@playwright/test';
import { PaymentTermPage } from '../pages/PaymentTermPage';
import { PaymentTermData } from './billcycleTestData';
import { SuccessMessages } from './constants';

test.describe.configure({ mode: 'serial' });

let page: Page;
let paymentTermPage: PaymentTermPage;

test.beforeAll(async ({ browser, baseURL }) => {
    page = await browser.newPage({ baseURL, storageState: 'playwright/.auth/admin.json' });
    paymentTermPage = new PaymentTermPage(page);
    await page.goto('/Configuration/Payment/Payment-Terms');
});

test.afterAll(async () => {
    await page.close();
});

test('PT_001 Verify required field validations', async () => {
    await paymentTermPage.verifyRequiredValidations();
});

test('PT_002 Verify invalid name validations', async () => {
    await paymentTermPage.verifyInvalidNames(PaymentTermData.invalidNames);
});

test('PT_003 Verify Reset clears the form', async () => {
    await paymentTermPage.verifyReset('reset check', PaymentTermData.baseDate, PaymentTermData.tenant);
    await paymentTermPage.closeDialog();
});

test('PT_004 Verify OFFSET days limit (999)', async () => {
    await paymentTermPage.verifyDaysInputLimit('OFFSET', PaymentTermData.invalidOffsetDays, PaymentTermData.maxOffsetDays);
    await paymentTermPage.closeDialog();
});

test('PT_005 Verify FIXED day of month limit (31)', async () => {
    await paymentTermPage.verifyDaysInputLimit('FIXED', PaymentTermData.invalidDayOfMonth, PaymentTermData.maxDayOfMonth);
    await paymentTermPage.closeDialog();
});

test('PT_006 Verify Payment Term is created with OFFSET due date type', async () => {
    await paymentTermPage.createPaymentTerm(PaymentTermData.offsetName, 'OFFSET', PaymentTermData.baseDate, PaymentTermData.offsetDays, PaymentTermData.tenant);
    await paymentTermPage.getAndVerifySuccessMessage(SuccessMessages.PAYMENT_TERM_CREATED);
    await paymentTermPage.verifyRecordInTable(PaymentTermData.offsetName);
});

test('PT_007 Verify Payment Term is created with FIXED due date type', async () => {
    await paymentTermPage.createPaymentTerm(PaymentTermData.fixedName, 'FIXED', PaymentTermData.baseDate, PaymentTermData.dayOfMonth, PaymentTermData.tenant);
    await paymentTermPage.getAndVerifySuccessMessage(SuccessMessages.PAYMENT_TERM_CREATED);
    await paymentTermPage.verifyRecordInTable(PaymentTermData.fixedName);
});

test('PT_008 Verify created Payment Terms can be searched', async () => {
    await paymentTermPage.searchRecord(PaymentTermData.offsetName);
    await paymentTermPage.verifyRecordInTable(PaymentTermData.offsetName);

    await paymentTermPage.searchRecord(PaymentTermData.fixedName);
    await paymentTermPage.verifyRecordInTable(PaymentTermData.fixedName);
});

test('PT_009 Verify Payment Term can be deactivated and then activated', async () => {
    await paymentTermPage.searchRecord(PaymentTermData.offsetName);
    await paymentTermPage.toggleRecord(PaymentTermData.offsetName, false, SuccessMessages.DEACTIVATION_SUCCESS);
    await paymentTermPage.toggleRecord(PaymentTermData.offsetName, true, SuccessMessages.ACTIVATION_SUCCESS);
});

test('PT_010 Verify pagination (next and previous page)', async () => {
    await paymentTermPage.clearSearch();
    await paymentTermPage.verifyPagination();
});