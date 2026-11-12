import { Page } from '@playwright/test';
import { NameTenantLocationPage } from './NameTenantLocationPage';
import { ValidationMessages } from '../tests/constants';

export class BackoutReasonPage extends NameTenantLocationPage {
    constructor(page: Page) {
        super(page, {
            createButtonName: 'Create Backout Reason',
            nameInputName: 'Enter Backout Reason',
            nameLabel: 'Backout Reason',
            formatMessage: ValidationMessages.REASON_FORMAT
        });
    }
}