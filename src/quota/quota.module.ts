import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Quota } from './quota.entity';
import { QuotaService } from './quota.service';
import { DeveloperModule } from '../developer/developer.module';
import { ApplicationModule } from 'src/provide/application/application.module';
import { ApplicationSubscriber } from './subscriber/application.subscriber';
import { UserModule } from 'src/user/user/user.module';
import { DeviceModule } from 'src/user/device/device.module';
import { UserSubscriber } from './subscriber/user.subscriber';
import { DeviceSubscriber } from './subscriber/device.subscriber';
import { CloudfunModule } from 'src/provide/cloudfun/cloudfun.module';
import { CloudfunSubscriber } from './subscriber/cloudfun.subscriber';
import { UserDataModule } from 'src/provide/user-data/user-data.module';
import { UserDataSubscriber } from './subscriber/userdata.subscriber';
import { SalerModule } from 'src/saler/saler/saler.module';
import { SalerSubscriber } from './subscriber/saler.subscriber';

@Module({
    imports: [
        TypeOrmModule.forFeature([Quota]),
        DeveloperModule,
        ApplicationModule,
        UserModule,
        DeviceModule,
        CloudfunModule,
        UserDataModule,
        SalerModule,
    ],
    controllers: [],
    providers: [QuotaService, ApplicationSubscriber, UserSubscriber, DeviceSubscriber, CloudfunSubscriber, UserDataSubscriber, SalerSubscriber],
    exports: [QuotaService],
})
export class QuotaModule {}
