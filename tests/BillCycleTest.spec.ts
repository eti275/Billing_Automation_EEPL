import { test, Page } from '@playwright/test';
import { LoginPage } from '../pages/LoginPage';
import { BillCyclePage } from '../pages/BillCyclePage';
import { LoginData } from '../tests/loginTestData';
import { BillCycleData } from '../tests/billcycleTestData';
import { SuccessMessages } from '../tests/constants';
import { DataGenerator } from '../testData/utils/dataGenerator';

test.describe.configure({ mode: 'serial' }); // one shared page, tests run in order

let page: Page;
let billCyclePage: BillCyclePage;

test.beforeAll(async ({ browser }) => {
    // Saved login session use hoga, dobara login nahi hoga
    page = await browser.newPage({ storageState: 'playwright/.auth/admin.json' });
    billCyclePage = new BillCyclePage(page);

    await page.goto('http://10.254.240.102:4880/Configuration/Billing/Bill-Cycle');
});


test('BILLCYCLE_001 to Verify Create Bill Cycle with valid data', async () => {
    const name = DataGenerator.getUniqueUserName('AutoCycle ');
    const { from, to, monthName } = DataGenerator.getNextMonthRange();

    await billCyclePage.createBillCycle(
        name,
        BillCycleData.type,
        BillCycleData.billDay,
        BillCycleData.paymentDueOffset,
        BillCycleData.frequency,
        monthName,            // Financial Month = next month
        BillCycleData.tenant,
        from,                 // 1st of next month
        to                    // last day of next month
    );

    const successText = await billCyclePage.getAndVerifySuccessMessage(SuccessMessages.BILL_CYCLE_CREATED);
    console.log(`Bill Cycle created: ${name} (${from.toDateString()} to ${to.toDateString()})`);
    console.log('Success message displayed:', successText);

    await billCyclePage.verifyBillCycleInGrid(name);
});

test('BILLCYCLE_002 to Verify search by Bill Cycle Name matches the grid result', async () => {
    await billCyclePage.searchBillCycle(BillCycleData.existingName);
    await billCyclePage.verifyAllRowsMatchSearch(BillCycleData.existingName);
    console.log('Search result matches:', BillCycleData.existingName);
});


test('BILLCYCLE_003 to Verify Bill Cycle can be deactivated and then activated', async () => {
    await billCyclePage.searchBillCycle(BillCycleData.existingName);
    
    // Deactivate
    await billCyclePage.toggleRecord(BillCycleData.existingName, false, SuccessMessages.BILL_CYCLE_DEACTIVATED);
    await billCyclePage.verifyBillCycleStatus(BillCycleData.existingName, 'Inactive');

    // Activate the same record
    await billCyclePage.toggleRecord(BillCycleData.existingName, true, SuccessMessages.BILL_CYCLE_ACTIVATED);
    await billCyclePage.verifyBillCycleStatus(BillCycleData.existingName, 'Active');
});


test.afterAll(async () => {
    await page.close();
});