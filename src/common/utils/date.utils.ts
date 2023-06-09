import moment from 'moment';

export class DateUtils {
    public static compareYMD(date1: Date, date2: Date): boolean {
        const year1 = date1.getFullYear();
        const year2 = date2.getFullYear();

        const month1 = date1.getMonth();
        const month2 = date2.getMonth();

        const day1 = date1.getDate();
        const day2 = date2.getDate();

        return year1 === year2 && month1 === month2 && day1 === day2;
    }

    public static convertDatesToTimestamps(obj: any): any {
        if (obj === null || typeof obj !== 'object') {
            return obj;
        }

        if (Array.isArray(obj)) {
            return obj.map((item) => this.convertDatesToTimestamps(item));
        }

        if (obj instanceof Date) {
            return obj.getTime();
        }

        const result: any = {};
        for (const key in obj) {
            if (Object.prototype.hasOwnProperty.call(obj, key)) {
                result[key] = this.convertDatesToTimestamps(obj[key]);
            }
        }

        return result;
    }

    /**
     * 格式化日期时间
     * @param format
     * @param date
     * @returns
     */
    public static formatDateTime(date?: Date | number | string, format = 'yyyy-MM-DD HH:mm:ss') {
        if (!date) {
            date = new Date();
        }
        if (typeof date == 'number' || typeof date == 'string') {
            date = new Date(date);
        }
        return moment(date).format(format);
    }

    public static getYesterday() {
        const now = new Date();
        const yesterday = new Date(now.getTime() - 24 * 60 * 60 * 1000);
        yesterday.setHours(0, 0, 0, 0);
        return yesterday;
    }
}
