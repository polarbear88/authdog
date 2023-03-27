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

// 设置此模块路由前缀
@SetMetadata(MODULE_PATH, 'developer')
@Module({
    imports: [
        TypeOrmModule.forFeature([Developer]),
        DeveloperActionLogModule,
        ApplicationModule,
        CloudvarModule,
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
    ],
    controllers: [
        DeveloperController,
        ProfileController,
        ApplicationController,
        CloudvarController,
        UserController,
        DeviceController,
        RechargeCardTypeController,
    ],
    providers: [DeveloperService, DeveloperSubscriber],
    exports: [DeveloperService],
})
export class DeveloperModule {}
