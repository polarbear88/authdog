import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { IPAddrModule } from 'src/ipaddr/ipaddr.module';
import { IPAddrService } from 'src/ipaddr/ipaddr.service';
import { LoginDeviceManageModule } from 'src/login-device-manage/login-device-manage.module';
import { User } from './user.entity';
import { UserService } from './user.service';
import { UserSubscriber } from './user.subscriber';

@Module({
    imports: [TypeOrmModule.forFeature([User]), IPAddrModule, LoginDeviceManageModule],
    providers: [UserService, IPAddrService, UserSubscriber],
    exports: [UserService],
})
export class UserModule {}
