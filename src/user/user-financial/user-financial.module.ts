import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { UserFinancial } from './user-financial.entity';
import { UserFinancialService } from './user-financial.service';

@Module({
    imports: [TypeOrmModule.forFeature([UserFinancial])],
    providers: [UserFinancialService],
    exports: [UserFinancialService],
})
export class UserFinancialModule {}
