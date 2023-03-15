import { IsNumberString, Length } from 'class-validator';
import { UserName } from '../common/validate/username.validate';

export class CreateDeveloperDto {
    @UserName('name', { message: '用户名只能包含字母和数字并以字母开头' })
    name: string;

    @Length(8, 16, { message: '密码长度必须在8-16位之间' })
    password: string;

    @IsNumberString(undefined, { message: '手机号必须为数字' })
    @Length(11, 11, { message: '手机号必须为11位' })
    mobile: string;
}

export class LoginDeveloperDto {
    @Length(6, 16, { message: '用户名长度必须在6-16位之间' })
    name: string;

    @Length(8, 16, { message: '密码长度必须在8-16位之间' })
    password: string;
}
