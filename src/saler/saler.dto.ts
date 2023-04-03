import { Type } from 'class-transformer';
import {
    ArrayMaxSize,
    ArrayMinSize,
    IsArray,
    IsInt,
    IsNotEmpty,
    IsNumber,
    IsNumberString,
    IsOptional,
    IsString,
    Length,
    Max,
    MaxLength,
    Min,
    ValidateNested,
} from 'class-validator';
import { PaginationWhere } from 'src/common/pagination/pagination.decorator';
import { UserName } from 'src/common/validate/username.validate';
export class CreateSalerByDevloperDto {
    @UserName('name', { message: '用户名只能包含字母和数字并以字母开头' })
    name: string;

    @IsNotEmpty({ message: '密码不能为空' })
    @IsString({ message: '密码必须是字符串' })
    @Length(8, 16, { message: '密码长度必须在8-16位之间' })
    password: string;

    @IsNotEmpty({ message: '手机号不能为空' })
    @IsNumberString(undefined, { message: '手机号必须为数字字符串' })
    @Length(11, 11, { message: '手机号必须为11位' })
    mobile: string;
}

export class RegisterSalerDto extends CreateSalerByDevloperDto {
    @IsNotEmpty({ message: 'token不能为空' })
    @IsString()
    @MaxLength(100, { message: 'token不能超过100个字符' })
    token: string;
}

export class GetSalerListDto {
    @IsOptional()
    @IsString()
    @PaginationWhere('name = :name')
    name?: string;

    @IsOptional()
    @IsString()
    @PaginationWhere('parentName = :parentName')
    parentName?: string;

    @IsOptional()
    @IsString()
    @PaginationWhere('mobile = :mobile')
    mobile?: string;

    @IsOptional()
    @IsString()
    @PaginationWhere('status = :status')
    status?: string;

    @IsOptional()
    @IsNumber()
    @PaginationWhere('balance >= :balanceThanOrEq')
    balanceThanOrEq?: number;

    @IsOptional()
    @IsNumber()
    @PaginationWhere('balance <= :balanceLessOrEq')
    balanceLessOrEq?: number;

    @IsOptional()
    @IsString()
    @PaginationWhere('createdAt >= :createdAtStart')
    createdAtStart?: string;

    @IsOptional()
    @IsString()
    @PaginationWhere('createdAt <= :createdAtEnd')
    createdAtEnd?: string;

    @IsOptional()
    @IsString()
    @PaginationWhere('fromToken = :fromToken')
    fromToken?: string;

    @IsOptional()
    @IsString()
    @PaginationWhere('salerRoleName = :salerRoleName')
    salerRoleName?: string;
}

export class AddSalerBanlanceDto {
    @IsNotEmpty()
    @IsNumber()
    id: number;

    @IsNotEmpty({ message: '金额不能为空' })
    @IsNumber()
    amount: number;
}

export class SetSalerAppsItemDto {
    @IsNotEmpty()
    @IsNumber()
    id: number;

    @IsNotEmpty()
    @IsString()
    @MaxLength(100, { message: '应用名称长度不能超过100' })
    name: string;
}

export class SetSalerAppsDto {
    @IsNotEmpty()
    @IsNumber()
    id: number;

    @ValidateNested({ each: true })
    @Type(() => SetSalerAppsItemDto)
    @ArrayMinSize(1)
    @ArrayMaxSize(100)
    apps: SetSalerAppsItemDto[];
}

export class SalerLoginDto {
    @IsNotEmpty({ message: '用户名不能为空' })
    @Length(6, 16, { message: '用户名长度必须在6-16位之间' })
    username: string;

    @IsNotEmpty({ message: '密码不能为空' })
    @IsString({ message: '密码必须是字符串' })
    @Length(32, 32, { message: '密码错误' })
    password: string;

    @IsNotEmpty({ message: 'token不能为空' })
    @IsString()
    @MaxLength(100, { message: 'token不能超过100个字符' })
    token: string;
}

export class SalerSetRoleDto {
    @IsNotEmpty({ message: '用户id数组不能为空' })
    @IsArray()
    @ArrayMinSize(1, { message: '用户id数组不能为空' })
    @ArrayMaxSize(100, { message: '用户id数组最多100个' })
    @IsInt({ each: true })
    ids: number[];

    @IsNotEmpty({ message: '角色id不能为空' })
    @IsInt({ message: '角色id必须是整数' })
    roleId: number;
}

export class FundTransferDto {
    @IsNotEmpty({ message: '转账金额不能为空' })
    @IsNumber()
    amount: number;

    @IsNotEmpty({ message: '转账用户id不能为空' })
    @IsNumber()
    id: number;
}

export class SetSubordinatePriceItemDto {
    @IsNotEmpty({ message: '应用id不能为空' })
    @IsInt()
    appid: number;

    @IsNotEmpty({ message: '卡类型id不能为空' })
    @IsInt()
    cardTypeId: number;

    @IsNotEmpty({ message: '溢价比例不能为空' })
    @IsInt()
    @Min(1)
    percentage: number;
}
export class SetSubordinatePriceDto {
    @ValidateNested({ each: true })
    @Type(() => SetSubordinatePriceItemDto)
    @ArrayMinSize(1)
    @ArrayMaxSize(100)
    subordinatePrice: SetSubordinatePriceItemDto[];
}
