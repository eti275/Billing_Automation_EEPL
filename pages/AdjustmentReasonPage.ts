import { Page } from '@playwright/test';
import { NameTenantLocationPage } from './NameTenantLocationPage';
import { ValidationMessages } from '../tests/constants';

export class AdjustmentReasonPage extends NameTenantLocationPage {
    constructor(page: Page) {
        super(page, {
            createButtonName: 'Create Adjustment Reason',
            nameInputName: 'Enter Adjustment Reason',
            nameLabel: 'Adjustment Reason',
            formatMessage: ValidationMessages.REASON_FORMAT
        });
    }
}