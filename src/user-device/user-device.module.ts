import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { IPAddrModule } from 'src/ipaddr/ipaddr.module';
import { UserDevice } from './user-device.entity';
import { UserDeviceService } from './user-device.service';
import { UserDeviceSubscriber } from './user-device.subscriber';

@Module({
    imports: [TypeOrmModule.forFeature([UserDevice]), IPAddrModule],
    providers: [UserDeviceService, UserDeviceSubscriber],
    exports: [UserDeviceService],
})
export class UserDeviceModule {}
