import { RandomUtils } from './random.utils';

export class StringUtils {
    // 判断首个字符是否是字母
    public static charIsLetter(char: string): boolean {
        const code = char.charCodeAt(0);
        return (code >= 65 && code <= 90) || (code >= 97 && code <= 122);
    }

    // 判断是否全部是字母数字
    public static isAlphaNumeric(str: string): boolean {
        const alphaNumericRegex = /^[a-zA-Z0-9]+$/;
        return alphaNumericRegex.test(str);
    }

    // 判断首个字符是否是数字
    public static charIsNumber(char: string) {
        const firstChar = parseInt(char.charAt(0), 10);
        if (!isNaN(firstChar)) {
            return true;
        } else {
            return false;
        }
    }

    public static isEmpty(str: string): boolean {
        return str === null || str === undefined || str === '';
    }

    public static isNotEmpty(str: string): boolean {
        return !this.isEmpty(str);
    }

    public static toString(str: any): string {
        return str === null || str === undefined ? '' : str.toString();
    }

    public static buildFormatString(str: string) {
        let fstr = str;
        let replaceCount = 0;
        let replaceLength = 0;
        let haveError = false;
        while (true) {
            let replace = false;
            if (fstr.includes('${uuid}')) {
                fstr = fstr.replace('${uuid}', RandomUtils.getUUID());
                replace = true;
                replaceLength += 36;
                replaceCount++;
            }
            if (fstr.includes('${randhex}[')) {
                const startPos = fstr.indexOf('${randhex}[') + 11;
                const endPos = fstr.indexOf(']', startPos);
                const length = parseInt(fstr.substring(startPos, endPos));
                if (!length) {
                    fstr = fstr.replace(fstr.substring(startPos - 11, endPos + 1), '');
                    haveError = true;
                } else {
                    fstr = fstr.replace(fstr.substring(startPos - 11, endPos + 1), RandomUtils.getHexString(length));
                    replace = true;
                    replaceLength += length;
                }
                replaceCount++;
            }
            if (fstr.includes('${randnum}[')) {
                const startPos = fstr.indexOf('${randnum}[') + 11;
                const endPos = fstr.indexOf(']', startPos);
                const length = parseInt(fstr.substring(startPos, endPos));
                if (!length) {
                    fstr = fstr.replace(fstr.substring(startPos - 11, endPos + 1), '');
                    haveError = true;
                } else {
                    fstr = fstr.replace(fstr.substring(startPos - 11, endPos + 1), RandomUtils.getNumberString(length));
                    replaceLength += length;
                    replaceCount++;
                }
                replace = true;
            }
            if (fstr.includes('${randletter}[')) {
                const startPos = fstr.indexOf('${randletter}[') + 14;
                const endPos = fstr.indexOf(']', startPos);
                const length = parseInt(fstr.substring(startPos, endPos));
                if (!length) {
                    fstr = fstr.replace(fstr.substring(startPos - 14, endPos + 1), '');
                    haveError = true;
                } else {
                    fstr = fstr.replace(fstr.substring(startPos - 14, endPos + 1), RandomUtils.getLetterUppercase(length).toLowerCase());
                    replaceLength += length;
                    replaceCount++;
                }
                replace = true;
                replaceLength += length;
                replaceCount++;
            }
            if (!replace) {
                break;
            }
        }
        return {
            str: fstr,
            replaceCount,
            replaceLength,
            haveError,
        };
    }
}
