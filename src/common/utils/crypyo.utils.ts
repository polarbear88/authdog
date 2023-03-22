import crypto from 'crypto';
import { RandomUtils } from './random.utils';
const _md5 = require('md5-node');

export class CryptoUtils {
    /**
     * aes cbc 加密
     * @param data 加密数据
     * @param key 密码
     * @param algorithm 模式
     * @param iv iv
     * @param autoPadding 自动填充
     * @returns 结果
     */
    public static aesCBCEncrypt(
        data: Buffer,
        key: string | Buffer,
        algorithm: 'aes-128-cbc' | 'aes-256-cbc',
        iv: string | Buffer = '0000000000000000',
        autoPadding = false,
    ): Buffer {
        const secretKey = typeof key == 'string' ? Buffer.from(key) : key;
        const cipher = crypto.createCipheriv(algorithm, secretKey, iv);
        cipher.setAutoPadding(autoPadding);
        const encrypted = cipher.update(data);
        return Buffer.concat([encrypted, cipher.final()]);
    }

    /**
     * aes cbc 解密
     * @param data 数据
     * @param key 密码
     * @param algorithm 模式
     * @param iv iv
     * @param autoPadding 填充模式
     * @returns 数据
     */
    public static aesCBCDecrypt(
        data: Buffer,
        key: string | Buffer,
        algorithm: 'aes-128-cbc' | 'aes-256-cbc',
        iv: string | Buffer = '0000000000000000',
        autoPadding = false,
    ): Buffer {
        const secretKey = typeof key == 'string' ? Buffer.from(key) : key;
        const cipher = crypto.createDecipheriv(algorithm, secretKey, iv);
        cipher.setAutoPadding(autoPadding);
        const encrypted = cipher.update(data);
        return Buffer.concat([encrypted, cipher.final()]);
    }

    /**
     * @description: md5加密
     * @param {any} data
     * @return {*}
     */
    public static md5(data: any): string {
        return _md5(data);
    }

    /**
     * 密码加密
     * @param password 密码
     * @param salt 盐
     * @returns 加密密码
     */
    public static encryptPassword(password: string, salt: string): string {
        return this.md5(this.md5(password) + salt);
    }

    /**
     * 验证密码
     * @param password 用户输入的密码md5
     * @param salt 盐
     * @param encryptPassword 数据库中的密码
     * @returns 结果
     */
    public static validatePassword(password: string, salt: string, encryptPassword: string): boolean {
        return this.md5(password + salt) === encryptPassword;
    }

    public static makeSalt(): string {
        return RandomUtils.getHexString(8);
    }
}
