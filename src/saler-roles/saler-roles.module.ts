import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { SalerRoles } from './saler-roles.entity';
import { SalerRolesService } from './saler-roles.service';

@Module({
    imports: [TypeOrmModule.forFeature([SalerRoles])],
    providers: [SalerRolesService],
    exports: [SalerRolesService],
})
export class SalerRolesModule {}
