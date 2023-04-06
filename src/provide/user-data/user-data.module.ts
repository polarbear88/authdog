import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { UserData } from './user-data.entity';
import { UserDataService } from './user-data.service';

@Module({
    imports: [TypeOrmModule.forFeature([UserData])],
    providers: [UserDataService],
    exports: [UserDataService],
})
export class UserDataModule {}
