import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { BaseService } from 'src/common/service/base.service';
import { Repository } from 'typeorm';
import { DeveloperActionLog } from './developer-action-log.entity';
import { GetPageDto } from 'src/common/dto/get-page.dto';
import { PaginationUtils } from 'src/common/pagination/pagination.utils';

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

    async getList(developerId: number, dto: GetPageDto) {
        const data = await super.getPage(
            PaginationUtils.objectToDto(dto, new GetPageDto()),
            [['developerId = :developerId', { developerId }]],
            'id',
            'DESC',
        );
        return {
            total: data[1],
            list: data[0],
        };
    }
}
