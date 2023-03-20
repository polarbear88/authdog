import { IsBoolean, IsNumber, IsString, Length } from 'class-validator';

export class CreateCloudvarDto {
    @IsString({ message: '变量名称必须是字符串' })
    @Length(1, 32, { message: '变量名称长度必须在1-32位之间' })
    name: string;

    desc?: string;

    @IsString({ message: '变量值必须是字符串' })
    @Length(1, 10240, { message: '变量值最大10KB' })
    value: string;

    @IsBoolean({ message: '是否公开必须是布尔值' })
    isPublic: boolean;

    @IsBoolean({ message: '是否全局必须是布尔值' })
    isGlobal: boolean;

    applicationId?: number;
}

export class UpdateCloudvarDto {
    @IsNumber({}, { message: '变量ID必须是数字' })
    id: number;

    @IsString({ message: '变量名称必须是字符串' })
    @Length(1, 32, { message: '变量名称长度必须在1-32位之间' })
    name: string;

    desc?: string;

    @IsString({ message: '变量值必须是字符串' })
    @Length(1, 10240, { message: '变量值最大10KB' })
    value: string;

    @IsBoolean({ message: '是否公开必须是布尔值' })
    isPublic: boolean;

    @IsBoolean({ message: '是否全局必须是布尔值' })
    isGlobal: boolean;

    applicationId?: number;
}
