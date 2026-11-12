export class DataGenerator {

    static getUniqueEmail(prefix: string = 'AutoUser'): string {
        const timestamp = Date.now();
        return `${prefix}${timestamp}@yopmail.com`;
    }

    static getUniqueUserName(prefix: string = 'AutoUser'): string {
        const randomLetters = this.generateRandomLetters(4);
        return `${prefix}${randomLetters}`;
    }

    private static generateRandomLetters(length: number): string {
        const letters = 'abcdefghijklmnopqrstuvwxyz';
        let result = '';
        for (let i = 0; i < length; i++) {
            result += letters.charAt(Math.floor(Math.random() * letters.length));
        }
        return result;
    }

    static getNextMonthRange(): { from: Date; to: Date; monthName: string } {
    const now = new Date();
    const from = new Date(now.getFullYear(), now.getMonth() + 1, 1);   // 1st of next month
    const to = new Date(now.getFullYear(), now.getMonth() + 2, 0);     // last day of next month
    const monthName = from.toLocaleString('en-US', { month: 'long' });
    return { from, to, monthName };
}
}