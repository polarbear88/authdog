import { Body, Controller, Post, UseGuards, UseInterceptors } from '@nestjs/common';
import { Public } from 'src/common/decorator/public.decorator';
import { ApiUserOrDevicePaidGuard } from '../api-user-or-device-paid.guard';
import { ApiUserDeviceInterceptor } from '../api-user-device.interceptor';
import { BaseController } from 'src/common/controller/base.controller';
import { UserFinancialService } from 'src/user/user-financial/user-financial.service';
import { ApiTakeApp } from '../decorator/api-take-app.decorator';
import { Application } from 'src/provide/application/application.entity';
import { ApiTakeUser } from '../decorator/api-take-user.decorator';
import { User } from 'src/user/user/user.entity';
import { Device } from 'src/user/device/device.entity';
import { GetPageDto } from 'src/common/dto/get-page.dto';

@Public()
@UseGuards(ApiUserOrDevicePaidGuard)
@UseInterceptors(ApiUserDeviceInterceptor)
@Controller({ version: '1' })
export class ApiUserFinancialController extends BaseController {
    constructor(private userFinancialService: UserFinancialService) {
        super();
    }

    @Post('getList')
    async getList(@ApiTakeApp() app: Application, @ApiTakeUser() user: User | Device, @Body() dto: GetPageDto) {
        const data = await this.userFinancialService.findByUserId(app.id, user.id, dto);
        return data.map((item: any) => {
            item.createdAt = item.createdAt.getTime();
            return item;
        });
    }
}
