import { Module, SetMetadata } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { DeveloperController } from './developer.controller';
import { Developer } from './developer.entity';
import { DeveloperService } from './developer.service';
import { MODULE_PATH } from '@nestjs/common/constants';
import { AuthModule } from 'src/auth/auth.module';

// 设置此模块路由前缀
@SetMetadata(MODULE_PATH, 'developer')
@Module({
    imports: [TypeOrmModule.forFeature([Developer]), AuthModule],
    controllers: [DeveloperController],
    providers: [DeveloperService],
})
export class DeveloperModule {}
