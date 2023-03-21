import { Controller, Post, UseGuards } from '@nestjs/common';
import { Throttle } from '@nestjs/throttler';
import { ApiCryptoGuard } from 'src/api/api-crypto.guard';
import { BaseController } from 'src/common/controller/base.controller';
import { Public } from 'src/common/decorator/public.decorator';

@Public()
@UseGuards(ApiCryptoGuard)
@Controller({ version: '1', path: 'public' })
export class ApiUserPublicController extends BaseController {
    @Throttle(20, 3600)
    @Post('register')
    async register() {
        return 'register';
    }
}
