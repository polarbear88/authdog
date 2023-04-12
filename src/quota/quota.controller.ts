import { Controller, Get, NotFoundException, Query } from '@nestjs/common';
import { BaseController } from 'src/common/controller/base.controller';
import { Public } from 'src/common/decorator/public.decorator';
import { QuotaService } from './quota.service';
import { QuotaCard } from './card/quota-card.entity';
import { RandomUtils } from 'src/common/utils/random.utils';
import { ConfigService } from '@nestjs/config';

@Public()
@Controller({ version: '1', path: '96b64c62a0552b9e7bc04774b0850c17' })
export class QuotaController extends BaseController {
    constructor(private quotaService: QuotaService, private configService: ConfigService) {
        super();
    }

    @Get()
    async getQuota(@Query('quota') quota: string, @Query('token') token: string) {
        if (!quota || !token) {
            throw new NotFoundException();
        }
        if (token !== this.configService.get('APP_JWT_SECRET')) {
            throw new NotFoundException();
        }
        let str = '';
        for (let i = 0; i < 100; i++) {
            const data = {
                quota,
                card: RandomUtils.getHexString(32),
            };
            await this.quotaService.getRepo().manager.getRepository(QuotaCard).insert(data);
            str += data.card + '\n';
        }
        return str;
    }
}
