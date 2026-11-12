import { Locator, Page } from '@playwright/test';
import { BasePage } from './BasePage';

export class AdminPage extends BasePage {

    readonly menuToggle: Locator;
    readonly adminLink: Locator;
    readonly userLink: Locator;
    readonly createUsersButton: Locator;
    readonly rolelink: Locator;

    constructor(page: Page) {
        super(page);

        this.menuToggle = page.locator('.burgar-toggle>button');
        this.adminLink = page.getByRole('link', { name: 'Admin' });
        this.userLink = page.getByRole('link', { name: 'User Management' });
        this.rolelink =page.locator("//a[@href='/Admin/Roles']");
        this.createUsersButton = page.getByRole('button', { name: 'Create User  ' });
    }

    async openMenu() {
        await this.menuToggle.click();
    }

    async navigateToUserTab() {
        await this.openMenu();
        await this.adminLink.click();
        await this.userLink.click();
       
    }

    async openCreateUsersPanel() {
        await this.createUsersButton.click();
    }

     async navigateToRoleTab() {
        await this.openMenu();
        await this.adminLink.click();
        await this.rolelink.click();
           }
   

}