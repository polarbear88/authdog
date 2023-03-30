import { IsNotEmpty, IsNumber, IsNumberString, IsOptional, IsString, Length } from 'class-validator';
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
}
