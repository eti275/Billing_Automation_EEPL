import { test, Page } from '@playwright/test';
import { DepositTypePage } from '../pages/DepositTypePage';
import { DepositTypeData } from './billcycleTestData';
import { SuccessMessages } from './constants';

test.describe.configure({ mode: 'serial' });

let page: Page;
let depositPage: DepositTypePage;

test.beforeAll(async ({ browser, baseURL }) => {
    page = await browser.newPage({ baseURL, storageState: 'playwright/.auth/admin.json' });
    depositPage = new DepositTypePage(page);
    await page.goto('http://10.254.240.102:4880/Configuration/Deposit/Deposit-Types');
});

test.afterAll(async () => {
    await page.close();
});

test('DT_001 Verify required field validations', async () => {
    await depositPage.verifyRequiredValidations();
});

test('DT_002 Verify invalid name validations', async () => {
    await depositPage.verifyInvalidNames(DepositTypeData.invalidNames);
});

test('DT_003 Verify Reset clears the form', async () => {
    await depositPage.verifyReset('reset check', DepositTypeData.tenant);
    await depositPage.closeDialog();
});

test('DT_004 Verify Deposit Type is created successfully', async () => {
    await depositPage.createRecord(DepositTypeData.name, DepositTypeData.tenant);
    await depositPage.getAndVerifySuccessMessage(SuccessMessages.DEPOSIT_TYPE_CREATED);
    await depositPage.verifyRecordInTable(DepositTypeData.name);
});

test('DT_005 Verify created Deposit Type can be searched', async () => {
    await depositPage.searchRecord(DepositTypeData.name);
    await depositPage.verifyRecordInTable(DepositTypeData.name);
});

test('DT_006 Verify Deposit Type can be deactivated and then activated', async () => {
    await depositPage.searchRecord(DepositTypeData.name);
    await depositPage.toggleRecord(DepositTypeData.name, false, SuccessMessages.DEACTIVATION_SUCCESS);
    await depositPage.toggleRecord(DepositTypeData.name, true, SuccessMessages.ACTIVATION_SUCCESS);
});

test('DT_007 Verify pagination (next and previous page)', async () => {
    await depositPage.clearSearch();
    await depositPage.verifyPagination();
});