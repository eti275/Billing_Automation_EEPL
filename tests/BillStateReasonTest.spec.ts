import { test, Page } from '@playwright/test';
import { BillStateChangeReasonPage } from '../pages/BillStateChangeReasonPage';
import { BillStateReasonData } from './billcycleTestData';
import { SuccessMessages } from './constants';

test.describe.configure({ mode: 'serial' });

let page: Page;
let reasonPage: BillStateChangeReasonPage;

test.beforeAll(async ({ browser, baseURL }) => {
    page = await browser.newPage({ baseURL, storageState: 'playwright/.auth/admin.json' });
    reasonPage = new BillStateChangeReasonPage(page);

    await page.goto('http://10.254.240.102:4880/Configuration/Billing/Bill-State-Change-Reason');
});

test.afterAll(async () => {
    await page.close();
});

test('BSCR_001 Verify field validations and Reset clears the form', async () => {
    // Validations
    await reasonPage.verifyRequiredValidations();
    await reasonPage.verifyMinLengthValidation('ab');
    await reasonPage.verifyFormatValidation(['1abc', ' abc', 'ab  cd']);

    // Reset
    await reasonPage.fillForm('reset check', BillStateReasonData.tenant);
    await reasonPage.reset();
    await reasonPage.verifyFormReset(BillStateReasonData.tenant);
});

test('BSCR_002 Verify Bill State Change Reason is created successfully', async () => {
    await reasonPage.createReason(BillStateReasonData.reason, BillStateReasonData.tenant);
    await reasonPage.getAndVerifySuccessMessage(SuccessMessages.BILL_STATE_REASON_CREATED);
    await reasonPage.verifyReasonInTable(BillStateReasonData.reason);
});

test('BSCR_003 Verify created Bill State Change Reason can be searched', async () => {
    await reasonPage.searchRecord(BillStateReasonData.reason);
    await reasonPage.verifyReasonInTable(BillStateReasonData.reason);
});

test('BSCR_004 Verify Bill State Change Reason can be deactivated and then activated', async () => {
    await reasonPage.searchRecord(BillStateReasonData.reason);
    
    // Deactivate
    await reasonPage.toggleRecord(BillStateReasonData.reason, false, SuccessMessages.DEACTIVATION_SUCCESS);

    await page.waitForTimeout(3000); // Wait for the status change to reflect in the UI 

    // Activate the same record
    await reasonPage.toggleRecord(BillStateReasonData.reason, true, SuccessMessages.ACTIVATION_SUCCESS);
});


