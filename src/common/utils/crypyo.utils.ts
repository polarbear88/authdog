import crypto from 'crypto';
import { RandomUtils } from './random.utils';
import { ECDHUtils } from './ecdh.utils';
import { BadRequestException, InternalServerErrorException, Logger } from '@nestjs/common';
import { RSAUtils } from './rsa.utils';
import { Application } from 'src/provide/application/application.entity';
import { CloudfunRuner } from 'src/provide/cloudfun/cloudfun-runer';
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

    public static decryptECDHJSON(data: any, clientPublicKey: string, privateKey: string) {
        try {
            const ecdh = new ECDHUtils();
            ecdh.setPrivateKey(Buffer.from(privateKey, 'hex'));
            const sharedSecret = ecdh.getSharedSecret(Buffer.from(clientPublicKey, 'hex'));
            const sha1 = CryptoUtils.sha1(sharedSecret);
            const aesKey = sha1.slice(0, 32);
            return {
                data: this.decryptAESJSON(data, aesKey),
                aesKey,
            };
        } catch (error) {
            throw new BadRequestException('错误的请求');
        }
    }

    public static decryptRSAJSON(data: string, aesKeyData: string, privateKey: string) {
        try {
            const rsa = new RSAUtils();
            rsa.setPrivateKey(privateKey);
            const aeskey = rsa.decrypt(Buffer.from(aesKeyData, 'base64')).toString();
            if (!aeskey || aeskey.length !== 32) {
                throw new BadRequestException('错误的请求');
            }
            return {
                data: this.decryptAESJSON(data, aeskey),
                aesKey: aeskey,
            };
        } catch (error) {
            throw new BadRequestException('错误的请求');
        }
    }

    public static decryptAESJSON(data: string, key: string) {
        try {
            const decryptData = CryptoUtils.aesCBCDecrypt(Buffer.from(data, 'base64'), key, 'aes-256-cbc', '0000000000000000', true);
            if (!decryptData) {
                throw new BadRequestException('错误的请求');
            }
            return JSON.parse(decryptData.toString());
        } catch (error) {
            throw new BadRequestException('错误的请求');
        }
    }

    private static g_sam_key = Buffer.from('D2 78 F2 15 F2 25 F2 12 F2 15 F2 34 F2 15 F2 15'.replace(/ /g, ''), 'hex');
    private static g_sam_iv = Buffer.from('3D 45 32 67 F2 15 F2 12 A2 15 32 15 C2 15 66 88'.replace(/ /g, ''), 'hex');

    public static samenc(data: Buffer) {
        if (data == null || data.length == 0) {
            return null;
        }
        for (let i = 0; i < data.length; i++) {
            data[i] ^= 33;
            data[i] ^= 17;
            data[i] ^= 49;
            if (i % 2 == 0) {
                data[i] ^= 79;
                data[i] ^= this.g_sam_iv[i % 16];
            }
            if (i % 3 == 0) {
                data[i] ^= 11;
                data[i] ^= this.g_sam_iv[i % 16];
            }
            for (let j = 0; j < 16; j++) {
                data[i] ^= this.g_sam_key[j];
            }
        }
        return data;
    }

    public static samdec(data: Buffer) {
        if (data == null || data.length == 0) {
            return null;
        }
        for (let i = 0; i < data.length; i++) {
            data[i] ^= 33;
            data[i] ^= 17;
            data[i] ^= 49;
            if (i % 2 == 0) {
                data[i] ^= 79;
                data[i] ^= this.g_sam_iv[i % 16];
            }
            if (i % 3 == 0) {
                data[i] ^= 11;
                data[i] ^= this.g_sam_iv[i % 16];
            }
            for (let j = 0; j < 16; j++) {
                data[i] ^= this.g_sam_key[j];
            }
        }
        return data;
    }

    public static hmacsha256(key: string, data: string | Buffer) {
        const hmac = crypto.createHmac('sha256', key);
        hmac.update(data);
        const hash = hmac.digest('hex');
        return hash;
    }

    public static async encryptRespone(data: any, request: any): Promise<string> {
        let result = this._encryptRespone(data, request);
        if (request.cryptcf) {
            if (typeof result !== 'string') {
                result = JSON.stringify(result);
            }
            try {
                // eslint-disable-next-line @typescript-eslint/no-empty-function
                result = await CloudfunRuner.run(request.cryptcf, ['en', result], {}, (balance: number, reason: string) => {});
            } catch (error) {
                Logger.error(error.message);
                throw new BadRequestException('云函数执行错误');
            }
        }
        return result;
    }

    private static _encryptRespone(data: any, request: any): string {
        if (data === null || data === undefined) {
            return data;
        }
        if (typeof data === 'object') {
            data.currentDeviceId = request.currentDeviceId;
        }
        const app = request.application as Application;
        if (!app) {
            throw new InternalServerErrorException('服务器错误');
        }
        if (app.cryptoMode === 'none') {
            return data;
        }
        data = typeof data === 'object' ? JSON.stringify(data) : data + '';
        if (app.cryptoMode === 'samenc') {
            return CryptoUtils.samenc(Buffer.from(data)).toString('base64');
        }
        const key = request.aesKey;
        if (!key) {
            throw new InternalServerErrorException('服务器错误');
        }
        return this.encryptAES(data, key);
    }

    private static encryptAES(data: any, key: string) {
        try {
            const encryptData = CryptoUtils.aesCBCEncrypt(Buffer.from(data), key, 'aes-256-cbc', '0000000000000000', true);
            if (!encryptData) {
                throw new InternalServerErrorException('服务器错误');
            }
            return encryptData.toString('base64');
        } catch (error) {
            throw new InternalServerErrorException('服务器错误');
        }
    }

    private static sha1(data: string | Buffer) {
        return crypto.createHash('sha1').update(data).digest('hex');
    }
}
