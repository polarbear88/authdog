// AES加密模式 aes-256-cbc iv 0000000000000000 autoPadding PKCS7
// RSA加密模式 rsa-2048 RSA_PKCS1_OAEP_PADDING
// ECDH加密模式 secp521r1

export type AppCryptoMode = 'none' | 'aes' | 'rsa' | 'ecdh' | 'samenc';

export type AppAuthMode = 'deviceid' | 'user';

export type AppStatus = 'published' | 'disabled';
