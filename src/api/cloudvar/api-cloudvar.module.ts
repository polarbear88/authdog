import { Module, SetMetadata } from '@nestjs/common';
import { MODULE_PATH } from '@nestjs/common/constants';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { JwtModule } from '@nestjs/jwt';
import { CloudvarModule } from 'src/cloudvar/cloudvar.module';
import { DeveloperModule } from 'src/developer/developer.module';
import { DeviceModule } from 'src/device/device.module';
import { UserDeviceModule } from 'src/user-device/user-device.module';
import { UserModule } from 'src/user/user.module';
import { ApiCloudvarController } from './api-cloudvar.controller';

@SetMetadata(MODULE_PATH, 'cloudvar')
@Module({
    imports: [
        DeveloperModule,
        UserDeviceModule,
        UserModule,
        DeviceModule,
        CloudvarModule,
        JwtModule.registerAsync({
            imports: [ConfigModule],
            inject: [ConfigService],
            useFactory: (configService: ConfigService) => ({
                secret: configService.get('APP_JWT_SECRET'),
                signOptions: { expiresIn: '24h' },
            }),
        }),
    ],
    providers: [],
    controllers: [ApiCloudvarController],
})
export class ApiCloudvarModule {}
