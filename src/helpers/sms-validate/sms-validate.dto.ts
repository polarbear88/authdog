import { IsNotEmpty } from 'class-validator';
import { IsChinaPhoneNumber } from 'src/common/validate/phone-number';

export class SendSmsDto {
    @IsNotEmpty({ message: '手机号不能为空' })
    @IsChinaPhoneNumber()
    mobile: string;
}
