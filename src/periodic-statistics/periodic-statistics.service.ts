import { Injectable } from '@nestjs/common';
import { MoreThanOrEqual, Repository } from 'typeorm';
import { PeriodicStatistics } from './periodic-statistics.entity';
import { InjectRepository } from '@nestjs/typeorm';
import { BaseService } from 'src/common/service/base.service';

@Injectable()
export class PeriodicStatisticsService extends BaseService {
    constructor(
        @InjectRepository(PeriodicStatistics)
        private repo: Repository<PeriodicStatistics>,
    ) {
        super(repo);
    }

    async getData(developerId: number, matter: string, startTime: Date) {
        return this.repo.find({
            where: {
                developerId,
                matter,
                startTime: MoreThanOrEqual(startTime),
            },
            take: 100,
        });
    }
}
