export const BillCycleData = {
    type: 'Advance',
    billDay: '15',
    paymentDueOffset: '10',
    frequency: 'Monthly',
    tenant: 'Skyvora Telecom',
    existingName: 'Retest Bill Cycle',
};

export const BillStateReasonData = {
    tenant: 'Skyvora Telecom',
    reason: `Auto reason ${Date.now()}`   // unique data
};

const letters = 'abcdefghijklmnopqrstuvwxyz';
const randomLetters = (n: number) =>
    Array.from({ length: n }, () => letters[Math.floor(Math.random() * letters.length)]).join('');

export const PaymentModeData = {
    tenant: 'Skyvora Telecom',
    name: `Pay ${randomLetters(2)}`,     // e.g. Pay qw     
    invalidNames: ['123', '#@$@#$']
};

export const PaymentTermData = {
    tenant: 'Skyvora Telecom',
    baseDate: 'BILL_DATE',
    offsetName: `Offset ${randomLetters(3)}`,   // new on every run
    fixedName: `Fixed ${randomLetters(3)}`,
    offsetDays: '30',
    dayOfMonth: '15',
    invalidOffsetDays: '9999',   // limit is 999
    invalidDayOfMonth: '32',     // limit is 31
    maxOffsetDays: 999,
    maxDayOfMonth: 31,
    invalidNames: ['123', '#@$@#$']
};


export const TaxTypeData = {
   tenant: 'Infratelix',
    country: 'India',
     percentageName: `Tax ${randomLetters(3)}`,   // new on every run
    fixedName: `Fixed ${randomLetters(3)}`,
    taxRate: '50',
    fixedAmount: '500',
    invalidTaxRate: '1000',            // limit is 100
    maxTaxRate: 100,
    invalidFixedAmount: '99999999.999',
      maxFixedAmount: 99999999.99,
    invalidNames: ['123'],             // must start with a letter
    shortName: 'ab'                    // below 3 characters
};

export const AdjustmentReasonData = {
    tenant: 'Skyvora Telecom',
    name: `Adj ${randomLetters(3)}`,      // new on every run
    invalidNames: ['123', '#@$@#$']
};

export const DepositTypeData = {
    tenant: 'Skyvora Telecom',
    name: `Dep ${randomLetters(3)}`,
    invalidNames: ['123', '#@$@#$']
};

export const RefundReasonData = {
    tenant: 'Skyvora Telecom',
    name: `Ref ${randomLetters(3)}`,
    invalidNames: ['123', '#@$@#$']
};

export const LateFeePolicyData = {
    tenant: 'Skyvora Telecom',
    name: `Latefee ${randomLetters(3)}`,      // new on every run
    description: 'description',
    graceDays: '10',
    percentage: '10',
    invalidNames: ['123', '#@$@#$'],
    graceDaysLimit: { typed: '999', max: 30 },     // confirm the real max
    percentageLimit: { typed: '1000', max: 100 },
    rules: [
        { lowerLimit: '1', upperLimit: '50', feeType: 'FLAT', feeValue: '100', calculationBase: 'OUTSTANDING_AMOUNT', maxFee: '500' },
        { upperLimit: '100', feeType: 'FLAT', feeValue: '100', calculationBase: 'OUTSTANDING_AMOUNT', maxFee: '500' }   // lower limit is auto-calculated
    ],
    invalidFlatRule: { lowerLimit: '1', upperLimit: '10', feeType: 'FLAT', feeValue: '1000', calculationBase: 'CURRENT_BALANCE', maxFee: '100' },
    validMaxFee: '1000'
};

export const BackoutReasonData = {
    tenant: 'Skyvora Telecom',
    name: `Backout ${randomLetters(3)}`,      // new on every run
    invalidNames: ['123', '#@$@#$']
};

export const UserManagementData = {
    tenant: 'Skyvora Telecom',
    name: `User ${randomLetters(4)}`,              // new on every run
    updatedName: `Updated ${randomLetters(4)}`,
    email: `auto${randomLetters(6)}@yopmail.com`,
    password: 'Test@123',
    invalidNames: ['Te', '123'],
    
        locationUser: {
        tenant: 'Infratelix',
        name: `Loc ${randomLetters(4)}`,
        email: `loc${randomLetters(6)}@yopmail.com`,
        password: 'Test@123'
    },
};