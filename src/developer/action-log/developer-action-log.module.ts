import { Module, SetMetadata } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { MODULE_PATH } from '@nestjs/common/constants';
import { DeveloperActionLog } from './developer-action-log.entity';
import { DeveloperActionLogService } from './developer-action-log.service';

// 设置此模块路由前缀
@SetMetadata(MODULE_PATH, 'log')
@Module({
    imports: [TypeOrmModule.forFeature([DeveloperActionLog])],
    controllers: [],
    providers: [DeveloperActionLogService],
    exports: [DeveloperActionLogService],
})
export class DeveloperActionLogModule {}
