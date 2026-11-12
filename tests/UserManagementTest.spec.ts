import { test, Page } from '@playwright/test';
import { UserManagementPage } from '../pages/UserManagementPage';
import { UserManagementData } from './billcycleTestData';
import { SuccessMessages } from './constants';

test.describe.configure({ mode: 'serial' });

let page: Page;
let userPage: UserManagementPage;
let updatedLocation: { zone: string; region: string; state: string };

test.beforeAll(async ({ browser, baseURL }) => {
    page = await browser.newPage({ baseURL, storageState: 'playwright/.auth/admin.json' });
    userPage = new UserManagementPage(page);
    await page.goto('/Admin/Users');
});

test.afterAll(async () => {
    await page.close();
});

test('UM_001 Verify required field validations', async () => {
    await userPage.verifyRequiredValidations();
});

test.skip('UM_002 Verify invalid full name validations', async () => {
    await userPage.verifyInvalidNames(UserManagementData.invalidNames);
});

test('UM_003 Verify Reset clears the form', async () => {
    await userPage.verifyReset(UserManagementData);
    await userPage.closeDialog();
});

test('UM_004 Verify User is created successfully', async () => {
    await userPage.createUser(UserManagementData);
    await userPage.getAndVerifySuccessMessage(SuccessMessages.USER_CREATED);
    await userPage.verifyRecordInTable(UserManagementData.name);
});

test('UM_005 Verify created User can be searched', async () => {
    await userPage.searchRecord(UserManagementData.name);
    await userPage.verifyRecordInTable(UserManagementData.name);
});

test('UM_006 Verify View Details shows the Location Details', async () => {
    await userPage.verifyLocationDetails(UserManagementData.name);
});

test('UM_007 Verify User full name can be edited', async () => {
    await userPage.editUserName(UserManagementData.name, UserManagementData.updatedName);
    await userPage.getAndVerifySuccessMessage(SuccessMessages.USER_UPDATED);
    await userPage.searchRecord(UserManagementData.updatedName);
    await userPage.verifyRecordInTable(UserManagementData.updatedName);
});

test('UM_008 Verify User can be deactivated and then activated', async () => {
    await userPage.searchRecord(UserManagementData.updatedName);
    await userPage.setUserStatus(UserManagementData.updatedName, false, SuccessMessages.USER_DEACTIVATED);
    await userPage.setUserStatus(UserManagementData.updatedName, true, SuccessMessages.USER_ACTIVATED);
});

test('UM_009 Verify User is created for a tenant with many zones, regions and states', async () => {
    await userPage.createUser(UserManagementData.locationUser);
    await userPage.getAndVerifySuccessMessage(SuccessMessages.USER_CREATED);
    await userPage.searchRecord(UserManagementData.locationUser.name);
    await userPage.verifyRecordInTable(UserManagementData.locationUser.name);
});

test('UM_010 Verify updated zone, region and state show in View Details', async () => {
    updatedLocation = await userPage.editUserLocation(UserManagementData.locationUser.name);
    await userPage.getAndVerifySuccessMessage(SuccessMessages.USER_UPDATED);
    await userPage.verifyLocationValues(UserManagementData.locationUser.name, updatedLocation);
});

test('UM_011 Verify pagination (next and previous page)', async () => {
    await userPage.clearSearch();
    await userPage.verifyPagination();
});