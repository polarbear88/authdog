import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Feedback } from './feedback.entity';
import { FeedbackService } from './feedback.service';

@Module({
    imports: [TypeOrmModule.forFeature([Feedback])],
    providers: [FeedbackService],
    exports: [FeedbackService],
})
export class FeedbackModule {}
