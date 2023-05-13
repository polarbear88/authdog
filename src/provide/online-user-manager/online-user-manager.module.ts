import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { OnlineUser } from './online-user.entity';
import { OnlineUserManagerService } from './online-user-manager.service';

@Module({
    imports: [TypeOrmModule.forFeature([OnlineUser])],
    providers: [OnlineUserManagerService],
    exports: [OnlineUserManagerService],
})
export class OnlineUserManagerModule {}
