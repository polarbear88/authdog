import { HttpModule } from '@nestjs/axios';
import { Module } from '@nestjs/common';
import { IPAddrService } from './ipaddr.service';

@Module({
    imports: [
        HttpModule.register({
            timeout: 5000,
            maxRedirects: 5,
        }),
    ],
    providers: [IPAddrService],
    exports: [IPAddrService, HttpModule],
})
export class IPAddrModule {}
