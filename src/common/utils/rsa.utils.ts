import crypto from 'crypto';

export class RSAUtils {
    private privateKey: crypto.KeyObject;
    private publicKey: crypto.KeyObject;

    constructor() {
        this.generateKeyPair();
    }

    private generateKeyPair(): void {
        const { publicKey, privateKey } = crypto.generateKeyPairSync('rsa', {
            modulusLength: 2048,
        });

        this.privateKey = privateKey;
        this.publicKey = publicKey;
    }

    public setPublicKey(pemPublicKey: string): void {
        this.publicKey = crypto.createPublicKey(pemPublicKey);
    }

    public setPrivateKey(pemPrivateKey: string): void {
        this.privateKey = crypto.createPrivateKey(pemPrivateKey);
    }

    public getPublicKey(): string {
        return this.publicKey.export({ type: 'spki', format: 'pem' }).toString();
    }

    public getPrivateKey(): string {
        return this.privateKey.export({ type: 'pkcs1', format: 'pem' }).toString();
    }

    public encrypt(data: string | Buffer): Buffer {
        return crypto.publicEncrypt(
            {
                key: this.publicKey,
                padding: crypto.constants.RSA_PKCS1_OAEP_PADDING,
            },
            typeof data === 'string' ? Buffer.from(data) : data,
        );
    }

    public decrypt(encryptedData: Buffer): Buffer {
        return crypto.privateDecrypt(
            {
                key: this.privateKey,
                padding: crypto.constants.RSA_PKCS1_OAEP_PADDING,
            },
            encryptedData,
        );
    }
}
