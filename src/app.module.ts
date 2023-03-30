import { CacheModule, MiddlewareConsumer, Module, NestModule } from '@nestjs/common';
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
import { ApplicationModule } from './application/application.module';
import { Application } from './application/application.entity';
import { CloudvarModule } from './cloudvar/cloudvar.module';
import { Cloudvar } from './cloudvar/cloudvar.entity';
import { UserModule } from './user/user.module';
import { DeviceModule } from './device/device.module';
import { UserDeviceModule } from './user-device/user-device.module';
import { User } from './user/user.entity';
import { Device } from './device/device.entity';
import { UserDevice } from './user-device/user-device.entity';
import { ApiModule } from './api/api.module';
import { ApiDecryptMiddleware } from './api/api-decrypt.middleware';
import { IPAddrModule } from './ipaddr/ipaddr.module';
import { LoginDeviceManageModule } from './login-device-manage/login-device-manage.module';
import * as redisStore from 'cache-manager-ioredis';
import { RedisModule } from '@nestjs-modules/ioredis';
import { RechargeCardModule } from './recharge-card/recharge-card.module';
import { FeedbackModule } from './feedback/feedback.module';
import { RechargeCard } from './recharge-card/recharge-card.entity';
import { RechargeCardType } from './recharge-card/card-type/recharge-card-type.entity';
import { UserFinancialModule } from './user-financial/user-financial.module';
import { UserFinancial } from './user-financial/user-financial.entity';
import { CloudfunModule } from './cloudfun/cloudfun.module';
import { SalerModule } from './saler/saler.module';
import { Saler } from './saler/saler.entity';

@Module({
    imports: [
        ConfigModule.forRoot({
            // 全局使用配置
            isGlobal: true,
            // 缓存配置
            cache: true,
            envFilePath: ['.env.dev', '.env'],
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
                ],
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
        CloudvarModule,
        UserModule,
        DeviceModule,
        UserDeviceModule,
        ApiModule,
        IPAddrModule,
        CacheModule.registerAsync({
            imports: [ConfigModule],
            inject: [ConfigService],
            useFactory: (configService: ConfigService) => ({
                isGlobal: true,
                store: redisStore,
                host: configService.get('REDIS_HOST'),
                port: +configService.get('REDIS_PORT'),
                password: configService.get('REDIS_PASSWORD'),
            }),
        }),
        LoginDeviceManageModule,
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
        RechargeCardModule,
        FeedbackModule,
        UserFinancialModule,
        CloudfunModule,
        SalerModule,
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
            .forRoutes('/v[0-9]/user/*', '/v[0-9]/app/*', '/v[0-9]/device/*', '/v[0-9]/cloudvar/*', '/v[0-9]/feedback/*', '/v[0-9]/cloudfun/*');
    }
}
