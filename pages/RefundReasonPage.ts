import { Page } from '@playwright/test';
import { NameTenantLocationPage } from './NameTenantLocationPage';
import { ValidationMessages } from '../tests/constants';

export class RefundReasonPage extends NameTenantLocationPage {
    constructor(page: Page) {
        super(page, {
            createButtonName: 'Create Refund Reason',
            nameInputName: 'Enter Refund Reason',
            nameLabel: 'Refund Reason',
            formatMessage: ValidationMessages.REASON_FORMAT
        });
    }
}