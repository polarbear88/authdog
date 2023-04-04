import { Body, Controller, Post, Req, SetMetadata, UseInterceptors } from '@nestjs/common';
import { Throttle } from '@nestjs/throttler';
import { Application } from 'src/application/application.entity';
import { BaseController } from 'src/common/controller/base.controller';
import { Public } from 'src/common/decorator/public.decorator';
import { CreateFeedbackDto } from 'src/feedback/feedback.dto';
import { FeedbackService } from 'src/feedback/feedback.service';
import { ApiUserDeviceInterceptor } from '../api-user-device.interceptor';
import { ApiTakeApp } from '../decorator/api-take-app.decorator';

@Public()
@UseInterceptors(ApiUserDeviceInterceptor)
@Controller({ version: '1' })
export class ApiFeedbackController extends BaseController {
    constructor(private feedbackService: FeedbackService) {
        super();
    }

    @Throttle(10, 3600)
    @Post('send')
    async get(@ApiTakeApp() app: Application, @Body() dto: CreateFeedbackDto, @Req() req: any) {
        await this.feedbackService.create(app, req['clientVersion'], dto);
        return null;
    }
}
