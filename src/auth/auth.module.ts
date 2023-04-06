import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { JwtModule } from '@nestjs/jwt';
import { PassportModule } from '@nestjs/passport';
import { DeveloperModule } from 'src/developer/developer.module';
import { LoginDeviceManageModule } from 'src/user/login-device-manage/login-device-manage.module';
import { SalerModule } from 'src/saler/saler/saler.module';
import { UserModule } from 'src/user/user/user.module';
import { JwtStrategy } from './jwt.strategy';

@Module({
    imports: [
        PassportModule,
        JwtModule.registerAsync({
            imports: [ConfigModule],
            inject: [ConfigService],
            useFactory: (configService: ConfigService) => ({
                secret: configService.get('APP_JWT_SECRET'),
                signOptions: { expiresIn: '24h' },
            }),
        }),
        DeveloperModule,
        UserModule,
        LoginDeviceManageModule,
        SalerModule,
    ],
    providers: [JwtStrategy],
    exports: [PassportModule, JwtModule],
})
export class AuthModule {}
