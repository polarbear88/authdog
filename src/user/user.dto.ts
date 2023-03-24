import { IsBoolean, IsNotEmpty, IsNumber, IsOptional, IsString, Length } from 'class-validator';
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

    @IsOptional()
    @IsString({ message: '手机号必须是字符串' })
    mobile?: string;

    @IsOptional()
    @IsString({ message: '其他信息必须是字符串' })
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
    @IsOptional()
    @IsString()
    @PaginationWhere('name like %:name%')
    name?: string;

    @IsOptional()
    @IsString()
    @PaginationWhere('mobile like %:mobile%')
    mobile?: string;

    @IsOptional()
    @IsString()
    @PaginationWhere('status = :status')
    status?: string;

    @IsOptional()
    @IsString()
    @PaginationWhere('otherInfo like %:otherInfo%')
    otherInfo?: string;

    @IsOptional()
    @IsNumber()
    @PaginationWhere('balance >= :balanceThanOrEq')
    balanceThanOrEq?: number;

    @IsOptional()
    @IsNumber()
    @PaginationWhere('balance <= :balanceLessOrEq')
    balanceLessOrEq?: number;

    @IsOptional()
    @IsBoolean()
    @PaginationWhere('trialExpiration < NOW()')
    isNotTrial?: boolean;

    @IsOptional()
    @IsBoolean()
    @PaginationWhere('trialExpiration >= NOW()')
    isTrial?: boolean;

    @IsOptional()
    @IsString()
    @PaginationWhere('expirationTime >= :expirationTimeStart')
    expirationTimeStart?: string;

    @IsOptional()
    @IsString()
    @PaginationWhere('expirationTime <= :expirationTimeEnd')
    expirationTimeEnd?: string;
}

export class ChangeUserPwdByDevDto {
    @IsNotEmpty({ message: '用户id不能为空' })
    @IsNumber()
    id: number;

    @IsString()
    @IsNotEmpty({ message: '密码不能为空' })
    @Length(8, 16, { message: '密码长度必须在8-16位之间' })
    password: string;
}

export class AddUserTimeDto {
    @IsNotEmpty({ message: '用户id不能为空' })
    @IsNumber()
    id: number;

    @IsNotEmpty({ message: '时间不能为空' })
    @IsNumber()
    minutes: number;
}

export class AddUserBanlanceDto {
    @IsNotEmpty({ message: '用户id不能为空' })
    @IsNumber()
    id: number;

    @IsNotEmpty({ message: '次数不能为空' })
    @IsNumber()
    money: number;
}

export class OnlyUserIdDto {
    @IsNotEmpty({ message: '用户id不能为空' })
    @IsNumber()
    id: number;
}
