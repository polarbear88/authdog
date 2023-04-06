import { Injectable, NotAcceptableException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Application } from 'src/provide/application/application.entity';
import { PaginationUtils } from 'src/common/pagination/pagination.utils';
import { BaseService } from 'src/common/service/base.service';
import { Repository } from 'typeorm';
import { CreateFeedbackDto, GetFeedbackListDto } from './feedback.dto';
import { Feedback } from './feedback.entity';
import { FeedbackStatus } from './feedback.type';

@Injectable()
export class FeedbackService extends BaseService {
    constructor(
        @InjectRepository(Feedback)
        private repo: Repository<Feedback>,
    ) {
        super(repo);
    }

    async create(app: Application, version: string, dto: CreateFeedbackDto) {
        const feedback = new Feedback();
        feedback.appid = app.id;
        feedback.appVersion = version;
        feedback.userName = dto.userName;
        feedback.deviceId = dto.deviceId;
        feedback.brand = dto.brand ? dto.brand : '';
        feedback.model = dto.model ? dto.model : '';
        feedback.osType = dto.osType ? dto.osType : '';
        feedback.content = dto.content;
        feedback.developerId = app.developerId;
        feedback.status = 'pending';
        feedback.appName = app.name;
        return await this.repo.save(feedback);
    }

    async getList(developerId: number, dto: GetFeedbackListDto) {
        const data = await super.getPage(
            PaginationUtils.objectToDto(dto, new GetFeedbackListDto()),
            [['developerId = :developerId', { developerId }]],
            'id',
            'DESC',
        );
        return {
            total: data[1],
            list: data[0],
        };
    }

    async getPendingCount(developerId: number) {
        return await this.repo.count({
            where: {
                developerId,
                status: 'pending',
            },
        });
    }

    async getResolvedCount(developerId: number) {
        return await this.repo.count({
            where: {
                developerId,
                status: 'resolved',
            },
        });
    }

    async getRejectedCount(developerId: number) {
        return await this.repo.count({
            where: {
                developerId,
                status: 'rejected',
            },
        });
    }

    async setStatusByIds(developerId: number, ids: Array<number>, status: FeedbackStatus) {
        const query = this.repo.createQueryBuilder().update().set({ status }).where('id in (:...ids)', { ids });
        query.andWhere('developerId = :developerId', { developerId });
        const result = await query.execute();
        if (result.affected > 0) {
            return result.affected;
        }
        throw new NotAcceptableException('操作失败');
    }

    async deleteByIds(developerId: number, ids: Array<number>) {
        const query = this.repo.createQueryBuilder().delete().where('id in (:...ids)', { ids });
        query.andWhere('developerId = :developerId', { developerId });
        const result = await query.execute();
        if (result.affected > 0) {
            return result.affected;
        }
        throw new NotAcceptableException('操作失败');
    }
}
