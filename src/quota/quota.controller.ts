import { Controller, Get, NotFoundException, Query } from '@nestjs/common';
import { BaseController } from 'src/common/controller/base.controller';
import { Public } from 'src/common/decorator/public.decorator';
import { QuotaService } from './quota.service';
import { QuotaCard } from './card/quota-card.entity';
import { RandomUtils } from 'src/common/utils/random.utils';

@Public()
@Controller({ version: '1', path: '96b64c62a0552b9e7bc04774b0850c17' })
export class QuotaController extends BaseController {
    constructor(private quotaService: QuotaService) {
        super();
    }

    @Get()
    async getQuota(@Query('quota') quota: string, @Query('token') token: string) {
        if (!quota || !token) {
            throw new NotFoundException();
        }
        if (token !== '4d3247eede5354cdce53ab8bc94e0687') {
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
