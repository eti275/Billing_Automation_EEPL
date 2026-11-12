import { expect, Locator, Page } from '@playwright/test';
import { BasePage } from './BasePage';
import { ValidationMessages } from '../tests/constants';   

export class LoginPage extends BasePage {

    readonly emailInput: Locator;
    readonly passwordInput: Locator;
    readonly signInButton: Locator;
    readonly forgotPasswordLink: Locator;
    readonly invalidEmailMessage: Locator

    constructor(page: Page) {

        super(page);

        this.emailInput = page.locator('[type=email]');
        this.passwordInput = page.locator('[type=password]');
        this.signInButton = page.getByRole('button', {name: 'Sign In'});
        this.forgotPasswordLink = page.locator("//a[starts-with(text(),'Forgot Password?')]");
        this.invalidEmailMessage = page.getByText(ValidationMessages.INVALID_EMAIL);
    }


    async goToLogin() {
        await this.page.goto('/login');
    }

    async enterEmail(email: string) {
        await this.emailInput.fill(email);
    }

    async enterPassword(password: string) {
        await this.passwordInput.fill(password);
    }

    async clickSignIn() {
        await this.signInButton.click();
    }

    async login(email: string, password: string) {

        await this.enterEmail(email);
        await this.enterPassword(password);
        await this.clickSignIn();
    }
    async verifyEmailRequiredandPassworMessage() {

        
    await this.emailInput.click();
    await this.emailInput.press('Tab');
    await expect(this.page.getByText(ValidationMessages.EMAIL_REQUIRED)).toBeVisible();
    await this.page.waitForTimeout(2000)

    await this.passwordInput.click();
    await this.passwordInput.press('Tab');
    await expect(this.page.getByText(ValidationMessages.PASSWORD_REQUIRED)).toBeVisible();
    await this.page.waitForTimeout(2000)

    

}
async loginAndWait(email: string, password: string) {
    await this.goToLogin();
    await this.login(email, password);
    await this.page.waitForURL(url => !url.pathname.includes('login'), { timeout: 15000 });
}
}