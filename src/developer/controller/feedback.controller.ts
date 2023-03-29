import { Body, Controller, Post } from '@nestjs/common';
import { BaseController } from 'src/common/controller/base.controller';
import { Roles } from 'src/common/decorator/roles.decorator';
import { Role } from 'src/common/enums/role.enum';
import { DeleteFeedbackDto, GetFeedbackListDto, SetFeedbackStatusDto } from 'src/feedback/feedback.dto';
import { FeedbackService } from 'src/feedback/feedback.service';
import { FeedbackStatus } from 'src/feedback/feedback.type';
import { TakeDeveloper } from '../decorator/take-developer.decorator';

@Roles(Role.Developer)
@Controller({ version: '1', path: 'feedback' })
export class FeedbackController extends BaseController {
    constructor(private feedbackService: FeedbackService) {
        super();
    }

    @Post('list')
    async list(@TakeDeveloper() developer: any, @Body() dto: GetFeedbackListDto) {
        return this.feedbackService.getList(developer.id, dto);
    }

    @Post('count')
    async count(@TakeDeveloper() developer: any) {
        return {
            pending: await this.feedbackService.getPendingCount(developer.id),
            resolved: await this.feedbackService.getResolvedCount(developer.id),
            rejected: await this.feedbackService.getRejectedCount(developer.id),
        };
    }

    @Post('set-status')
    async setStatus(@TakeDeveloper() developer: any, @Body() dto: SetFeedbackStatusDto) {
        await this.feedbackService.setStatusByIds(developer.id, dto.ids, dto.status as FeedbackStatus);
        return null;
    }

    @Post('delete')
    async delete(@TakeDeveloper() developer: any, @Body() dto: DeleteFeedbackDto) {
        await this.feedbackService.deleteByIds(developer.id, dto.ids);
        return null;
    }
}
