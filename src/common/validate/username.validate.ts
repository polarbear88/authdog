import { registerDecorator, ValidationArguments, ValidationOptions } from 'class-validator';
import { StringUtils } from '../utils/string.utils';

export function UserName(property: string, validationOptions?: ValidationOptions) {
    return function (object: any, propertyName: string) {
        registerDecorator({
            name: 'UserName',
            target: object.constructor,
            propertyName: propertyName,
            constraints: [property],
            options: validationOptions,
            validator: {
                validate(value: any, args: ValidationArguments) {
                    return (
                        value &&
                        typeof value === 'string' &&
                        value.length >= 6 &&
                        value.length <= 16 &&
                        StringUtils.charIsLetter(value) &&
                        StringUtils.isAlphaNumeric(value)
                    );
                },
            },
        });
    };
}
