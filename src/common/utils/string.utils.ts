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
}
