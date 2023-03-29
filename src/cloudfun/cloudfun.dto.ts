import { ArrayMaxSize, IsArray, IsBoolean, IsNotEmpty, IsNumber, IsOptional, IsString, Length } from 'class-validator';

export class CreateCloudfunDto {
    @IsNotEmpty({ message: '函数名称不能为空' })
    @IsString({ message: '函数名称必须是字符串' })
    @Length(1, 32, { message: '函数名称长度必须在1-32位之间' })
    name: string;

    @IsOptional()
    @IsString({ message: '函数描述必须是字符串' })
    description?: string;

    @IsNotEmpty({ message: '函数脚本不能为空' })
    @IsString({ message: '函数脚本必须是字符串' })
    @Length(1, 1048576, { message: '函数脚本太大，最大支持1MB' })
    script: string;

    @IsNotEmpty({ message: '是否全局不能为空' })
    @IsBoolean({ message: '是否全局必须是布尔值' })
    isGlobal: boolean;

    @IsOptional()
    @IsNumber({}, { message: '应用ID必须是数字' })
    applicationId?: number;
}

export class UpdateCloudfunDto {
    @IsNotEmpty({ message: '函数ID不能为空' })
    @IsNumber({}, { message: '函数ID必须是数字' })
    id: number;

    @IsNotEmpty({ message: '函数名称不能为空' })
    @IsString({ message: '函数名称必须是字符串' })
    @Length(1, 32, { message: '函数名称长度必须在1-32位之间' })
    name: string;

    @IsOptional()
    @IsString({ message: '函数描述必须是字符串' })
    description?: string;

    @IsNotEmpty({ message: '函数脚本不能为空' })
    @IsString({ message: '函数脚本必须是字符串' })
    @Length(1, 1048576, { message: '函数脚本太大，最大支持1MB' })
    script: string;

    @IsNotEmpty({ message: '是否全局不能为空' })
    @IsBoolean({ message: '是否全局必须是布尔值' })
    isGlobal: boolean;

    @IsOptional()
    @IsNumber({}, { message: '应用ID必须是数字' })
    applicationId?: number;
}

export class TryRunCloudfunDto {
    @IsNotEmpty({ message: '函数ID不能为空' })
    @IsNumber({}, { message: '函数ID必须是数字' })
    id: number;

    @IsOptional()
    @IsArray({ message: '参数必须是数组' })
    @ArrayMaxSize(10, { message: '参数最多支持10个' })
    @IsString({ each: true, message: '参数必须是字符串' })
    args?: string[];
}
