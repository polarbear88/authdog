import { IsNotEmpty, IsNumberString, IsOptional, IsString, Length, ValidateNested } from 'class-validator';
import { UserName } from '../../common/validate/username.validate';
import { GeetestDto } from 'src/man-machine-inspect/geetest.dto';
import { Type } from 'class-transformer';

export class CreateDeveloperDto {
    @UserName('name', { message: '用户名只能包含字母和数字并以字母开头' })
    username: string;

    @IsNotEmpty({ message: '密码不能为空' })
    @IsString({ message: '密码必须是字符串' })
    @Length(8, 16, { message: '密码长度必须在8-16位之间' })
    password: string;

    @IsNotEmpty({ message: '手机号不能为空' })
    @IsNumberString(undefined, { message: '手机号必须为数字字符串' })
    @Length(11, 11, { message: '手机号必须为11位' })
    mobile: string;

    @IsOptional()
    @ValidateNested()
    @Type(() => GeetestDto)
    geetest_captcha: GeetestDto;
}

export class LoginDeveloperDto {
    @IsNotEmpty({ message: '用户名不能为空' })
    @Length(6, 16, { message: '用户名长度必须在6-16位之间' })
    username: string;

    @IsNotEmpty({ message: '密码不能为空' })
    @IsString({ message: '密码必须是字符串' })
    @Length(32, 32, { message: '密码错误' })
    password: string;

    @IsOptional()
    @ValidateNested()
    @Type(() => GeetestDto)
    geetest_captcha: GeetestDto;
}
