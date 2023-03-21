import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ApplicationModule } from 'src/application/application.module';
import { Cloudvar } from './cloudvar.entity';
import { CloudvarService } from './cloudvar.service';

@Module({
    imports: [TypeOrmModule.forFeature([Cloudvar]), ApplicationModule],
    providers: [CloudvarService],
    exports: [CloudvarService],
})
export class CloudvarModule {}
