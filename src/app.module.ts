import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { ThrottlerModule } from '@nestjs/throttler';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { Developer } from './developer/developer.entity';
import { DeveloperModule } from './developer/developer.module';
import { APP_GUARD } from '@nestjs/core';
import { ThrottlerBehindProxyGuard } from './throttler-behind-proxy.guard';
import { ThrottlerStorageRedisService } from 'nestjs-throttler-storage-redis';

@Module({
    imports: [
        ConfigModule.forRoot({
            // 全局使用配置
            isGlobal: true,
            // 缓存配置
            cache: true,
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
                entities: [Developer],
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
    ],
    controllers: [AppController],
    providers: [
        AppService,
        {
            provide: APP_GUARD,
            useClass: ThrottlerBehindProxyGuard,
        },
    ],
})
export class AppModule {}
