import { read, open, close, accessSync, constants, openSync, readSync, statSync, ReadPosition, PathLike } from 'fs';

const VectorIndexSize = 8;
const VectorIndexCols = 256;
const VectorIndexLength = 256 * 256 * (4 + 4);
const SegmentIndexSize = 14;
const IP_REGEX = /^((\d|[1-9]\d|1\d\d|2[0-4]\d|25[0-5])\.){3}(\d|[1-9]\d|1\d\d|2[0-4]\d|25[0-5])$/;

const getStartEndPtr = Symbol('#getStartEndPtr');
const getBuffer = Symbol('#getBuffer');
const openFilePromise = Symbol('#openFilePromise');

class Searcher {
    _dbFile: any;
    _vectorIndex: any;
    _buffer: any;
    constructor(dbFile: any, vectorIndex: Buffer, buffer: Buffer) {
        this._dbFile = dbFile;
        this._vectorIndex = vectorIndex;
        this._buffer = buffer;

        if (this._buffer) {
            this._vectorIndex = this._buffer.subarray(256, 256 + VectorIndexLength);
        }
    }

    async [getStartEndPtr](idx: number, fd: any, ioStatus: any) {
        if (this._vectorIndex) {
            const sPtr = this._vectorIndex.readUInt32LE(idx);
            const ePtr = this._vectorIndex.readUInt32LE(idx + 4);
            return { sPtr, ePtr };
        } else {
            const buf = await this[getBuffer](256 + idx, 8, fd, ioStatus);
            const sPtr = buf.readUInt32LE();
            const ePtr = buf.readUInt32LE(4);
            return { sPtr, ePtr };
        }
    }

    async [getBuffer](offset: ReadPosition, length: number, fd: number, ioStatus: { ioCount: number }) {
        if (this._buffer) {
            return this._buffer.subarray(offset, (offset as any) + length);
        } else {
            const buf = Buffer.alloc(length);
            return new Promise((resolve, reject) => {
                ioStatus.ioCount += 1;
                read(fd, buf, 0, length, offset, (err) => {
                    if (err) {
                        reject(err);
                    } else {
                        resolve(buf);
                    }
                });
            });
        }
    }

    [openFilePromise](fileName: PathLike) {
        return new Promise((resolve, reject) => {
            open(fileName, 'r', (err, fd) => {
                if (err) {
                    reject(err);
                } else {
                    resolve(fd);
                }
            });
        });
    }

    async search(ip: string) {
        const startTime = process.hrtime();
        const ioStatus = {
            ioCount: 0,
        };

        if (!isValidIp(ip)) {
            throw new Error(`IP: ${ip} is invalid`);
        }

        let fd = null;

        if (!this._buffer) {
            fd = await this[openFilePromise](this._dbFile);
        }

        const ps = ip.split('.');
        const i0 = parseInt(ps[0]);
        const i1 = parseInt(ps[1]);
        const i2 = parseInt(ps[2]);
        const i3 = parseInt(ps[3]);

        const ipInt = i0 * 256 * 256 * 256 + i1 * 256 * 256 + i2 * 256 + i3;
        const idx = i0 * VectorIndexCols * VectorIndexSize + i1 * VectorIndexSize;
        const { sPtr, ePtr } = await this[getStartEndPtr](idx, fd, ioStatus);
        let l = 0;
        let h = (ePtr - sPtr) / SegmentIndexSize;
        let result = null;

        while (l <= h) {
            const m = (l + h) >> 1;

            const p = sPtr + m * SegmentIndexSize;

            const buff = await this[getBuffer](p, SegmentIndexSize, fd, ioStatus);

            const sip = buff.readUInt32LE(0);

            if (ipInt < sip) {
                h = m - 1;
            } else {
                const eip = buff.readUInt32LE(4);
                if (ipInt > eip) {
                    l = m + 1;
                } else {
                    const dataLen = buff.readUInt16LE(8);
                    const dataPtr = buff.readUInt32LE(10);
                    const data = await this[getBuffer](dataPtr, dataLen, fd, ioStatus);
                    result = data.toString('utf-8');
                    break;
                }
            }
        }
        if (fd) {
            // eslint-disable-next-line @typescript-eslint/no-empty-function
            close(fd, function () {});
        }

        const diff = process.hrtime(startTime);

        const took = (diff[0] * 1e9 + diff[1]) / 1e3;
        return { region: result, ioCount: ioStatus.ioCount, took };
    }
}

const _checkFile = (dbPath: PathLike) => {
    try {
        accessSync(dbPath, constants.F_OK);
    } catch (err) {
        throw new Error(`${dbPath} ${err ? 'does not exist' : 'exists'}`);
    }

    try {
        accessSync(dbPath, constants.R_OK);
    } catch (err) {
        throw new Error(`${dbPath} ${err ? 'is not readable' : 'is readable'}`);
    }
};

const isValidIp = (ip: string) => {
    return IP_REGEX.test(ip);
};

const newWithFileOnly = (dbPath: any) => {
    _checkFile(dbPath);

    return new Searcher(dbPath, null, null);
};

const newWithVectorIndex = (dbPath: any, vectorIndex: any) => {
    _checkFile(dbPath);

    if (!Buffer.isBuffer(vectorIndex)) {
        throw new Error('vectorIndex is invalid');
    }

    return new Searcher(dbPath, vectorIndex, null);
};

const newWithBuffer = (buffer: any) => {
    if (!Buffer.isBuffer(buffer)) {
        throw new Error('buffer is invalid');
    }

    return new Searcher(null, null, buffer);
};

const loadVectorIndexFromFile = (dbPath: PathLike) => {
    const fd = openSync(dbPath, 'r');
    const buffer = Buffer.alloc(VectorIndexLength);
    readSync(fd, buffer, 0, VectorIndexLength, 256);
    // eslint-disable-next-line @typescript-eslint/no-empty-function
    close(fd, function () {});
    return buffer;
};

const loadContentFromFile = (dbPath: PathLike) => {
    const stats = statSync(dbPath);
    const buffer = Buffer.alloc(stats.size);
    const fd = openSync(dbPath, 'r');
    readSync(fd, buffer, 0, stats.size, 0);
    // eslint-disable-next-line @typescript-eslint/no-empty-function
    close(fd, function () {});
    return buffer;
};

export default {
    isValidIp,
    loadVectorIndexFromFile,
    loadContentFromFile,
    newWithFileOnly,
    newWithVectorIndex,
    newWithBuffer,
};
