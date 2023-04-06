import { registerDecorator, ValidationOptions, ValidatorConstraint, ValidatorConstraintInterface } from 'class-validator';

@ValidatorConstraint({ async: false })
export class IsChinaPhoneNumberConstraint implements ValidatorConstraintInterface {
    validate(phoneNumber: string) {
        // 中国手机号正则表达式
        const regex = /^1[3456789]\d{9}$/;
        return regex.test(phoneNumber);
    }

    defaultMessage() {
        return '无效的手机号';
    }
}

export function IsChinaPhoneNumber(validationOptions?: ValidationOptions) {
    return function (object: any, propertyName: string) {
        registerDecorator({
            target: object.constructor,
            propertyName: propertyName,
            options: validationOptions,
            constraints: [],
            validator: IsChinaPhoneNumberConstraint,
        });
    };
}
