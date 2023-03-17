import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { BaseService } from 'src/common/service/base.service';
import { Repository } from 'typeorm';
import { DeveloperActionLog } from './developer-action-log.entity';

@Injectable()
export class DeveloperActionLogService extends BaseService {
    constructor(
        @InjectRepository(DeveloperActionLog)
        private developerActionLogRepository: Repository<DeveloperActionLog>,
    ) {
        super(developerActionLogRepository);
    }

    async createDeveloperActionLog(log: DeveloperActionLog) {
        return await this.developerActionLogRepository.save(log);
    }
}
