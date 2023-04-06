import { Module } from '@nestjs/common';
import { AliSMSService } from './alisms.service';
import { SMSValidateService } from './sms-validate.service';

@Module({
    providers: [AliSMSService, SMSValidateService],
    exports: [SMSValidateService],
})
export class SmsValidateModule {}
