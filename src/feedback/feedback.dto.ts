import { IsNotEmpty, IsNumber, IsString, MaxLength } from 'class-validator';
import { BaseUserDeviceDto } from 'src/user-device/user-device.dto';

export class CreateFeedbackDto extends BaseUserDeviceDto {
    @IsNotEmpty({ message: 'appid不能为空' })
    @IsNumber()
    appid: number;

    @IsNotEmpty({ message: '用户名不能为空' })
    @IsString({ message: '用户名必须是字符串' })
    @MaxLength(50, { message: '用户名长度不能超过50' })
    userName: string;

    @IsNotEmpty({ message: '内容不能为空' })
    @IsString()
    @MaxLength(1000, { message: '内容长度不能超过1000' })
    content: string;
}
