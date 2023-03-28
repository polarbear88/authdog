import { Module } from '@nestjs/common';
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
    imports: [TypeOrmModule.forFeature([User]), IPAddrModule, LoginDeviceManageModule, UserFinancialModule, RechargeCardModule],
    providers: [UserService, IPAddrService, UserSubscriber],
    exports: [UserService],
})
export class UserModule {}
