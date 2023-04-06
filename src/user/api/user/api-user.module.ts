import { Module, SetMetadata } from '@nestjs/common';
import { MODULE_PATH } from '@nestjs/common/constants';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { JwtModule } from '@nestjs/jwt';
import { ApplicationModule } from 'src/provide/application/application.module';
import { DeveloperModule } from 'src/developer/developer.module';
import { UserDeviceModule } from 'src/user/user-device/user-device.module';
import { UserModule } from 'src/user/user/user.module';
import { ApiUserPublicController } from './controller/api-user-public.controller';

@SetMetadata(MODULE_PATH, 'user')
@Module({
    imports: [
        UserModule,
        UserDeviceModule,
        ApplicationModule,
        DeveloperModule,
        JwtModule.registerAsync({
            imports: [ConfigModule],
            inject: [ConfigService],
            useFactory: (configService: ConfigService) => ({
                secret: configService.get('APP_JWT_SECRET'),
                signOptions: { expiresIn: '24h' },
            }),
        }),
    ],
    controllers: [ApiUserPublicController],
})
export class ApiUserModule {}
