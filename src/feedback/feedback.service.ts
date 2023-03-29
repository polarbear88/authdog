import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Application } from 'src/application/application.entity';
import { BaseService } from 'src/common/service/base.service';
import { Repository } from 'typeorm';
import { CreateFeedbackDto } from './feedback.dto';
import { Feedback } from './feedback.entity';

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
        feedback.status = 'pending';
        return await this.repo.save(feedback);
    }
}
