import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ApplicationModule } from 'src/application/application.module';
import { Cloudfun } from './cloudfun.entity';
import { CloudfunService } from './cloudfun.service';

@Module({
    imports: [TypeOrmModule.forFeature([Cloudfun]), ApplicationModule],
    providers: [CloudfunService],
    exports: [CloudfunService],
})
export class CloudfunModule {}
