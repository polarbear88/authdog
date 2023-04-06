import { Module, SetMetadata } from '@nestjs/common';
import { MODULE_PATH } from '@nestjs/common/constants';
import { DeveloperModule } from 'src/developer/developer.module';
import { FeedbackModule } from 'src/provide/feedback/feedback.module';
import { UserDeviceModule } from 'src/user/user-device/user-device.module';
import { UserModule } from 'src/user/user/user.module';
import { ApiFeedbackController } from './api-feedback.controller';

@SetMetadata(MODULE_PATH, 'feedback')
@Module({
    imports: [DeveloperModule, UserDeviceModule, UserModule, FeedbackModule],
    providers: [],
    controllers: [ApiFeedbackController],
})
export class ApiFeedbackModule {}
