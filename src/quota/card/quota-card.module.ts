import { TypeOrmModule } from '@nestjs/typeorm';
import { QuotaCard } from './quota-card.entity';
import { Module } from '@nestjs/common';
import { QuotaCardService } from './quota-card.service';

@Module({
    imports: [TypeOrmModule.forFeature([QuotaCard])],
    controllers: [],
    providers: [QuotaCardService],
    exports: [QuotaCardService],
})
export class QuotaCardModule {}
