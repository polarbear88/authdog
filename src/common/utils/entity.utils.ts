export class EntityUtils {
    public static serializationEntityArr(entityArr: any[], isThis = true) {
        const result = [];
        for (const entity of entityArr) {
            if (isThis) {
                result.push(entity._serializationThis());
            } else {
                result.push(entity._serialization());
            }
        }
        return result;
    }
}
