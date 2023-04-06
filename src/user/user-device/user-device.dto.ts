import { IsNotEmpty, IsOptional, IsString, Length } from 'class-validator';

export class BaseUserDeviceDto {
    @IsOptional()
    @IsString()
    brand?: string;

    @IsOptional()
    @IsString()
    model?: string;

    @IsOptional()
    @IsString()
    osType?: string;

    @IsString()
    @IsNotEmpty({ message: '设备ID不能为空' })
    @Length(6, 200, { message: '设备ID长度为6-200位之间' })
    deviceId: string;
}
