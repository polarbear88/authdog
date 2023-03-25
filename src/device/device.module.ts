import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { IPAddrModule } from 'src/ipaddr/ipaddr.module';
import { IPAddrService } from 'src/ipaddr/ipaddr.service';
import { Device } from './device.entity';
import { DeviceService } from './device.service';
import { DeviceSubscriber } from './device.subscriber';

@Module({
    imports: [TypeOrmModule.forFeature([Device]), IPAddrModule],
    providers: [DeviceService, IPAddrService, DeviceSubscriber],
    exports: [DeviceService],
})
export class DeviceModule {}
