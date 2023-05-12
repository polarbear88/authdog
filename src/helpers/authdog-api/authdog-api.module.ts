import { HttpModule } from '@nestjs/axios';
import { Module } from '@nestjs/common';
import { AuthdogApiService } from './authdog-api.service';

@Module({
    imports: [
        HttpModule.register({
            timeout: 5000,
            maxRedirects: 5,
        }),
    ],
    providers: [AuthdogApiService],
    exports: [AuthdogApiService],
})
export class AuthdogApiModule {}
