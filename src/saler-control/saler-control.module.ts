import { Module, SetMetadata } from '@nestjs/common';
import { MODULE_PATH } from '@nestjs/common/constants';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { JwtModule } from '@nestjs/jwt';
import { ApplicationModule } from 'src/application/application.module';
import { DeveloperModule } from 'src/developer/developer.module';
import { FundFlowModule } from 'src/fund-flow/fund-flow.module';
import { RechargeCardTypeModule } from 'src/recharge-card/card-type/recharge-card-type.module';
import { RechargeCardModule } from 'src/recharge-card/recharge-card.module';
import { SalerModule } from 'src/saler/saler.module';
import { RechargeCardController } from './controller/recharge-card.controller';
import { SalerController } from './controller/saler.controller';
import { SalerControlService } from './saler-control.service';
import { SubordinateController } from './controller/subordinate.controller';
import { SalerEntryLinkModule } from 'src/saler/entry-link/entry-link.module';
import { SubordinateEntryController } from './controller/subordinate-entry-link.controller';
import { ProfileController } from './controller/profile.contoller';
import { FundFlowController } from './controller/fund-flow.controller';
import { StatisticsController } from './controller/statistics.controller';
import { ManMachineInspectModule } from 'src/man-machine-inspect/man-machine-inspect.module';

// saler的控制器不能放在saler模块中，因为saler控制器需要访问developer的service，
// 而developer又依赖saler的service，这样就会造成循环依赖，所以这里把saler的控制器单独放在一个模块中
@SetMetadata(MODULE_PATH, 'saler')
@Module({
    imports: [
        JwtModule.registerAsync({
            imports: [ConfigModule],
            inject: [ConfigService],
            useFactory: (configService: ConfigService) => ({
                secret: configService.get('APP_JWT_SECRET'),
                signOptions: { expiresIn: '24h' },
            }),
        }),
        SalerModule,
        DeveloperModule,
        ApplicationModule,
        RechargeCardTypeModule,
        RechargeCardModule,
        FundFlowModule,
        SalerEntryLinkModule,
        FundFlowModule,
        ManMachineInspectModule,
    ],
    providers: [SalerControlService],
    controllers: [
        SalerController,
        RechargeCardController,
        SubordinateController,
        SubordinateEntryController,
        ProfileController,
        FundFlowController,
        StatisticsController,
    ],
})
export class SalerControlModule {}
