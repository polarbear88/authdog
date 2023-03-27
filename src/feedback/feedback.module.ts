import { Module } from '@nestjs/common';
import { FeedbackService } from './feedback.service';

@Module({
    providers: [FeedbackService],
})
export class FeedbackModule {}
