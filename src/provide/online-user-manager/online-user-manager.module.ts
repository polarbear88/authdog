import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { OnlineUser } from './online-user.entity';
import { OnlineUserManagerService } from './online-user-manager.service';
import { AuthdogApiModule } from 'src/helpers/authdog-api/authdog-api.module';

@Module({
    imports: [TypeOrmModule.forFeature([OnlineUser]), AuthdogApiModule],
    providers: [OnlineUserManagerService],
    exports: [OnlineUserManagerService],
})
export class OnlineUserManagerModule {}
