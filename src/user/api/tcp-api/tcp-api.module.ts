import { Module } from '@nestjs/common';
import { TcpApiController } from './tcp-api.controller';
import { ApplicationModule } from 'src/provide/application/application.module';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { Application } from 'src/provide/application/application.entity';
import { Cloudvar } from 'src/provide/cloudvar/cloudvar.entity';
import { DeveloperActionLog } from 'src/developer/action-log/developer-action-log.entity';
import { Developer } from 'src/developer/developer.entity';
import { Device } from 'src/user/device/device.entity';
import { FundFlow } from 'src/provide/fund-flow/fund-flow.entity';
import { RechargeCardType } from 'src/provide/recharge-card/card-type/recharge-card-type.entity';
import { RechargeCard } from 'src/provide/recharge-card/recharge-card.entity';
import { SalerRoles } from 'src/saler/saler-roles/saler-roles.entity';
import { SalerEntryLink } from 'src/saler/saler/entry-link/entry-link.entity';
import { Saler } from 'src/saler/saler/saler.entity';
import { UserDevice } from 'src/user/user-device/user-device.entity';
import { UserFinancial } from 'src/user/user-financial/user-financial.entity';
import { User } from 'src/user/user/user.entity';
import { DeviceModule } from 'src/user/device/device.module';
import { UserModule } from 'src/user/user/user.module';
import { RedisModule } from '@nestjs-modules/ioredis';

@Module({
    imports: [
        ConfigModule.forRoot({
            // 全局使用配置
            isGlobal: true,
            // 缓存配置
            cache: true,
            envFilePath: ['.env.dev', '.env.prod', '.env'],
        }),
        TypeOrmModule.forRootAsync({
            imports: [ConfigModule],
            inject: [ConfigService],
            useFactory: (configService: ConfigService) => ({
                type: 'mysql',
                host: configService.get('DATABASE_HOST'),
                port: +configService.get('DATABASE_PORT'),
                username: configService.get('DATABASE_USERNAME'),
                password: configService.get('DATABASE_PASSWORD'),
                database: configService.get('DATABASE_NAME'),
                synchronize: false,
                autoLoadEntities: true,
                entities: [
                    Developer,
                    DeveloperActionLog,
                    Application,
                    Cloudvar,
                    User,
                    Device,
                    UserDevice,
                    RechargeCard,
                    RechargeCardType,
                    UserFinancial,
                    Saler,
                    FundFlow,
                    SalerEntryLink,
                    SalerRoles,
                ],
            }),
        }),
        RedisModule.forRootAsync({
            imports: [ConfigModule],
            inject: [ConfigService],
            useFactory: (configService: ConfigService) => ({
                config: {
                    host: configService.get('REDIS_HOST'),
                    port: +configService.get('REDIS_PORT'),
                    password: configService.get('REDIS_PASSWORD'),
                },
            }),
        }),
        ApplicationModule,
        DeviceModule,
        UserModule,
    ],
    providers: [],
    controllers: [TcpApiController],
})
export class TcpApiModule {}
