import { expect, test } from '@playwright/test';
import { LoginPage } from '../pages/LoginPage';
import { DashboardPage } from '../pages/DashboardPage';
import { LoginData } from '../tests/loginTestData';
import { ValidationMessages, SuccessMessages } from '../tests/constants';

// Login tests ko logged-out state chahiye
test.use({ storageState: { cookies: [], origins: [] } });

let loginPage: LoginPage;
let dashboardPage: DashboardPage;

test.beforeEach(async ({ page }) => {
    loginPage = new LoginPage(page);
    dashboardPage = new DashboardPage(page);
    await loginPage.goToLogin();
});

test('LOGIN_001 to Verify Login Page Loads and elements displayed', async () => {
    await expect(loginPage.emailInput).toBeVisible();
    await expect(loginPage.passwordInput).toBeVisible();
    await expect(loginPage.signInButton).toBeDisabled();
    await expect(loginPage.forgotPasswordLink).toBeVisible();
});

test('LOGIN_005 to 007 Verify Email and Password Required Field Validations', async () => {
    await loginPage.verifyEmailRequiredandPassworMessage();
});

test('LOGIN_008 to LOGIN_012 Email Validation', async () => {
    const invalidEmails = [
        LoginData.invalidEmail1,
        LoginData.invalidEmail2,
        LoginData.invalidEmail3,
    ];

    // LOGIN_008, LOGIN_009, LOGIN_010
    for (const email of invalidEmails) {
        await loginPage.emailInput.clear();
        await loginPage.emailInput.fill(email);
        await loginPage.emailInput.press('Tab');
        const actualText = await loginPage.invalidEmailMessage.innerText();
        expect(actualText.trim()).toBe(ValidationMessages.INVALID_EMAIL);
        await expect(loginPage.signInButton).toBeDisabled();
    }

    // LOGIN_011
    await loginPage.emailInput.clear();
    await loginPage.emailInput.fill(LoginData.invalidEmail1);
    await loginPage.passwordInput.fill(LoginData.validPassword);
    await loginPage.emailInput.press('Tab');
    const actualText = await loginPage.invalidEmailMessage.innerText();
    expect(actualText.trim()).toBe(ValidationMessages.INVALID_EMAIL);
    await expect(loginPage.signInButton).toBeDisabled();

    // LOGIN_013 Valid email address
    await loginPage.emailInput.clear();
    await loginPage.emailInput.fill(LoginData.validEmail);
    await loginPage.emailInput.press('Tab');
    await expect(loginPage.invalidEmailMessage).toBeHidden();
    await loginPage.passwordInput.fill(LoginData.validPassword);
    await loginPage.clickSignIn();
});

test('Verify Login Successfully with valid data and redirect to Dashboard', async () => {
    await loginPage.login(LoginData.validEmail, LoginData.validPassword);
    const successText = await loginPage.getAndVerifySuccessMessage(SuccessMessages.LOGIN_SUCCESS);
    console.log('Success message displayed:', successText);
    await dashboardPage.verifyOnDashboardPage();
});