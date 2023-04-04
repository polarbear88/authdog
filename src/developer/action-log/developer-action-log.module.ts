import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { DeveloperActionLog } from './developer-action-log.entity';
import { DeveloperActionLogService } from './developer-action-log.service';

@Module({
    imports: [TypeOrmModule.forFeature([DeveloperActionLog])],
    controllers: [],
    providers: [DeveloperActionLogService],
    exports: [DeveloperActionLogService],
})
export class DeveloperActionLogModule {}
