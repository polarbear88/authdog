export class EntityUtils {
    public static serializationEntityArr(entityArr: any[], isThis = true, unShieldNames: Array<string> = []) {
        const result = [];
        for (const entity of entityArr) {
            if (isThis) {
                result.push(entity._serializationThis(unShieldNames));
            } else {
                result.push(entity._serialization(unShieldNames));
            }
        }
        return result;
    }
}
