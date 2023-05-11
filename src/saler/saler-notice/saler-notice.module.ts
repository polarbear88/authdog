import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { SalerNotice } from './saler-notice.entity';
import { SalerNoticeService } from './saler-notice.service';

@Module({
    imports: [TypeOrmModule.forFeature([SalerNotice])],
    providers: [SalerNoticeService],
    exports: [SalerNoticeService],
})
export class SalerNoticeModule {}
