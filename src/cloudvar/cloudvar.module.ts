import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Cloudvar } from './cloudvar.entity';
import { CloudvarService } from './cloudvar.service';

@Module({
    imports: [TypeOrmModule.forFeature([Cloudvar])],
    providers: [CloudvarService],
    exports: [CloudvarService],
})
export class CloudvarModule {}
