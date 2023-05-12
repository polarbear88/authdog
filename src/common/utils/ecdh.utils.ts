import crypto from 'crypto';
export class ECDHUtils {
    private privateKey: Buffer;
    private publicKey: Buffer;
    private ecdh = crypto.createECDH('secp521r1');

    public generateKeys() {
        this.ecdh.generateKeys();
        this.privateKey = this.ecdh.getPrivateKey();
        this.publicKey = this.ecdh.getPublicKey();
    }

    getPrivateKey(): Buffer {
        return this.privateKey;
    }

    getPublicKey(): Buffer {
        return this.publicKey;
    }

    getSharedSecret(publicKey: Buffer): Buffer {
        return this.ecdh.computeSecret(publicKey);
    }

    setPrivateKey(privateKey: Buffer): void {
        this.ecdh.setPrivateKey(privateKey);
        this.privateKey = this.ecdh.getPrivateKey();
        this.publicKey = this.ecdh.getPublicKey();
    }
}
