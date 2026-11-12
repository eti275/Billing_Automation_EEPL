import { Page } from '@playwright/test';
import { NameTenantLocationPage } from './NameTenantLocationPage';
import { ValidationMessages } from '../tests/constants';

export class DepositTypePage extends NameTenantLocationPage {
    constructor(page: Page) {
        super(page, {
            createButtonName: 'Create Deposit Type',
            nameInputName: 'Enter Deposit Type',
            nameLabel: 'Deposit Type',
            formatMessage: ValidationMessages.ROLE_NAME_FORMAT
        });
    }
}