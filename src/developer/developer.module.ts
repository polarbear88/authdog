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
import { IPAddrService } from 'src/common/service/ipaddr.service';
import { HttpModule } from '@nestjs/axios';
import { JwtModule } from '@nestjs/jwt';
import { ConfigModule, ConfigService } from '@nestjs/config';

// 设置此模块路由前缀
@SetMetadata(MODULE_PATH, 'developer')
@Module({
    imports: [
        TypeOrmModule.forFeature([Developer]),
        DeveloperActionLogModule,
        ApplicationModule,
        CloudvarModule,
        HttpModule.register({
            timeout: 5000,
            maxRedirects: 5,
        }),
        JwtModule.registerAsync({
            imports: [ConfigModule],
            inject: [ConfigService],
            useFactory: (configService: ConfigService) => ({
                secret: configService.get('APP_JWT_SECRET'),
                signOptions: { expiresIn: '24h' },
            }),
        }),
    ],
    controllers: [DeveloperController, ProfileController, ApplicationController, CloudvarController],
    providers: [DeveloperService, IPAddrService, DeveloperSubscriber],
    exports: [DeveloperService],
})
export class DeveloperModule {}
