import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { JwtModule } from '@nestjs/jwt';
import { TypeOrmModule } from '@nestjs/typeorm';
import { IPAddrModule } from 'src/ipaddr/ipaddr.module';
import { IPAddrService } from 'src/ipaddr/ipaddr.service';
import { LoginDeviceManageModule } from 'src/login-device-manage/login-device-manage.module';
import { RechargeCardModule } from 'src/recharge-card/recharge-card.module';
import { UserFinancialModule } from 'src/user-financial/user-financial.module';
import { User } from './user.entity';
import { UserService } from './user.service';
import { UserSubscriber } from './user.subscriber';

@Module({
    imports: [
        TypeOrmModule.forFeature([User]),
        IPAddrModule,
        LoginDeviceManageModule,
        UserFinancialModule,
        RechargeCardModule,
        JwtModule.registerAsync({
            imports: [ConfigModule],
            inject: [ConfigService],
            useFactory: (configService: ConfigService) => ({
                secret: configService.get('APP_JWT_SECRET'),
                signOptions: { expiresIn: '24h' },
            }),
        }),
    ],
    providers: [UserService, IPAddrService, UserSubscriber],
    exports: [UserService],
})
export class UserModule {}
