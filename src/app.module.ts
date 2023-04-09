import { MiddlewareConsumer, Module, NestModule } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { ThrottlerModule } from '@nestjs/throttler';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { Developer } from './developer/developer.entity';
import { DeveloperModule } from './developer/developer.module';
import { APP_FILTER, APP_GUARD, APP_INTERCEPTOR } from '@nestjs/core';
import { ThrottlerBehindProxyGuard } from './throttler-behind-proxy.guard';
import { ThrottlerStorageRedisService } from 'nestjs-throttler-storage-redis';
import { AuthModule } from './auth/auth.module';
import { JwtAuthGuard } from './auth/jwt-auth.guard';
import { RolesGuard } from './auth/roles.guard';
import { ResponseInterceptor } from './response.interceptor';
import { HttpExceptionFilter } from './http-exception.filter';
import { DeveloperActionLog } from './developer/action-log/developer-action-log.entity';
import { ApplicationModule } from './provide/application/application.module';
import { Application } from './provide/application/application.entity';
import { Cloudvar } from './provide/cloudvar/cloudvar.entity';
import { User } from './user/user/user.entity';
import { Device } from './user/device/device.entity';
import { UserDevice } from './user/user-device/user-device.entity';
import { ApiModule } from './user/api/api.module';
import { ApiDecryptMiddleware } from './user/api/api-decrypt.middleware';
import { RedisModule } from '@nestjs-modules/ioredis';
import { RechargeCard } from './provide/recharge-card/recharge-card.entity';
import { RechargeCardType } from './provide/recharge-card/card-type/recharge-card-type.entity';
import { UserFinancial } from './user/user-financial/user-financial.entity';
import { Saler } from './saler/saler/saler.entity';
import { FundFlow } from './provide/fund-flow/fund-flow.entity';
import { SalerEntryLink } from './saler/saler/entry-link/entry-link.entity';
import { SalerControlModule } from './saler/saler-control/saler-control.module';
import { SalerRoles } from './saler/saler-roles/saler-roles.entity';
import { PeriodicStatisticsModule } from './periodic-statistics/periodic-statistics.module';
import { PeriodicStatistics } from './periodic-statistics/periodic-statistics.entity';
import { ManMachineInspectModule } from './helpers/man-machine-inspect/man-machine-inspect.module';
import { UserData } from './provide/user-data/user-data.entity';
import { Quota } from './quota/quota.entity';
import { QuotaModule } from './quota/quota.module';

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
                synchronize: configService.get('DATABASE_SYNCHRONIZE') == 'true',
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
                    PeriodicStatistics,
                    UserData,
                    Quota,
                ],
                logging: ['error'],
            }),
        }),
        // 导入请求频率限制器
        ThrottlerModule.forRootAsync({
            imports: [ConfigModule],
            inject: [ConfigService],
            useFactory: (configService: ConfigService) => ({
                ttl: +configService.get('THROTTLE_TTL'),
                limit: +configService.get('THROTTLE_LIMIT'),
                storage: new ThrottlerStorageRedisService({
                    host: configService.get('REDIS_HOST'),
                    port: +configService.get('REDIS_PORT'),
                    password: configService.get('REDIS_PASSWORD'),
                }),
            }),
        }),
        DeveloperModule,
        AuthModule,
        ApplicationModule,
        ApiModule,
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
        SalerControlModule,
        PeriodicStatisticsModule,
        ManMachineInspectModule,
        QuotaModule,
    ],
    controllers: [AppController],
    providers: [
        AppService,
        // 为请求频率限制器设置全局守卫
        {
            provide: APP_GUARD,
            useClass: ThrottlerBehindProxyGuard,
        },
        // 为jwt授权设置全局守卫
        {
            provide: APP_GUARD,
            useClass: JwtAuthGuard,
        },
        // 为角色授权设置全局守卫
        {
            provide: APP_GUARD,
            useClass: RolesGuard,
        },
        {
            provide: APP_INTERCEPTOR,
            useClass: ResponseInterceptor,
        },
        {
            provide: APP_FILTER,
            useClass: HttpExceptionFilter,
        },
    ],
})
export class AppModule implements NestModule {
    configure(consumer: MiddlewareConsumer) {
        // 应用API解密中间件
        consumer
            .apply(ApiDecryptMiddleware)
            .forRoutes(
                '/v[0-9]/user/*',
                '/v[0-9]/app/*',
                '/v[0-9]/device/*',
                '/v[0-9]/cloudvar/*',
                '/v[0-9]/feedback/*',
                '/v[0-9]/cloudfun/*',
                '/v[0-9]/userdata/*',
            );
    }
}
