import { BaseUserDeviceDto } from 'src/user-device/user-device.dto';

export class CreateFeedbackDto extends BaseUserDeviceDto {
    appid: string;
    content: string;
}
