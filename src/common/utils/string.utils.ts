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

    public static toString(str: any): string {
        return str === null || str === undefined ? '' : str.toString();
    }
}
