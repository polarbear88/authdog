export class NumberUtils {
    public static toFixedTwo(num: number): number {
        return Math.floor(num * 100) / 100;
    }
}
