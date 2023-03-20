import { Module, SetMetadata } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { DeveloperController } from './controller/developer.controller';
import { Developer } from './developer.entity';
import { DeveloperService } from './developer.service';
import { MODULE_PATH } from '@nestjs/common/constants';
import { AuthModule } from 'src/auth/auth.module';
import { ProfileController } from './controller/profile.controller';
import { DeveloperActionLogModule } from './action-log/developer-action-log.module';
import { ApplicationModule } from 'src/application/application.module';
import { ApplicationController } from './controller/application.controller';
import { CloudvarModule } from 'src/cloudvar/cloudvar.module';
import { CloudvarController } from './controller/cloudvar.controller';

// 设置此模块路由前缀
@SetMetadata(MODULE_PATH, 'developer')
@Module({
    imports: [TypeOrmModule.forFeature([Developer]), AuthModule, DeveloperActionLogModule, ApplicationModule, CloudvarModule],
    controllers: [DeveloperController, ProfileController, ApplicationController, CloudvarController],
    providers: [DeveloperService],
})
export class DeveloperModule {}
