import { IsBoolean, IsNotEmpty, IsNumber, IsOptional, IsString, Length } from 'class-validator';

export class CreateCloudvarDto {
    @IsNotEmpty({ message: '变量名称不能为空' })
    @IsString({ message: '变量名称必须是字符串' })
    @Length(1, 32, { message: '变量名称长度必须在1-32位之间' })
    name: string;

    @IsOptional()
    @IsString({ message: '变量描述必须是字符串' })
    desc?: string;

    @IsNotEmpty({ message: '变量值不能为空' })
    @IsString({ message: '变量值必须是字符串' })
    @Length(1, 10240, { message: '变量值最大10KB' })
    value: string;

    @IsNotEmpty({ message: '是否公开不能为空' })
    @IsBoolean({ message: '是否公开必须是布尔值' })
    isPublic: boolean;

    @IsNotEmpty({ message: '是否全局不能为空' })
    @IsBoolean({ message: '是否全局必须是布尔值' })
    isGlobal: boolean;

    @IsOptional()
    @IsNumber({}, { message: '应用ID必须是数字' })
    applicationId?: number;
}

export class UpdateCloudvarDto {
    @IsNotEmpty({ message: '变量ID不能为空' })
    @IsNumber({}, { message: '变量ID必须是数字' })
    id: number;

    @IsNotEmpty({ message: '变量名称不能为空' })
    @IsString({ message: '变量名称必须是字符串' })
    @Length(1, 32, { message: '变量名称长度必须在1-32位之间' })
    name: string;

    @IsOptional()
    @IsString({ message: '变量描述必须是字符串' })
    desc?: string;

    @IsNotEmpty({ message: '变量值不能为空' })
    @IsString({ message: '变量值必须是字符串' })
    @Length(1, 10240, { message: '变量值最大10KB' })
    value: string;

    @IsNotEmpty({ message: '是否公开不能为空' })
    @IsBoolean({ message: '是否公开必须是布尔值' })
    isPublic: boolean;

    @IsNotEmpty({ message: '是否全局不能为空' })
    @IsBoolean({ message: '是否全局必须是布尔值' })
    isGlobal: boolean;

    @IsOptional()
    @IsNumber({}, { message: '应用ID必须是数字' })
    applicationId?: number;
}
