import { v4 as uuidv4 } from 'uuid';
import randomString from 'string-random';

export class RandomUtils {
    /**
     * @description: 获取随机hex字符串
     * @param {number} length
     * @return {*}
     */
    public static getHexString(length: number): string {
        return randomString(length, '0123456789abcdef');
    }

    /**
     * @description: 获取随机number
     * @param {number} min
     * @param {number} max
     * @return {*}
     */
    public static getNumber(min: number, max: number): number {
        return Math.floor(Math.random() * (max - min + 1) + min);
    }

    /**
     * @description: 获取随机字符串
     * @param {number} length
     * @return {*}
     */
    public static getString(length: number): string {
        return randomString(length);
    }

    /**
     * @description: 获取随机uuid
     * @param {*}
     * @return {*}
     */
    public static getUUID(): string {
        return uuidv4();
    }

    /**
     * @description: 获取数字字符串
     * @param {number} length
     * @return {*}
     */
    public static getNumberString(length: number): string {
        return randomString(length, '0123456789');
    }

    /**
     * @description: 获取大写的随机字母
     * @param {number} length
     * @return {*}
     */
    public static getLetterUppercase(length: number): string {
        return randomString(length, 'abcdefghijklmnopqrstuvwxyz').toUpperCase();
    }

    /**
     * @description: 获取随机mac地址
     * @param {*}
     * @return {*}
     */
    public static getMacAddr(): string {
        return `${this.getHexString(2)}:${this.getHexString(2)}:${this.getHexString(2)}:${this.getHexString(2)}:${this.getHexString(
            2,
        )}:${this.getHexString(2)}`.toLowerCase();
    }

    /**
     * @description: 获取随机字母数字
     * @param {number} length
     * @return {*}
     */
    public static getLetterNumber(length: number): string {
        return randomString(length, 'abcdefghijklmnopqrstuvwxyz' + 'abcdefghijklmnopqrstuvwxyz'.toUpperCase() + '0123456789');
    }
}
