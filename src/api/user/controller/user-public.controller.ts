import { Controller, Post } from '@nestjs/common';
import { Throttle } from '@nestjs/throttler';
import { ApiBaseController } from 'src/api/api-base.controller';
import { Public } from 'src/common/decorator/public.decorator';

@Public()
@Controller({ version: '1', path: 'public' })
export class ApiUserPublicController extends ApiBaseController {
    @Throttle(20, 3600)
    @Post('register')
    async register() {
        return 'register';
    }
}
