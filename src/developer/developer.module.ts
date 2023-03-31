import { Module, SetMetadata } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { DeveloperController } from './controller/developer.controller';
import { Developer } from './developer.entity';
import { DeveloperService } from './developer.service';
import { MODULE_PATH } from '@nestjs/common/constants';
import { ProfileController } from './controller/profile.controller';
import { DeveloperActionLogModule } from './action-log/developer-action-log.module';
import { ApplicationModule } from 'src/application/application.module';
import { ApplicationController } from './controller/application.controller';
import { CloudvarModule } from 'src/cloudvar/cloudvar.module';
import { CloudvarController } from './controller/cloudvar.controller';
import { DeveloperSubscriber } from './developer.subscriber';
import { JwtModule } from '@nestjs/jwt';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { IPAddrModule } from 'src/ipaddr/ipaddr.module';
import { UserModule } from 'src/user/user.module';
import { UserController } from './controller/user.controller';
import { DeviceController } from './controller/device.controller';
import { DeviceModule } from 'src/device/device.module';
import { RechargeCardModule } from 'src/recharge-card/recharge-card.module';
import { RechargeCardTypeController } from './controller/recharge-card-type.controller';
import { RechargeCardController } from './controller/recharge-card.controller';
import { FeedbackModule } from 'src/feedback/feedback.module';
import { FeedbackController } from './controller/feedback.controller';
import { CloudfunController } from './controller/cloudfun.controller';
import { CloudfunModule } from 'src/cloudfun/cloudfun.module';
import { SalerController } from './controller/saler.controller';
import { SalerModule } from 'src/saler/saler.module';
import { SalerEntryLinkModule } from 'src/saler/entry-link/entry-link.module';
import { SalerEntryLinkController } from './controller/saler-entry-link.controller';

// 设置此模块路由前缀
@SetMetadata(MODULE_PATH, 'developer')
@Module({
    imports: [
        TypeOrmModule.forFeature([Developer]),
        DeveloperActionLogModule,
        ApplicationModule,
        CloudvarModule,
        CloudfunModule,
        JwtModule.registerAsync({
            imports: [ConfigModule],
            inject: [ConfigService],
            useFactory: (configService: ConfigService) => ({
                secret: configService.get('APP_JWT_SECRET'),
                signOptions: { expiresIn: '24h' },
            }),
        }),
        IPAddrModule,
        UserModule,
        DeviceModule,
        RechargeCardModule,
        FeedbackModule,
        SalerModule,
        SalerEntryLinkModule,
    ],
    controllers: [
        DeveloperController,
        ProfileController,
        ApplicationController,
        CloudvarController,
        UserController,
        DeviceController,
        RechargeCardTypeController,
        RechargeCardController,
        FeedbackController,
        CloudfunController,
        SalerController,
        SalerEntryLinkController,
    ],
    providers: [DeveloperService, DeveloperSubscriber],
    exports: [DeveloperService],
})
export class DeveloperModule {}
