import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { BaseService } from 'src/common/service/base.service';
import { SalerNotice } from './saler-notice.entity';
import { Repository } from 'typeorm';

@Injectable()
export class SalerNoticeService extends BaseService {
    constructor(
        @InjectRepository(SalerNotice)
        private repo: Repository<SalerNotice>,
    ) {
        super(repo);
    }

    async setNotice(developerId: number, salerId: number, content: string) {
        let notice = await this.repo.findOne({
            where: { developerId, salerId },
        });
        if (!notice) {
            notice = new SalerNotice();
        }
        notice.developerId = developerId;
        notice.salerId = salerId;
        notice.content = content;
        return await this.repo.save(notice);
    }

    async getNotice(developerId: number, salerId: number) {
        const notice = await this.repo.findOne({
            where: { developerId, salerId },
        });
        if (!notice) {
            return '';
        }
        return notice.content;
    }
}
