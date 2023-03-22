import { IsNotEmpty, IsString, Length } from 'class-validator';

export class BaseUserDeviceDto {
    brand?: string;
    model?: string;
    osType?: string;

    @IsString()
    @IsNotEmpty({ message: '设备ID不能为空' })
    @Length(6, 200, { message: '设备ID长度为6-200位之间' })
    deviceId: string;
}
