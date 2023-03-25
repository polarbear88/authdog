import { IsNotEmpty, IsNumber, IsOptional, IsString } from 'class-validator';
import { BaseUserDeviceDto } from 'src/user-device/user-device.dto';

export class DeviceDto extends BaseUserDeviceDto {
    @IsNotEmpty({ message: 'appid不能为空' })
    @IsNumber()
    appid: number;

    @IsOptional()
    @IsString({ message: '其他信息必须是字符串' })
    otherInfo?: string;
}
