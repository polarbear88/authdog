import { IsNotEmpty, IsNumber, IsString, Length } from 'class-validator';
import { UserName } from 'src/common/validate/username.validate';
import { BaseUserDeviceDto } from 'src/user-device/user-device.dto';

export class CreateUserDto extends BaseUserDeviceDto {
    @IsNotEmpty({ message: 'appid不能为空' })
    @IsNumber()
    appid: number;

    @UserName('name', { message: '用户名只能包含字母和数字并以字母开头' })
    name: string;

    mobile?: string;

    otherInfo?: string;

    @IsString()
    @IsNotEmpty({ message: '密码不能为空' })
    @Length(8, 16, { message: '密码长度必须在8-16位之间' })
    password: string;
}

export class LoginUserDto extends BaseUserDeviceDto {
    @IsNotEmpty({ message: 'appid不能为空' })
    @IsNumber()
    appid: number;

    @UserName('name', { message: '账号或密码错误' })
    name: string;

    @IsString()
    @IsNotEmpty({ message: '密码不能为空' })
    password: string;
}
