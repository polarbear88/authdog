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
}
