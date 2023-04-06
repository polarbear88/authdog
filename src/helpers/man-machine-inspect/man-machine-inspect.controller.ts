import { Controller, Get } from '@nestjs/common';
import { BaseController } from 'src/common/controller/base.controller';
import { Public } from 'src/common/decorator/public.decorator';
import { ManMachineInspectService } from './man-machine-inspect.service';

@Public()
@Controller({ version: '1', path: 'man-machine-inspect' })
export class ManMachineInspectController extends BaseController {
    constructor(private manMachineInspectService: ManMachineInspectService) {
        super();
    }

    @Get('config')
    async getConfig() {
        return this.manMachineInspectService.getConfig();
    }
}
