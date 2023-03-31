import { Module, SetMetadata } from '@nestjs/common';
import { MODULE_PATH } from '@nestjs/common/constants';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { JwtModule } from '@nestjs/jwt';
import { DeveloperModule } from 'src/developer/developer.module';
import { SalerModule } from 'src/saler/saler.module';
import { SalerController } from './controller/saler.controller';

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
    ],
    controllers: [SalerController],
})
export class SalerControlModule {}
