import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { SalerEntryLink } from './entry-link.entity';
import { SalerEntryLinkService } from './entry-link.service';

@Module({
    imports: [TypeOrmModule.forFeature([SalerEntryLink])],
    providers: [SalerEntryLinkService],
    exports: [SalerEntryLinkService],
})
export class SalerEntryLinkModule {}
