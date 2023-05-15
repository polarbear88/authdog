import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ApplicationModule } from 'src/provide/application/application.module';
import { Cloudfun } from './cloudfun.entity';
import { CloudfunService } from './cloudfun.service';
import { AuthdogApiModule } from 'src/helpers/authdog-api/authdog-api.module';

@Module({
    imports: [TypeOrmModule.forFeature([Cloudfun]), ApplicationModule, AuthdogApiModule],
    providers: [CloudfunService],
    exports: [CloudfunService],
})
export class CloudfunModule {}
