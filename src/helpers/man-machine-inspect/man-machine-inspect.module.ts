import { Module } from '@nestjs/common';
import { ManMachineInspectService } from './man-machine-inspect.service';
import { ManMachineInspectController } from './man-machine-inspect.controller';
import { HttpModule } from '@nestjs/axios';
import { GeetestService } from './geetest.service';

@Module({
    imports: [
        HttpModule.register({
            timeout: 5000,
            maxRedirects: 5,
        }),
    ],
    providers: [GeetestService, ManMachineInspectService],
    controllers: [ManMachineInspectController],
    exports: [ManMachineInspectService],
})
export class ManMachineInspectModule {}
