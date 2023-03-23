import { IsNotEmpty, IsNumber, IsString, Length } from 'class-validator';
import { GetPageDto } from 'src/common/dto/get-page.dto';
import { PaginationWhere } from 'src/common/pagination/pagination.decorator';
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

export class ChangePasswordDto {
    @IsNotEmpty({ message: 'appid不能为空' })
    @IsNumber()
    appid: number;

    @UserName('name', { message: '用户名只能包含字母和数字并以字母开头' })
    name: string;

    @IsString()
    @IsNotEmpty({ message: '旧密码不能为空' })
    oldPassword: string;

    @IsString()
    @IsNotEmpty({ message: '新密码不能为空' })
    @Length(8, 16, { message: '新密码长度必须在8-16位之间' })
    newPassword: string;
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

export class GetUserListDto extends GetPageDto {
    @PaginationWhere('name like %:name%')
    name?: string;

    @PaginationWhere('mobile like %:mobile%')
    mobile?: string;

    @PaginationWhere('status = status')
    status?: string;

    @PaginationWhere('otherInfo like %:otherInfo%')
    otherInfo?: string;

    @PaginationWhere('balance >= :balanceGreaterOrEq')
    balanceThanOrEq?: number;

    @PaginationWhere('balance <= :balanceLessOrEq')
    balanceLessOrEq?: number;

    @PaginationWhere('trialExpiration < NOW()')
    isTrial?: boolean;

    @PaginationWhere('expirationTime >= :expirationTimeStart')
    expirationTimeStart?: Date;

    @PaginationWhere('expirationTime <= :expirationTimeEnd')
    expirationTimeEnd?: Date;
}
