import { test, Page } from '@playwright/test';
import { TaxTypePage } from '../pages/TaxTypePage';
import { TaxTypeData } from './billcycleTestData';
import { SuccessMessages } from './constants';

test.describe.configure({ mode: 'serial' });

let page: Page;
let taxTypePage: TaxTypePage;

test.beforeAll(async ({ browser, baseURL }) => {
    page = await browser.newPage({ baseURL, storageState: 'playwright/.auth/admin.json' });
    taxTypePage = new TaxTypePage(page);
    await page.goto('http://10.254.240.102:4880/Configuration/Taxation/Tax-Types');
});

test.afterAll(async () => {
    await page.close();
});

test('TT_001 Verify required field validations', async () => {
    await taxTypePage.verifyRequiredValidations();
});

test('TT_002 Verify name validations', async () => {
    await taxTypePage.verifyNameValidations(TaxTypeData.invalidNames, TaxTypeData.shortName);
});

test('TT_003 Verify Reset clears the form', async () => {
    await taxTypePage.verifyReset('reset check', TaxTypeData.country, TaxTypeData.taxRate, TaxTypeData.tenant);
    await taxTypePage.closeDialog();
});

test('TT_004 Verify Tax Rate limit (100)', async () => {
    await taxTypePage.verifyTaxRateLimit(TaxTypeData.invalidTaxRate, TaxTypeData.maxTaxRate);
    await taxTypePage.closeDialog();
});

test('TT_005 Verify Fixed Amount limit', async () => {
    await taxTypePage.verifyFixedAmountLimit(TaxTypeData.invalidFixedAmount, TaxTypeData.maxFixedAmount);
    await taxTypePage.closeDialog();
});

test('TT_006 Verify Tax Type is created with Percentage', async () => {
    await taxTypePage.createTaxType(TaxTypeData.percentageName, TaxTypeData.country, 'Percentage', TaxTypeData.taxRate, TaxTypeData.tenant);
    await taxTypePage.getAndVerifySuccessMessage(SuccessMessages.TAX_TYPE_CREATED);
    await taxTypePage.verifyRecordInTable(TaxTypeData.percentageName);
});

test('TT_007 Verify Tax Type is created with Fixed amount', async () => {
    await taxTypePage.createTaxType(TaxTypeData.fixedName, TaxTypeData.country, 'Fixed', TaxTypeData.fixedAmount, TaxTypeData.tenant);
    await taxTypePage.getAndVerifySuccessMessage(SuccessMessages.TAX_TYPE_CREATED);
    await taxTypePage.verifyRecordInTable(TaxTypeData.fixedName);
});

test('TT_008 Verify created Tax Types can be searched', async () => {
    await taxTypePage.searchRecord(TaxTypeData.percentageName);
    await taxTypePage.verifyRecordInTable(TaxTypeData.percentageName);

    await taxTypePage.searchRecord(TaxTypeData.fixedName);
    await taxTypePage.verifyRecordInTable(TaxTypeData.fixedName);
});

test('TT_009 Verify Tax Type can be deactivated and then activated', async () => {
    await taxTypePage.searchRecord(TaxTypeData.percentageName);
    await taxTypePage.toggleRecord(TaxTypeData.percentageName, false, SuccessMessages.DEACTIVATION_SUCCESS);
    await taxTypePage.toggleRecord(TaxTypeData.percentageName, true, SuccessMessages.ACTIVATION_SUCCESS);
});

test('TT_010 Verify pagination (next and previous page)', async () => {
    await taxTypePage.clearSearch();
    await taxTypePage.verifyPagination();
});